// Browser-only experience gate. Never authorizes a server API or verifies email ownership.
import { z } from "zod";
import { accountInput } from "./auth-contracts.ts";
import {
  demoAccountsSchema,
  storedWorkspaceSchema,
  saveOperationSchema,
  profileOperationSchema,
} from "./demo-contracts.ts";
const accountKey = "utsavops-demo-accounts-v1";
const sessionKey = "utsavops-demo-session-v1";
function readStored<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      "Stored demo data is unreadable. Export or back up browser data before resetting it.",
    );
  }
}
function accounts() {
  return readStored(accountKey, demoAccountsSchema, []);
}
export function demoUser() {
  const id = sessionStorage.getItem(sessionKey);
  return accounts().find((account) => account.id === id) || null;
}
async function digest(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 210000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}
export async function demoFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const reply = (value: unknown, status = 200) =>
    Response.json(value, { status });
  try {
    if (!["/api/account", "/api/workspace", "/api/plan"].includes(url))
      return reply({ error: "Unknown demo operation." }, 404);
    const raw = init?.body ? String(init.body) : "{}";
    if (raw.length > 750000)
      return reply({ error: "Demo entry is too large." }, 413);
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return reply({ error: "Invalid JSON request." }, 400);
    }
    if (url === "/api/account") {
      if (!init) return reply({ configured: true });
      const parsed = accountInput.safeParse(body);
      if (!parsed.success)
        return reply({ error: parsed.error.issues[0].message }, 400);
      const input = parsed.data;
      if (input.action === "logout") {
        sessionStorage.removeItem(sessionKey);
        return reply({ ok: true });
      }
      if (input.action === "reset")
        return reply(
          { error: "Use the explicit demo-account reset option." },
          400,
        );
      const all = accounts(),
        email = (input.email || "").trim().toLowerCase();
      if (input.action === "recover") {
        const target = all.find((account) => account.email === email);
        if (target) {
          const active = demoUser()?.id === target.id;
          localStorage.setItem(
            accountKey,
            JSON.stringify(all.filter((account) => account.id !== target.id)),
          );
          localStorage.removeItem("utsavops-demo-data-" + target.id);
          if (active) sessionStorage.removeItem(sessionKey);
        }
        return reply({
          message:
            "Demo account cleared on this browser. Register again to start fresh. No email was sent.",
        });
      }
      if (input.action === "register") {
        if (all.some((account) => account.email === email))
          return reply(
            {
              error:
                "A demo account already exists on this browser. Sign in or reset it.",
            },
            409,
          );
        if (all.length >= 100)
          return reply(
            { error: "This browser has reached its demo-account limit." },
            400,
          );
        const salt = crypto.randomUUID(),
          account = {
            id: crypto.randomUUID(),
            email,
            name: input.name!,
            salt,
            hash: await digest(input.password!, salt),
          };
        localStorage.setItem(accountKey, JSON.stringify([...all, account]));
        sessionStorage.setItem(sessionKey, account.id);
        return reply({ redirect: "/workspace" });
      }
      const account = all.find((entry) => entry.email === email);
      if (
        !account ||
        (await digest(input.password!, account.salt)) !== account.hash
      )
        return reply(
          {
            error:
              "Email or password does not match this browser’s demo account.",
          },
          400,
        );
      sessionStorage.setItem(sessionKey, account.id);
      return reply({ redirect: "/workspace" });
    }
    const user = demoUser();
    if (!user) return reply({ error: "Sign in to the demo." }, 401);
    if (url === "/api/plan") return globalThis.fetch(url, init);
    const dataKey = "utsavops-demo-data-" + user.id;
    const data = readStored(dataKey, storedWorkspaceSchema, {
      profile: null,
      events: [],
    });
    if (!init)
      return reply({ ...data, user: { name: user.name, email: user.email } });
    const profile = profileOperationSchema.safeParse(body);
    if (profile.success) {
      localStorage.setItem(
        dataKey,
        JSON.stringify({ ...data, profile: profile.data.profile }),
      );
      return reply({ ok: true });
    }
    const save = saveOperationSchema.safeParse(body);
    if (!save.success)
      return reply(
        { error: "Invalid event entry. Review the brief, budget and tasks." },
        400,
      );
    const input = save.data,
      existing = data.events.find((event) => event.id === input.id);
    if (input.id && (!existing || existing.revision !== input.revision))
      return reply(
        { error: "This event changed elsewhere. Reload orders before saving." },
        409,
      );
    if (!input.id && data.events.length >= 100)
      return reply(
        {
          error: "Export your events before adding more than 100 demo orders.",
        },
        400,
      );
    const result = {
      id: input.id || crypto.randomUUID(),
      revision: (existing?.revision || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    const event = { ...result, state: input.state, status: input.status };
    const next = {
      ...data,
      events: [event, ...data.events.filter((entry) => entry.id !== result.id)],
    };
    localStorage.setItem(dataKey, JSON.stringify(next));
    return reply(result);
  } catch (error) {
    return reply(
      {
        error:
          error instanceof Error && error.message.startsWith("Stored demo data")
            ? error.message
            : "Browser storage is unavailable or full. Keep this page open and export your plan before retrying.",
      },
      503,
    );
  }
}

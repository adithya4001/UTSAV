import test, { beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { demoFetch, demoUser } from "../lib/demo-account.ts";
import type { SaveResponse, WorkspaceResponse } from "../lib/domain-types.ts";
import { seed } from "../lib/engine.mjs";
function memory() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) || null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
    clear: () => entries.clear(),
    key: (index: number) => [...entries.keys()][index] || null,
    get length() {
      return entries.size;
    },
  };
}
const originalLocal = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  ),
  originalSession = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: memory(),
    configurable: true,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    value: memory(),
    configurable: true,
  });
});
after(() => {
  if (originalLocal)
    Object.defineProperty(globalThis, "localStorage", originalLocal);
  else Reflect.deleteProperty(globalThis, "localStorage");
  if (originalSession)
    Object.defineProperty(globalThis, "sessionStorage", originalSession);
  else Reflect.deleteProperty(globalThis, "sessionStorage");
});
const post = (url: string, body: unknown) =>
  demoFetch(url, { method: "POST", body: JSON.stringify(body) });
const register = () =>
  post("/api/account", {
    action: "register",
    name: "QA organiser",
    email: "qa@example.test",
    password: "Disposable-test-2026",
  });
test("anonymous workspace is gated", async () =>
  assert.equal((await demoFetch("/api/workspace")).status, 401));
test("registration hashes the password and excludes it from workspace responses", async () => {
  assert.equal((await register()).status, 200);
  assert.ok(
    !localStorage
      .getItem("utsavops-demo-accounts-v1")!
      .includes("Disposable-test-2026"),
  );
  const r = await (await demoFetch("/api/workspace")).text();
  assert.ok(!r.includes("hash"));
  assert.ok(!r.includes("salt"));
});
test("duplicate registration does not replace the existing account", async () => {
  await register();
  assert.equal((await register()).status, 409);
  assert.equal(
    JSON.parse(localStorage.getItem("utsavops-demo-accounts-v1")!).length,
    1,
  );
});
test("logout and password checks behave consistently", async () => {
  await register();
  await post("/api/account", { action: "logout" });
  assert.equal(demoUser(), null);
  assert.equal(
    (
      await post("/api/account", {
        action: "login",
        email: "qa@example.test",
        password: "wrong",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await post("/api/account", {
        action: "login",
        email: "qa@example.test",
        password: "Disposable-test-2026",
      })
    ).status,
    200,
  );
});
test("invalid event data cannot overwrite a valid event", async () => {
  await register();
  const saved = await (
    await post("/api/workspace", {
      action: "save",
      state: seed(),
      status: "Planning",
    })
  ).json() as SaveResponse;
  const broken = seed();
  broken.items[0].paid = 9999999;
  assert.equal(
    (
      await post("/api/workspace", {
        action: "save",
        id: saved.id,
        revision: saved.revision,
        state: broken,
        status: "Planning",
      })
    ).status,
    400,
  );
  const data = await (await demoFetch("/api/workspace")).json() as WorkspaceResponse;
  assert.equal(data.events[0].state.items[0].paid, 40000);
});
test("revision conflicts preserve the newer saved plan", async () => {
  await register();
  const saved = await (
    await post("/api/workspace", {
      action: "save",
      state: seed(),
      status: "Planning",
    })
  ).json() as SaveResponse;
  const body = {
    action: "save",
    id: saved.id,
    revision: saved.revision,
    state: seed(),
    status: "Confirmed",
  };
  assert.equal((await post("/api/workspace", body)).status, 200);
  assert.equal((await post("/api/workspace", body)).status, 409);
});
test("a demo cannot overwrite another account’s order id", async () => {
  await register();
  const saved = await (
    await post("/api/workspace", {
      action: "save",
      state: seed(),
      status: "Planning",
    })
  ).json() as SaveResponse;
  await post("/api/account", {
    action: "register",
    name: "Other",
    email: "other@example.test",
    password: "Other-password-2026",
  });
  assert.equal(
    (
      await post("/api/workspace", {
        action: "save",
        id: saved.id,
        revision: 1,
        state: seed(),
        status: "Planning",
      })
    ).status,
    409,
  );
});
test("corrupt local data is reported without silently erasing it", async () => {
  await register();
  const key = "utsavops-demo-data-" + demoUser()!.id;
  localStorage.setItem(key, "{corrupt");
  assert.equal((await demoFetch("/api/workspace")).status, 503);
  assert.equal(localStorage.getItem(key), "{corrupt");
});
test("demo reset clears only the selected local account and active session", async () => {
  await register();
  const id = demoUser()!.id;
  await post("/api/workspace", {
    action: "save",
    state: seed(),
    status: "Planning",
  });
  await post("/api/account", { action: "recover", email: "qa@example.test" });
  assert.equal(demoUser(), null);
  assert.equal(sessionStorage.getItem("utsavops-demo-session-v1"), null);
  assert.equal(localStorage.getItem("utsavops-demo-data-" + id), null);
});

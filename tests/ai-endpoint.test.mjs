import test, { after } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/plan.mjs";
const originalFetch = globalThis.fetch;
const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;
after(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.GEMINI_MODEL;
  else process.env.GEMINI_MODEL = originalModel;
});
const brief = {
  name: "DO NOT SEND",
  venue: "DO NOT SEND",
  type: "Wedding",
  city: "Hyderabad",
  guests: 150,
  budget: 300000,
  preferences: "Vegetarian and accessible",
};
const plan = {
  theme: "Heritage celebration",
  vision: "An accessible vegetarian celebration.",
  ideas: ["A", "B", "C"],
  menu: ["D", "E", "F"],
  questions: ["G", "H", "I"],
};
const completion = (value = plan) => ({
  candidates: [
    {
      finishReason: "STOP",
      content: { parts: [{ text: JSON.stringify(value) }] },
    },
  ],
});
let number = 0;
async function call(options = {}) {
  const response = {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
  const request = {
    method: "POST",
    headers: {
      host: "demo.test",
      origin: "https://demo.test",
      "content-type": "application/json",
      "x-vercel-forwarded-for": `test-${++number}`,
    },
    body: brief,
    ...options,
  };
  await handler(request, response);
  return response;
}
test("configuration never exposes the API key", async () => {
  process.env.GEMINI_API_KEY = "mock-secret";
  const r = await call({ method: "GET" });
  assert.equal(r.body.configured, true);
  assert.ok(!JSON.stringify(r.body).includes("mock-secret"));
});
test("missing configuration fails without a provider call", async () => {
  delete process.env.GEMINI_API_KEY;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
  };
  assert.equal((await call()).code, 503);
  assert.equal(called, false);
});
test("rejects a cross-origin request before model access", async () => {
  process.env.GEMINI_API_KEY = "mock-secret";
  assert.equal(
    (
      await call({
        headers: { host: "demo.test", origin: "https://other.test" },
      })
    ).code,
    403,
  );
});
test("rejects invalid guest counts, excessive preferences and malformed JSON", async () => {
  for (const body of [
    { ...brief, guests: 0 },
    { ...brief, preferences: "x".repeat(2001) },
    "{",
  ])
    assert.equal((await call({ body })).code, 400);
});
test("rejects an oversized request before parsing it", async () => {
  assert.equal((await call({ body: "x".repeat(12001) })).code, 413);
});
test("unsupported methods return an Allow header", async () => {
  const r = await call({ method: "DELETE" });
  assert.equal(r.code, 405);
  assert.equal(r.headers.Allow, "GET, POST");
});
test("valid model output is labelled and client name/venue are not transmitted", async () => {
  delete process.env.GEMINI_MODEL;
  process.env.GEMINI_API_KEY = "mock-secret";
  let sent;
  globalThis.fetch = async (url, options) => {
    sent = JSON.parse(options.body);
    assert.ok(url.includes("gemini-3.5-flash-lite"));
    return Response.json(completion());
  };
  const r = await call();
  assert.equal(r.code, 200);
  assert.match(r.body.source, /Gemini/);
  assert.deepEqual(r.body.menu, plan.menu);
  const context = JSON.parse(sent.contents[0].parts[0].text);
  assert.ok(!("name" in context));
  assert.ok(!("venue" in context));
  assert.equal(sent.generationConfig.thinkingConfig.thinkingLevel, "minimal");
});
test("503 is retried once and a subsequent valid response succeeds", async () => {
  let n = 0;
  globalThis.fetch = async () =>
    ++n === 1
      ? Response.json({}, { status: 503 })
      : Response.json(completion());
  assert.equal((await call()).code, 200);
  assert.equal(n, 2);
});
test("persistent upstream overload stops after two attempts", async () => {
  let n = 0;
  globalThis.fetch = async () => {
    n++;
    return Response.json({}, { status: 503 });
  };
  const r = await call();
  assert.equal(n, 2);
  assert.equal(r.body.upstreamStatus, 503);
  assert.equal(r.code, 502);
});
test("quota errors are not retried", async () => {
  let n = 0;
  globalThis.fetch = async () => {
    n++;
    return Response.json({}, { status: 429 });
  };
  assert.equal((await call()).code, 429);
  assert.equal(n, 1);
});
test("authentication failures are not retried or echoed", async () => {
  let n = 0;
  globalThis.fetch = async () => {
    n++;
    return Response.json(
      { error: { message: "mock-secret" } },
      { status: 403 },
    );
  };
  const r = await call();
  assert.equal(r.code, 502);
  assert.equal(n, 1);
  assert.ok(!JSON.stringify(r.body).includes("mock-secret"));
});
test("incomplete or malformed model output never becomes a draft", async () => {
  for (const output of [
    completion({ theme: "Incomplete" }),
    { candidates: [{ finishReason: "MAX_TOKENS" }] },
  ]) {
    globalThis.fetch = async () => Response.json(output);
    assert.equal((await call()).code, 502);
  }
});
test("warm-instance throttling blocks the sixth request", async () => {
  globalThis.fetch = async () => Response.json(completion());
  const headers = {
    host: "demo.test",
    origin: "https://demo.test",
    "content-type": "application/json",
    "x-vercel-forwarded-for": "rate-case",
  };
  for (let i = 0; i < 5; i++) assert.equal((await call({ headers })).code, 200);
  const r = await call({ headers });
  assert.equal(r.code, 429);
  assert.equal(r.headers["Retry-After"], "600");
});

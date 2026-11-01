import test from "node:test";
import assert from "node:assert/strict";
import { applyAiDraft } from "../lib/ai-state.ts";
import { seed } from "../lib/engine.mjs";
const draft = {
  theme: "Test",
  vision: "Test",
  ideas: ["A"],
  menu: ["B"],
  questions: ["C"],
  source: "Gemini · AI draft",
};
test("an AI response preserves budget edits made while generation was running", () => {
  const initial = seed();
  const edited = structuredClone(initial);
  edited.items[0].amount += 1000;
  const result = applyAiDraft(edited, initial.brief, draft);
  assert.equal(result.items[0].amount, 161000);
  assert.deepEqual(result.proposals, edited.proposals);
  assert.deepEqual(result.history, edited.history);
  assert.equal(edited.blueprint, null);
});
test("AI response for an old brief is discarded", () => {
  const initial = seed();
  const edited = structuredClone(initial);
  edited.brief.guests = 250;
  assert.equal(applyAiDraft(edited, initial.brief, draft), edited);
});
test("invalid AI output is rejected without mutating the working plan", () => {
  const initial = seed(),
    before = JSON.stringify(initial);
  assert.throws(() =>
    applyAiDraft(initial, initial.brief, { theme: "missing fields" }),
  );
  assert.equal(JSON.stringify(initial), before);
});

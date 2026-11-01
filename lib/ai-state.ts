import { blueprintSchema } from "./contracts.ts";
import type { EventState, EventBriefData } from "./domain-types";
// AI may replace creative copy only. Preserve budget edits and approval records made while it ran.
export function applyAiDraft(
  current: EventState,
  requestedBrief: EventBriefData,
  draft: unknown,
): EventState {
  if (JSON.stringify(current.brief) !== JSON.stringify(requestedBrief))
    return current;
  return { ...current, blueprint: blueprintSchema.parse(draft) };
}

import type { EventBriefData, EventState, Blueprint } from "./domain-types";
export const createEventPlan: (b: EventBriefData) => EventState;
export const creativeBlueprint: (b: EventBriefData) => Blueprint;
export const nextAction: (s: EventState) => string;

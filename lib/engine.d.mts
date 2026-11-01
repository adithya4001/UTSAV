import type {
  EventBriefData,
  EventState,
  Task,
  Proposal,
  Blueprint,
} from "./domain-types";
export const money: (n: number) => string;
export const validateBrief: (b: unknown) => EventBriefData;
export const seed: () => EventState;
export const totals: (s: EventState) => {
  committed: number;
  paid: number;
  reserve: number;
  remaining: number;
  outstanding: number;
};
export const guestProposal: (s: EventState, n: number) => Proposal;
export const delayProposal: (s: EventState, n: number) => Proposal;
export const shiftTime: (t: string, n: number) => string;
export const approve: (s: EventState, id: string) => EventState;
export const conflicts: (t: Task[]) => string[];
export const sampleBlueprint: (b: EventBriefData) => Blueprint;

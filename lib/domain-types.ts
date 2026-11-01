import type { z } from "zod";
import type { briefSchema, profileSchema, stateSchema } from "./contracts";
export type EventBriefData = z.infer<typeof briefSchema>;
export type EventState = z.infer<typeof stateSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Task = EventState["tasks"][number];
export type Proposal = EventState["proposals"][number];
export type BudgetItem = EventState["items"][number];
export type Blueprint = NonNullable<EventState["blueprint"]>;
export type OrderStatus =
  | "Enquiry"
  | "Confirmed"
  | "Planning"
  | "Live"
  | "Completed";
export interface Order {
  id: string | null;
  state: EventState;
  status: OrderStatus;
  revision: number;
  updatedAt?: string;
}
export interface Organiser {
  name: string;
  email: string;
}
export interface WorkspaceResponse {
  user: Organiser;
  profile: Profile | null;
  events: Order[];
  error?: string;
}
export interface SaveResponse {
  id: string;
  revision: number;
  updatedAt: string;
  error?: string;
}
export const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The operation could not finish. Please try again.";

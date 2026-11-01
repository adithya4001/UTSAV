import { z } from "zod";
import { profileSchema, stateSchema, orderStatus } from "./contracts.ts";
export const demoAccountSchema = z.object({
  id: z.string().min(1).max(100),
  email: z.string().email().max(254),
  name: z.string().min(1).max(100),
  salt: z.string().min(1).max(100),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
});
export const demoAccountsSchema = z.array(demoAccountSchema).max(100);
export const storedOrderSchema = z.object({
  id: z.string().min(1).max(100),
  state: stateSchema,
  status: orderStatus,
  revision: z.number().int().positive(),
  updatedAt: z.string().max(100),
});
export const storedWorkspaceSchema = z.object({
  profile: profileSchema.nullable(),
  events: z.array(storedOrderSchema).max(100),
});
export const saveOperationSchema = z.object({
  action: z.literal("save"),
  id: z.string().min(1).max(100).nullable().optional(),
  revision: z.number().int().positive().optional(),
  state: stateSchema,
  status: orderStatus,
});
export const profileOperationSchema = z.object({
  action: z.literal("profile"),
  profile: profileSchema,
});
export type DemoAccount = z.infer<typeof demoAccountSchema>;

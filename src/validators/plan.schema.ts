import { z } from "zod";
import { objectIdSchema } from "./common";

export const GOALS = [
  "hydration",
  "glow",
  "relaxation",
  "anti_aging",
  "evenness",
  "soothing",
] as const;

export const BUDGET_TIERS = ["value", "standard", "premium"] as const;

export const IntakeContextSchema = z.object({
  goals: z.array(z.enum(GOALS)).min(1, "Pick at least one goal"),
  sensitivities: z.array(z.string()).default([]),
  lengthOfStayDays: z.number().int().min(1).max(14),
  budgetTier: z.enum(BUDGET_TIERS),
});

export const CreatePlanSchema = z.object({
  assessmentId: objectIdSchema,
  context: IntakeContextSchema,
});
export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

import { z } from "zod";
import { INGREDIENT_ROLES } from "@/models/Ingredient";
import { TREATMENT_CATEGORIES } from "@/models/Treatment";
import { objectIdSchema } from "./common";

const IngredientLinkSchema = z.object({
  ingredientId: objectIdSchema,
  name: z.string().min(1),
  role: z.enum(INGREDIENT_ROLES).optional(),
  irritantForSensitive: z.boolean(),
});

export const CreateTreatmentSchema = z.object({
  name: z.string().min(1),
  category: z.enum(TREATMENT_CATEGORIES),
  description: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  priceETB: z.number().nonnegative(),
  targetAttributes: z.array(z.string()).default([]),
  ingredients: z.array(IngredientLinkSchema).default([]),
  active: z.boolean().default(true),
});
export type CreateTreatmentInput = z.infer<typeof CreateTreatmentSchema>;

export const UpdateTreatmentSchema = CreateTreatmentSchema.partial();
export type UpdateTreatmentInput = z.infer<typeof UpdateTreatmentSchema>;

export const SetActiveSchema = z.object({ active: z.boolean() });
export type SetActiveInput = z.infer<typeof SetActiveSchema>;

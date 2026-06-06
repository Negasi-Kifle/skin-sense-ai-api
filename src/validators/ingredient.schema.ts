import { z } from "zod";
import { INGREDIENT_ROLES } from "@/models/Ingredient";

export const CreateIngredientSchema = z.object({
  name: z.string().min(1).trim(),
  role: z.enum(INGREDIENT_ROLES).optional(),
  irritantForSensitive: z.boolean(),
});
export type CreateIngredientInput = z.infer<typeof CreateIngredientSchema>;

export const UpdateIngredientSchema = CreateIngredientSchema.partial();
export type UpdateIngredientInput = z.infer<typeof UpdateIngredientSchema>;

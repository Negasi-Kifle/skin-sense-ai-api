import { Schema, model, type InferSchemaType, type Model } from "mongoose";

export const INGREDIENT_ROLES = [
  "active",
  "exfoliant",
  "fragrance",
  "moisturizer",
  "other",
] as const;
export type IngredientRole = (typeof INGREDIENT_ROLES)[number];

// Shared ingredient catalog — answers PRD OQ4 in favour of a library.
// Admins pick from this list when authoring a Treatment, which keeps the
// irritant flag consistent across services and lets us reason globally.
const IngredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    role: { type: String, enum: INGREDIENT_ROLES, default: undefined },
    irritantForSensitive: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export type IngredientDoc = InferSchemaType<typeof IngredientSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Ingredient: Model<IngredientDoc> = model<IngredientDoc>(
  "Ingredient",
  IngredientSchema
);

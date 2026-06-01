import { Schema, model, type InferSchemaType, type Model } from "mongoose";
import { INGREDIENT_ROLES } from "./Ingredient";

export const TREATMENT_CATEGORIES = ["facial", "body", "massage", "other"] as const;
export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number];

// Each Treatment carries an embedded snapshot of its ingredients so the plan
// generator can reason without an extra join. `ingredientId` links back to the
// shared catalog for admin edits and future analytics.
const TreatmentIngredientSchema = new Schema(
  {
    ingredientId: { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
    name: { type: String, required: true },
    role: { type: String, enum: INGREDIENT_ROLES, default: undefined },
    irritantForSensitive: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const TreatmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: TREATMENT_CATEGORIES, required: true },
    description: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    priceETB: { type: Number, required: true, min: 0 },
    targetAttributes: { type: [String], default: [] },
    ingredients: { type: [TreatmentIngredientSchema], default: [] },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true }
);

export type TreatmentDoc = InferSchemaType<typeof TreatmentSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Treatment: Model<TreatmentDoc> = model<TreatmentDoc>("Treatment", TreatmentSchema);

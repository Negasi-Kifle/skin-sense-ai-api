import { Schema, model, type InferSchemaType, type Model } from "mongoose";

// Mirrors PRD §7.1 SkinAttributes exactly. There is no medical/condition
// field — cosmetic-only by construction (PRD AI8). Do not add one.
export const SKIN_TYPES = ["dry", "normal", "combination", "oily"] as const;
export const LOW_MED_HIGH = ["low", "medium", "high"] as const;
export const TEXTURES = ["smooth", "uneven", "rough"] as const;
export const PIGMENTATION_EVENNESS = ["even", "slightly_uneven", "uneven"] as const;
export const ASSESSMENT_PROVIDERS = ["claude-vision", "mock"] as const;

const SkinAttributesSchema = new Schema(
  {
    skinType: { type: String, enum: SKIN_TYPES, required: true },
    hydration: { type: String, enum: LOW_MED_HIGH, required: true },
    oiliness: { type: String, enum: LOW_MED_HIGH, required: true },
    texture: { type: String, enum: TEXTURES, required: true },
    sensitivityHint: { type: String, enum: LOW_MED_HIGH, required: true },
    pigmentationEvenness: { type: String, enum: PIGMENTATION_EVENNESS, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const AssessmentSchema = new Schema(
  {
    guestId: { type: Schema.Types.ObjectId, ref: "Guest", required: true, index: true },
    therapistId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    attributes: { type: SkinAttributesSchema, required: true },
    provider: { type: String, enum: ASSESSMENT_PROVIDERS, required: true },
    imageRetained: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AssessmentDoc = InferSchemaType<typeof AssessmentSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Assessment: Model<AssessmentDoc> = model<AssessmentDoc>(
  "Assessment",
  AssessmentSchema
);

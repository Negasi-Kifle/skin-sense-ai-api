import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const PlanItemSchema = new Schema(
  {
    treatmentId: { type: Schema.Types.ObjectId, ref: "Treatment", required: true },
    dayOfStay: { type: Number, required: true, min: 1 },
    rationale: { type: String, required: true },
    // PRD FR9 / AI6 — surfaced when sensitivityHint is medium and an irritant
    // ingredient is present. High-sensitivity guests have these services
    // dropped entirely, not cautioned.
    caution: { type: String, required: false },
  },
  { _id: false }
);

const TreatmentPlanSchema = new Schema(
  {
    guestId: { type: Schema.Types.ObjectId, ref: "Guest", required: true, index: true },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    items: { type: [PlanItemSchema], default: [] },
    totalETB: { type: Number, required: true, min: 0 },
    totalDurationMinutes: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type TreatmentPlanDoc = InferSchemaType<typeof TreatmentPlanSchema> & {
  _id: Schema.Types.ObjectId;
};
export const TreatmentPlan: Model<TreatmentPlanDoc> = model<TreatmentPlanDoc>(
  "TreatmentPlan",
  TreatmentPlanSchema
);

import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const GoalSchema = new Schema(
  {
    value: { type: String, required: true, trim: true, unique: true, index: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export type GoalDoc = InferSchemaType<typeof GoalSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Goal: Model<GoalDoc> = model<GoalDoc>("Goal", GoalSchema);

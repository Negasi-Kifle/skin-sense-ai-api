import { Schema, model, type InferSchemaType, type Model } from "mongoose";

export const GUEST_SOURCES = ["staff", "public"] as const;

// PRD FR4: consent required and timestamped before any assessment.
const GuestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, trim: true },
    consentGiven: { type: Boolean, required: true },
    consentAt: { type: Date, required: true },
    source: { type: String, enum: GUEST_SOURCES, default: "staff" },
    sessionToken: { type: String, index: true, sparse: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, sparse: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type GuestDoc = InferSchemaType<typeof GuestSchema> & { _id: Schema.Types.ObjectId };
export const Guest: Model<GuestDoc> = model<GuestDoc>("Guest", GuestSchema);

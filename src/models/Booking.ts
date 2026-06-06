import { Schema, model, type InferSchemaType, type Model } from "mongoose";

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

const BookingItemSchema = new Schema(
  {
    treatmentId: { type: Schema.Types.ObjectId, ref: "Treatment", required: true },
    treatmentName: { type: String, required: true },
    scheduledDate: { type: Date, required: false },
    status: { type: String, enum: BOOKING_STATUSES, required: true, default: "pending" },
  },
  { _id: false }
);

const BookingSchema = new Schema(
  {
    planId: { type: Schema.Types.ObjectId, ref: "TreatmentPlan", required: true, index: true },
    guestId: { type: Schema.Types.ObjectId, ref: "Guest", required: true, index: true },
    // Denormalised guest name for cheap list views (PRD FR14).
    guestName: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", index: true, sparse: true },
    therapistName: { type: String, required: true },
    selectedItems: { type: [BookingItemSchema], default: [] },
    status: { type: String, enum: BOOKING_STATUSES, required: true, default: "pending", index: true },
    totalETB: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export type BookingDoc = InferSchemaType<typeof BookingSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Booking: Model<BookingDoc> = model<BookingDoc>("Booking", BookingSchema);

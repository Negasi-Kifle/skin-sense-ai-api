import { Schema, model, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["therapist", "admin", "customer"] as const;
export const STAFF_ROLES = ["therapist", "admin"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export type UserRole = (typeof USER_ROLES)[number];

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    isFirstTimeAccount: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: Schema.Types.ObjectId };
export const User: Model<UserDoc> = model<UserDoc>("User", UserSchema);

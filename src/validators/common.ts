import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), "Must be a valid Mongo ObjectId");

// Image base64 (no data: prefix). Reject anything unreasonable up front.
export const base64ImageSchema = z
  .string()
  .min(100, "imageBase64 too short to be a real image")
  .max(20_000_000, "imageBase64 exceeds maximum size");

export const mediaTypeSchema = z.enum(["image/jpeg", "image/png"]);

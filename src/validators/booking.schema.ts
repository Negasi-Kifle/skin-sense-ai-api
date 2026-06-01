import { z } from "zod";
import { BOOKING_STATUSES } from "@/models/Booking";
import { objectIdSchema } from "./common";

export const CreateBookingSchema = z.object({
  planId: objectIdSchema,
  // Subset of plan items the therapist actually wants to book (PRD FR12).
  selectedTreatmentIds: z.array(objectIdSchema).min(1),
});
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const ListBookingsQuerySchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  therapistId: objectIdSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});
export type ListBookingsQuery = z.infer<typeof ListBookingsQuerySchema>;

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
});
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;

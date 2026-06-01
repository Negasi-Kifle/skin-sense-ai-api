import type { Request, Response } from "express";
import {
  CreateBookingSchema,
  ListBookingsQuerySchema,
  UpdateBookingStatusSchema,
} from "@/validators/booking.schema";
import { objectIdSchema } from "@/validators/common";
import * as BookingService from "@/services/BookingService";
import { HttpError } from "@/utils/HttpError";

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw HttpError.unauthorized();
  const input = CreateBookingSchema.parse(req.body);
  const booking = await BookingService.createBooking(input, req.user.sub);
  res.status(201).json(booking);
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = ListBookingsQuerySchema.parse(req.query);
  const page = await BookingService.listBookings(query);
  res.json(page);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const id = objectIdSchema.parse(req.params.id);
  const booking = await BookingService.getBookingById(id);
  res.json(booking);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const id = objectIdSchema.parse(req.params.id);
  const input = UpdateBookingStatusSchema.parse(req.body);
  const updated = await BookingService.updateBookingStatus(id, input);
  res.json(updated);
}

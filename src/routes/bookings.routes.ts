import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as BookingsController from "@/controllers/bookings.controller";

export const bookingsRouter = Router();

bookingsRouter.get("/", requireAuth, requireRole("staff"), BookingsController.list);
bookingsRouter.get(
  "/:id",
  requireAuth,
  requireRole("staff", "customer"),
  BookingsController.getOne
);
bookingsRouter.post(
  "/",
  requireAuth,
  requireRole("therapist", "admin", "customer"),
  BookingsController.create
);
bookingsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("staff"),
  BookingsController.updateStatus
);

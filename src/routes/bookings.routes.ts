import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as BookingsController from "@/controllers/bookings.controller";

export const bookingsRouter = Router();

bookingsRouter.get("/", requireAuth, requireRole("staff"), BookingsController.list);
bookingsRouter.get("/:id", requireAuth, requireRole("staff"), BookingsController.getOne);
bookingsRouter.post(
  "/",
  requireAuth,
  requireRole("therapist", "admin"),
  BookingsController.create
);
bookingsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("staff"),
  BookingsController.updateStatus
);

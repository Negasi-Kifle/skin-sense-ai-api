import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as GuestsController from "@/controllers/guests.controller";

export const guestsRouter = Router();

guestsRouter.post(
  "/",
  requireAuth,
  requireRole("staff", "customer"),
  GuestsController.create
);

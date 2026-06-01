import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as PlansController from "@/controllers/plans.controller";

export const plansRouter = Router();

plansRouter.post(
  "/",
  requireAuth,
  requireRole("therapist", "admin"),
  PlansController.create
);

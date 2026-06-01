import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as AssessmentsController from "@/controllers/assessments.controller";

export const assessmentsRouter = Router();

assessmentsRouter.post(
  "/",
  requireAuth,
  requireRole("therapist", "admin"),
  AssessmentsController.create
);

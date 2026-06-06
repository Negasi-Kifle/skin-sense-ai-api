import { Router } from "express";
import * as PublicController from "@/controllers/public.controller";
import { publicAssessmentLimiter, publicSessionLimiter } from "@/middleware/rateLimit";

export const publicRouter = Router();

publicRouter.post("/sessions", publicSessionLimiter, PublicController.createSession);
publicRouter.post(
  "/assessments",
  publicAssessmentLimiter,
  PublicController.createAssessment
);
publicRouter.get("/goals", PublicController.listGoals);
publicRouter.get("/treatments", PublicController.listTreatments);
publicRouter.post("/plans", PublicController.createPlan);

import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as GoalsController from "@/controllers/goals.controller";

export const goalsRouter = Router();

goalsRouter.get("/", requireAuth, requireRole("staff"), GoalsController.list);

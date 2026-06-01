import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as DashboardController from "@/controllers/dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/metrics", requireAuth, requireRole("admin"), DashboardController.metrics);

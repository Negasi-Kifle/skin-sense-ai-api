import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as TreatmentsController from "@/controllers/treatments.controller";

export const treatmentsRouter = Router();

treatmentsRouter.get("/", requireAuth, requireRole("staff"), TreatmentsController.list);
treatmentsRouter.post("/", requireAuth, requireRole("admin"), TreatmentsController.create);
treatmentsRouter.put("/:id", requireAuth, requireRole("admin"), TreatmentsController.update);
treatmentsRouter.patch("/:id", requireAuth, requireRole("admin"), TreatmentsController.setActive);

import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as IngredientsController from "@/controllers/ingredients.controller";

export const ingredientsRouter = Router();

ingredientsRouter.get("/", requireAuth, requireRole("staff"), IngredientsController.list);
ingredientsRouter.post("/", requireAuth, requireRole("admin"), IngredientsController.create);
ingredientsRouter.put("/:id", requireAuth, requireRole("admin"), IngredientsController.update);
ingredientsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  IngredientsController.remove
);

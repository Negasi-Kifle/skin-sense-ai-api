import { Router } from "express";
import { requireAuth, requireRole } from "@/middleware/auth";
import * as UsersController from "@/controllers/users.controller";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, requireRole("admin"), UsersController.list);
usersRouter.post("/", requireAuth, requireRole("admin"), UsersController.create);

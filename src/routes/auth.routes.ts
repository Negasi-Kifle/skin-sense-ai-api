import { Router } from "express";
import * as AuthController from "@/controllers/auth.controller";

export const authRouter = Router();

authRouter.get("/register/status", AuthController.registrationStatus);
authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);

import type { Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "@/validators/auth.schema";
import * as AuthService from "@/services/AuthService";

export async function login(req: Request, res: Response): Promise<void> {
  const input = LoginSchema.parse(req.body);
  const result = await AuthService.login(input);
  res.json(result);
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = RegisterSchema.parse(req.body);
  const result = await AuthService.register(input);
  res.status(201).json(result);
}

export async function registrationStatus(_req: Request, res: Response): Promise<void> {
  const result = await AuthService.registrationOpen();
  res.json(result);
}

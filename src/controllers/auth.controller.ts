import type { Request, Response } from "express";
import {
  LoginWithSessionSchema,
  RegisterCustomerSchema,
  RegisterSchema,
} from "@/validators/auth.schema";
import * as AuthService from "@/services/AuthService";

export async function login(req: Request, res: Response): Promise<void> {
  const input = LoginWithSessionSchema.parse(req.body);
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

export async function registerCustomer(req: Request, res: Response): Promise<void> {
  const input = RegisterCustomerSchema.parse(req.body);
  const result = await AuthService.registerCustomer(input);
  res.status(201).json(result);
}

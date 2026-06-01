import type { Request, Response } from "express";
import { CreateUserSchema } from "@/validators/user.schema";
import * as UserService from "@/services/UserService";

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await UserService.listUsers();
  res.json({ items });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateUserSchema.parse(req.body);
  const created = await UserService.createUser(input);
  res.status(201).json(created);
}

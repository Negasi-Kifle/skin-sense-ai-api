import type { Request, Response } from "express";
import { objectIdSchema } from "@/validators/common";
import {
  CreateIngredientSchema,
  UpdateIngredientSchema,
} from "@/validators/ingredient.schema";
import * as IngredientService from "@/services/IngredientService";

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await IngredientService.listIngredients();
  res.json({ items });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateIngredientSchema.parse(req.body);
  const created = await IngredientService.createIngredient(input);
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = objectIdSchema.parse(req.params.id);
  const input = UpdateIngredientSchema.parse(req.body);
  const updated = await IngredientService.updateIngredient(id, input);
  res.json(updated);
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = objectIdSchema.parse(req.params.id);
  const result = await IngredientService.deleteIngredient(id);
  res.json(result);
}

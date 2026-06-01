import type { Request, Response } from "express";
import {
  CreateTreatmentSchema,
  SetActiveSchema,
  UpdateTreatmentSchema,
} from "@/validators/treatment.schema";
import { objectIdSchema } from "@/validators/common";
import * as TreatmentService from "@/services/TreatmentService";

export async function list(req: Request, res: Response): Promise<void> {
  // Admins can opt to see inactive services in the management screen.
  const includeInactive =
    req.user?.role === "admin" && String(req.query.includeInactive ?? "") === "true";
  const items = await TreatmentService.listTreatments({ includeInactive });
  res.json({ items });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateTreatmentSchema.parse(req.body);
  const created = await TreatmentService.createTreatment(input);
  res.status(201).json(created);
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = objectIdSchema.parse(req.params.id);
  const input = UpdateTreatmentSchema.parse(req.body);
  const updated = await TreatmentService.updateTreatment(id, input);
  res.json(updated);
}

export async function setActive(req: Request, res: Response): Promise<void> {
  const id = objectIdSchema.parse(req.params.id);
  const input = SetActiveSchema.parse(req.body);
  const updated = await TreatmentService.setTreatmentActive(id, input);
  res.json(updated);
}

import type { Request, Response } from "express";
import { CreatePlanSchema } from "@/validators/plan.schema";
import * as PlanService from "@/services/PlanService";

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreatePlanSchema.parse(req.body);
  const plan = await PlanService.createPlan(input);
  res.status(201).json(plan);
}

import type { Request, Response } from "express";
import * as GoalService from "@/services/GoalService";

export async function list(req: Request, res: Response): Promise<void> {
  const includeInactive =
    req.user?.role === "admin" && String(req.query.includeInactive ?? "") === "true";
  const items = await GoalService.listGoals({ includeInactive });
  res.json({ items });
}

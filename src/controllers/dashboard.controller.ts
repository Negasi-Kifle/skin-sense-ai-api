import type { Request, Response } from "express";
import * as DashboardService from "@/services/DashboardService";

export async function metrics(_req: Request, res: Response): Promise<void> {
  const data = await DashboardService.getDashboardMetrics();
  res.json(data);
}

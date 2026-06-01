import type { Request, Response } from "express";
import { CreateAssessmentSchema } from "@/validators/assessment.schema";
import * as AssessmentService from "@/services/AssessmentService";
import { HttpError } from "@/utils/HttpError";

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw HttpError.unauthorized();
  const input = CreateAssessmentSchema.parse(req.body);
  const assessment = await AssessmentService.createAssessment(input, req.user.sub);
  res.status(201).json(assessment);
}

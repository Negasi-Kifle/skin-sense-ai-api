import type { Request, Response } from "express";
import { CreateAssessmentSchema } from "@/validators/assessment.schema";
import { CreatePlanSchema } from "@/validators/plan.schema";
import { CreatePublicSessionSchema, SESSION_TOKEN_HEADER } from "@/validators/public.schema";
import * as AssessmentService from "@/services/AssessmentService";
import * as GoalService from "@/services/GoalService";
import * as PlanService from "@/services/PlanService";
import * as PublicSessionService from "@/services/PublicSessionService";
import * as TreatmentService from "@/services/TreatmentService";
import { Assessment } from "@/models/Assessment";
import { HttpError } from "@/utils/HttpError";

function requireSessionToken(req: Request): string {
  const raw = req.header(SESSION_TOKEN_HEADER);
  const token = Array.isArray(raw) ? raw[0] : raw;
  if (!token?.trim()) {
    throw HttpError.unauthorized("Missing session token");
  }
  return token.trim();
}

export async function createSession(req: Request, res: Response): Promise<void> {
  CreatePublicSessionSchema.parse(req.body);
  const result = await PublicSessionService.createPublicSession();
  res.status(201).json(result);
}

export async function createAssessment(req: Request, res: Response): Promise<void> {
  const sessionToken = requireSessionToken(req);
  const input = CreateAssessmentSchema.parse(req.body);
  await PublicSessionService.assertSessionGuest(sessionToken, input.guestId);
  const assessment = await AssessmentService.createPublicAssessment(input, sessionToken);
  res.status(201).json(assessment);
}

export async function listGoals(_req: Request, res: Response): Promise<void> {
  const items = await GoalService.listGoals();
  res.json({ items });
}

export async function listTreatments(_req: Request, res: Response): Promise<void> {
  const items = await TreatmentService.listTreatments();
  res.json({ items });
}

export async function createPlan(req: Request, res: Response): Promise<void> {
  const sessionToken = requireSessionToken(req);
  const input = CreatePlanSchema.parse(req.body);

  const assessment = await Assessment.findById(input.assessmentId);
  if (!assessment || assessment.sessionToken !== sessionToken) {
    throw HttpError.forbidden("Invalid session for this assessment");
  }

  const plan = await PlanService.createPlan(input);
  res.status(201).json(plan);
}

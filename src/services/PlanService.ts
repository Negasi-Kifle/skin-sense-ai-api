import { TreatmentPlan } from "@/models/TreatmentPlan";
import { HttpError } from "@/utils/HttpError";
import { generatePlan } from "@/ai/PlanGenerator";
import { getActiveTreatmentsRaw } from "./TreatmentService";
import { getAssessmentById } from "./AssessmentService";
import { toPlanDTO } from "@/utils/mappers";
import type { CreatePlanInput } from "@/validators/plan.schema";

export async function createPlan(input: CreatePlanInput) {
  const assessment = await getAssessmentById(input.assessmentId);

  const activeTreatments = await getActiveTreatmentsRaw();
  if (activeTreatments.length === 0) {
    throw HttpError.unprocessable("No active treatments available to plan from");
  }

  const generated = generatePlan({
    attributes: assessment.attributes,
    context: input.context,
    activeTreatments,
  });

  // FR8 defense-in-depth: every item's treatmentId must exist in the active
  // menu (the generator already guarantees this, but if a future Claude path
  // is plugged in we still validate here).
  const validIds = new Set(activeTreatments.map((t) => String(t._id)));
  const items = generated.items.filter((i) => validIds.has(i.treatmentId));

  // FR11: totals are recomputed from authoritative DB pricing.
  const totalETB = items.reduce((s, i) => {
    const t = activeTreatments.find((x) => String(x._id) === i.treatmentId);
    return s + (t?.priceETB ?? 0);
  }, 0);
  const totalDurationMinutes = items.reduce((s, i) => {
    const t = activeTreatments.find((x) => String(x._id) === i.treatmentId);
    return s + (t?.durationMinutes ?? 0);
  }, 0);

  const doc = await TreatmentPlan.create({
    guestId: assessment.guestId,
    assessmentId: assessment._id,
    items,
    totalETB,
    totalDurationMinutes,
  });

  return toPlanDTO(doc);
}

export async function getPlanById(id: string) {
  const doc = await TreatmentPlan.findById(id);
  if (!doc) throw HttpError.notFound("Plan not found");
  return doc;
}

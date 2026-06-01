import { Treatment } from "@/models/Treatment";
import { HttpError } from "@/utils/HttpError";
import { toTreatmentDTO } from "@/utils/mappers";
import type {
  CreateTreatmentInput,
  SetActiveInput,
  UpdateTreatmentInput,
} from "@/validators/treatment.schema";

export async function listTreatments(opts: { includeInactive?: boolean } = {}) {
  const filter = opts.includeInactive ? {} : { active: true };
  const docs = await Treatment.find(filter).sort({ name: 1 });
  return docs.map(toTreatmentDTO);
}

export async function getActiveTreatmentsRaw() {
  return Treatment.find({ active: true });
}

export async function createTreatment(input: CreateTreatmentInput) {
  const doc = await Treatment.create(input);
  return toTreatmentDTO(doc);
}

export async function updateTreatment(id: string, input: UpdateTreatmentInput) {
  const doc = await Treatment.findByIdAndUpdate(id, input, { new: true });
  if (!doc) throw HttpError.notFound("Treatment not found");
  return toTreatmentDTO(doc);
}

export async function setTreatmentActive(id: string, input: SetActiveInput) {
  const doc = await Treatment.findByIdAndUpdate(id, { active: input.active }, { new: true });
  if (!doc) throw HttpError.notFound("Treatment not found");
  return toTreatmentDTO(doc);
}

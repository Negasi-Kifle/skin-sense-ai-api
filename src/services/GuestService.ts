import { Guest } from "@/models/Guest";
import { HttpError } from "@/utils/HttpError";
import { toGuestDTO } from "@/utils/mappers";
import type { CreateGuestInput } from "@/validators/guest.schema";

// PRD FR4 — consent required and timestamped before any assessment.
export async function createGuest(input: CreateGuestInput) {
  if (!input.consentGiven) {
    throw HttpError.unprocessable("Guest consent must be captured before assessment");
  }
  const doc = await Guest.create({
    name: input.name,
    contact: input.contact,
    consentGiven: true,
    consentAt: new Date(),
  });
  return toGuestDTO(doc);
}

export async function getGuestById(id: string) {
  const doc = await Guest.findById(id);
  if (!doc) throw HttpError.notFound("Guest not found");
  return doc;
}

import { Assessment } from "@/models/Assessment";
import { Guest } from "@/models/Guest";
import { HttpError } from "@/utils/HttpError";
import { getSkinAnalysisProvider } from "@/ai/providerFactory";
import { MockSkinAnalysisProvider } from "@/ai/MockSkinAnalysisProvider";
import { UnusableImageError } from "@/ai/types";
import { logger } from "@/utils/logger";
import { toAssessmentDTO } from "@/utils/mappers";
import type { CreateAssessmentInput } from "@/validators/assessment.schema";

// PRD FR3 — if the provider fails, fall back to the mock without erroring.
// PRD FR4 — raw photo is not persisted unless `retainImage: true`.
export async function createAssessment(input: CreateAssessmentInput, therapistId: string) {
  const guest = await Guest.findById(input.guestId);
  if (!guest) throw HttpError.notFound("Guest not found");
  if (!guest.consentGiven) {
    throw HttpError.unprocessable("Cannot run assessment without guest consent");
  }

  const provider = getSkinAnalysisProvider();
  let attributes;
  let providerId = provider.providerId;
  try {
    attributes = await provider.analyze(input.imageBase64, input.mediaType);
  } catch (err) {
    if (err instanceof UnusableImageError) {
      // Model gave a definite "this isn't a usable skin photo" — do NOT fall
      // back to mock (which would invent attributes). Surface as 422.
      throw HttpError.unprocessable(err.message);
    }
    logger.warn({ err, providerId }, "Primary skin analysis provider failed — using mock fallback");
    const fallback = new MockSkinAnalysisProvider();
    attributes = await fallback.analyze(input.imageBase64, input.mediaType);
    providerId = fallback.providerId;
  }

  const doc = await Assessment.create({
    guestId: guest._id,
    therapistId,
    attributes,
    provider: providerId,
    // PRD FR4: image bytes are intentionally not stored on the document.
    // The flag tracks the *policy* used, not the bytes themselves.
    imageRetained: input.retainImage === true,
  });

  return toAssessmentDTO(doc);
}

export async function getAssessmentById(id: string) {
  const doc = await Assessment.findById(id);
  if (!doc) throw HttpError.notFound("Assessment not found");
  return doc;
}

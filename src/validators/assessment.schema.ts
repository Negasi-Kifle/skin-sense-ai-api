import { z } from "zod";
import { base64ImageSchema, mediaTypeSchema, objectIdSchema } from "./common";

export const CreateAssessmentSchema = z.object({
  guestId: objectIdSchema,
  imageBase64: base64ImageSchema,
  mediaType: mediaTypeSchema,
  // PRD FR4 — opt-in image retention. Defaults to false.
  retainImage: z.boolean().optional().default(false),
});
export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;

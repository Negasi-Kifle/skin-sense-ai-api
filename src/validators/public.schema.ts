import { z } from "zod";

export const CreatePublicSessionSchema = z.object({
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required before assessment (PRD FR4)" }),
  }),
});
export type CreatePublicSessionInput = z.infer<typeof CreatePublicSessionSchema>;

export const SESSION_TOKEN_HEADER = "x-session-token";

import { z } from "zod";

export const CreateGuestSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Consent is required before assessment (PRD FR4)" }),
  }),
});
export type CreateGuestInput = z.infer<typeof CreateGuestSchema>;

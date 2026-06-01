import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.literal("therapist").default("therapist"),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

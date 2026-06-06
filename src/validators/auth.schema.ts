import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const RegisterCustomerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  sessionToken: z.string().optional(),
});
export type RegisterCustomerInput = z.infer<typeof RegisterCustomerSchema>;

export const LoginWithSessionSchema = LoginSchema.extend({
  sessionToken: z.string().optional(),
});
export type LoginWithSessionInput = z.infer<typeof LoginWithSessionSchema>;

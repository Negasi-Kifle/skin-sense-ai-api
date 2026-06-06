import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default("info"),

  // Use "*" to allow any origin, or a comma-separated allowlist.
  CORS_ORIGINS: z.string().default("*"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  MOCK_MODE: z
    .string()
    .default("true")
    .transform((v) => v.toLowerCase() !== "false"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),

  SEED_ADMIN_EMAIL: z.string().email().default("admin@kuriftu.local"),
  SEED_ADMIN_PASSWORD: z.string().min(6).default("admin1234"),
  SEED_THERAPIST_EMAIL: z.string().email().default("therapist@kuriftu.local"),
  SEED_THERAPIST_PASSWORD: z.string().min(6).default("therapist1234"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Crash fast on misconfiguration — we'd rather not start than start wrong.
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsAllowAll = env.CORS_ORIGINS.trim() === "*";

export const corsOrigins = corsAllowAll
  ? []
  : env.CORS_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

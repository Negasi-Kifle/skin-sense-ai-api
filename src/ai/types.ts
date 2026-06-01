import { z } from "zod";

// SkinAttributes — single source of truth across the whole backend.
// Matches PRD §7.1 exactly and the admin/client app `types/index.ts` shape.
// No medical / condition / allergy field by construction (PRD AI8).
export const SkinAttributesSchema = z.object({
  skinType: z.enum(["dry", "normal", "combination", "oily"]),
  hydration: z.enum(["low", "medium", "high"]),
  oiliness: z.enum(["low", "medium", "high"]),
  texture: z.enum(["smooth", "uneven", "rough"]),
  sensitivityHint: z.enum(["low", "medium", "high"]),
  pigmentationEvenness: z.enum(["even", "slightly_uneven", "uneven"]),
  confidence: z.number().min(0).max(1),
});

export type SkinAttributes = z.infer<typeof SkinAttributesSchema>;

export type ProviderId = "claude-vision" | "mock";

export interface SkinAnalysisProvider {
  readonly providerId: ProviderId;
  analyze(imageBase64: string, mediaType: string): Promise<SkinAttributes>;
}

export type MediaType = "image/jpeg" | "image/png";

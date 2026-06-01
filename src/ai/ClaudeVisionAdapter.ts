import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { SkinAttributesSchema, type SkinAnalysisProvider, type SkinAttributes } from "./types";

// PRD AI1 — calls the Anthropic Messages API with an image block, prompted to
// return strict JSON. Output is zod-validated and any failure surfaces as an
// error so the AssessmentService can fall back to the Mock provider (FR3).
const SYSTEM_PROMPT = `You are a cosmetic skin-attribute assistant for a spa intake flow.
You receive a single guest photo and must return a strict JSON object with
EXACTLY these fields and these allowed values:

{
  "skinType":             "dry" | "normal" | "combination" | "oily",
  "hydration":            "low" | "medium" | "high",
  "oiliness":             "low" | "medium" | "high",
  "texture":              "smooth" | "uneven" | "rough",
  "sensitivityHint":      "low" | "medium" | "high",
  "pigmentationEvenness": "even" | "slightly_uneven" | "uneven",
  "confidence":           number between 0 and 1
}

Hard rules:
- Cosmetic suitability only. Do NOT name medical conditions, diseases,
  allergies, or "diagnoses". The output schema cannot represent them.
- Do NOT add any other field. Do NOT add commentary. Do NOT wrap the JSON
  in markdown or prose — return ONLY the JSON object.
- If the photo is unusable, still return a JSON object with conservative
  defaults and a low confidence (e.g. 0.3).`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Model response contained no JSON object");
  }
  return JSON.parse(trimmed.slice(first, last + 1));
}

export class ClaudeVisionAdapter implements SkinAnalysisProvider {
  readonly providerId = "claude-vision" as const;
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyze(imageBase64: string, mediaType: string): Promise<SkinAttributes> {
    if (mediaType !== "image/jpeg" && mediaType !== "image/png") {
      throw new Error(`Unsupported mediaType: ${mediaType}`);
    }

    const response = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            {
              type: "text",
              text: "Return the JSON object now.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude returned no text block");
    }

    const parsed = extractJson(textBlock.text);
    const validated = SkinAttributesSchema.safeParse(parsed);
    if (!validated.success) {
      logger.warn({ issues: validated.error.flatten() }, "Claude output failed schema validation");
      throw new Error("Claude output failed cosmetic-attribute schema");
    }
    return validated.data;
  }
}

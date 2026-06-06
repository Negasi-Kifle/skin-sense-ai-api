import OpenAI from "openai";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import {
  SkinAttributesSchema,
  UnusableImageError,
  type SkinAnalysisProvider,
  type SkinAttributes,
} from "./types";

// PRD AI1 — calls the OpenAI Chat Completions API with a vision image block,
// prompted to return strict JSON. Output is zod-validated; failures surface as
// errors so AssessmentService can fall back to the Mock provider (FR3).
const SYSTEM_PROMPT = `You are a cosmetic skin-attribute assistant for a spa intake flow.
You receive a single guest photo and must return ONLY a strict JSON object.

==== STEP 1: USABILITY GATE (do this first, do not skip) ====

Before you consider any attributes, perform this check:

  Can I see actual human skin pixels in this image — meaning real photographic
  skin showing pores, texture variation, subtle color gradients, fine hair, or
  similar dermal features?

The image is NOT usable if ANY of the following is true:
  - It is a logo, icon, symbol, mark, emoji, or wordmark.
  - It is a vector illustration, line drawing, cartoon, painting, or 3D render.
  - It is a screenshot, document, chart, diagram, or text.
  - It depicts an object (chair, phone, food, building), an animal, a plant,
    or scenery — anything that is not a real human face or real human skin.
  - It is a photograph but skin is fully occluded (mask + sunglasses, helmet,
    full bandage) or no skin is visible at all.
  - It is too blurry, too dark, too bright, too small, or too low-resolution
    to actually read skin attributes.
  - Skin tones are present only because of flat fill colors (e.g. a peach-
    colored shape), not real photographic skin.

If ANY of those apply, return EXACTLY this rejection JSON and STOP:
{
  "usable": false,
  "reason": "<one short concrete sentence naming what the image actually is, e.g. 'Image is a blue chevron logo, not a human skin photo.' or 'Image shows a chair, not a human face.'>"
}

You MUST use the rejection form even if you could guess plausible attributes.
Guessing is wrong. If you are not certain you can SEE real human skin, reject.

==== STEP 2: ATTRIBUTES (only if step 1 passed) ====

Only if step 1 confirms real photographic human skin is visible, return EXACTLY:
{
  "usable": true,
  "skinType":             "dry" | "normal" | "combination" | "oily",
  "hydration":            "low" | "medium" | "high",
  "oiliness":             "low" | "medium" | "high",
  "texture":              "smooth" | "uneven" | "rough",
  "sensitivityHint":      "low" | "medium" | "high",
  "pigmentationEvenness": "even" | "slightly_uneven" | "uneven",
  "confidence":           number between 0 and 1
}

==== HARD RULES ====
- Cosmetic suitability only. Do NOT name medical conditions, diseases,
  allergies, or "diagnoses". The output schema cannot represent them.
- Do NOT add any other field. Do NOT add commentary. Do NOT wrap the JSON
  in markdown or prose — return ONLY the JSON object.
- Do NOT invent attributes for an unusable photo. Use the rejection form.`;

const USER_PROMPT =
  "Run the usability gate, then return ONLY the JSON object. If this is a logo, illustration, screenshot, object, or anything other than a real photograph of human skin, you MUST return the rejection form.";

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Model response contained no JSON object");
  }
  return JSON.parse(trimmed.slice(first, last + 1));
}

export class OpenAIVisionAdapter implements SkinAnalysisProvider {
  readonly providerId = "openai-vision" as const;
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async analyze(imageBase64: string, mediaType: string): Promise<SkinAttributes> {
    if (mediaType !== "image/jpeg" && mediaType !== "image/png") {
      throw new Error(`Unsupported mediaType: ${mediaType}`);
    }

    const response = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: 400,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mediaType};base64,${imageBase64}` },
            },
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("OpenAI returned no message content");
    }

    logger.debug({ raw: text.slice(0, 500) }, "OpenAI vision raw response");
    const parsed = extractJson(text);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as { usable?: unknown }).usable === false
    ) {
      const reason =
        typeof (parsed as { reason?: unknown }).reason === "string"
          ? (parsed as { reason: string }).reason
          : "Image does not appear to show a usable human skin photo.";
      throw new UnusableImageError(reason);
    }

    const validated = SkinAttributesSchema.safeParse(parsed);
    if (!validated.success) {
      logger.warn({ issues: validated.error.flatten() }, "OpenAI output failed schema validation");
      throw new Error("OpenAI output failed cosmetic-attribute schema");
    }
    return validated.data;
  }
}

import type { TreatmentDoc } from "@/models/Treatment";
import type { SkinAttributes } from "./types";

// PRD §7.2 (AI4-AI7) and FR8-FR11.
//
// This is the deterministic, rule-based generator used in MOCK_MODE and as the
// safety net when the Claude-based path fails. It guarantees:
// - selection is only from active Kuriftu menu items (FR8 / AI5);
// - for `sensitivityHint: 'high'` services with `irritantForSensitive: true`
//   ingredients are dropped (AI6 — safety does not rely on the model alone);
// - for `sensitivityHint: 'medium'` such services stay but get a caution;
// - totals are computed from authoritative Treatment docs (FR11) — never
//   from the model's output.

export type Goal =
  | "hydration"
  | "glow"
  | "relaxation"
  | "anti_aging"
  | "evenness"
  | "soothing";

export type BudgetTier = "value" | "standard" | "premium";

export interface IntakeContext {
  goals: Goal[];
  sensitivities: string[];
  lengthOfStayDays: number;
  budgetTier: BudgetTier;
}

export interface GeneratedPlanItem {
  treatmentId: string;
  dayOfStay: number;
  rationale: string;
  caution?: string;
}

export interface GeneratedPlan {
  items: GeneratedPlanItem[];
  totalETB: number;
  totalDurationMinutes: number;
}

interface GenerateInput {
  attributes: SkinAttributes;
  context: IntakeContext;
  activeTreatments: TreatmentDoc[];
}

function hasIrritant(t: TreatmentDoc): boolean {
  return (t.ingredients ?? []).some((i) => i.irritantForSensitive);
}

function irritantNames(t: TreatmentDoc): string[] {
  return (t.ingredients ?? [])
    .filter((i) => i.irritantForSensitive)
    .map((i) => i.name);
}

function targetScore(
  t: TreatmentDoc,
  attrs: SkinAttributes,
  context: IntakeContext
): number {
  let score = 0;
  const tokens = new Set(t.targetAttributes ?? []);

  if (tokens.has(`skinType:${attrs.skinType}`)) score += 3;
  if (tokens.has(`hydration:${attrs.hydration}`)) score += 2;
  if (tokens.has(`oiliness:${attrs.oiliness}`)) score += 2;
  if (tokens.has(`texture:${attrs.texture}`)) score += 2;
  if (tokens.has(`pigmentationEvenness:${attrs.pigmentationEvenness}`)) score += 2;
  if (tokens.has(`sensitivityHint:${attrs.sensitivityHint}`)) score += 2;

  for (const goal of context.goals) {
    if (tokens.has(`goal:${goal}`)) score += 2;
  }

  if (t.category === "massage" && context.goals.includes("relaxation")) score += 1;

  return score;
}

function budgetCeiling(tier: BudgetTier): number {
  switch (tier) {
    case "value":
      return 6000;
    case "standard":
      return 12000;
    case "premium":
      return Number.POSITIVE_INFINITY;
  }
}

function rationaleFor(
  t: TreatmentDoc,
  attrs: SkinAttributes,
  context: IntakeContext
): string {
  const bits: string[] = [];
  const tokens = new Set(t.targetAttributes ?? []);

  if (tokens.has(`skinType:${attrs.skinType}`)) bits.push(`suits ${attrs.skinType} skin`);
  if (attrs.hydration === "low" && tokens.has("hydration:low")) bits.push("addresses low hydration");
  if (attrs.oiliness === "high" && tokens.has("oiliness:high")) bits.push("balances excess oil");
  if (
    attrs.texture !== "smooth" &&
    (t.targetAttributes ?? []).some((a) => a.startsWith("texture:"))
  ) {
    bits.push("smooths texture");
  }
  if (
    attrs.pigmentationEvenness !== "even" &&
    tokens.has(`pigmentationEvenness:${attrs.pigmentationEvenness}`)
  ) {
    bits.push("evens tone");
  }
  if (context.goals.includes("relaxation") && t.category === "massage") {
    bits.push("supports relaxation goal");
  }
  for (const goal of context.goals) {
    if (tokens.has(`goal:${goal}`)) bits.push(`aligned to ${goal} goal`);
  }
  if (bits.length === 0) bits.push("complements the overall plan");
  return `${t.name} — ${bits.join("; ")}.`;
}

export function generatePlan(input: GenerateInput): GeneratedPlan {
  const { attributes, context, activeTreatments } = input;

  let pool = activeTreatments.filter((t) => t.active);

  if (attributes.sensitivityHint === "high") {
    pool = pool.filter((t) => !hasIrritant(t));
  }

  const ranked = pool
    .map((t) => ({ treatment: t, score: targetScore(t, attributes, context) }))
    .sort((a, b) => b.score - a.score);

  const days = Math.max(1, Math.min(context.lengthOfStayDays, 7));
  const ceiling = budgetCeiling(context.budgetTier);

  const picked: { treatment: TreatmentDoc; dayOfStay: number }[] = [];
  let runningTotal = 0;
  let day = 1;

  for (const { treatment } of ranked) {
    const id = String(treatment._id);
    if (picked.some((p) => String(p.treatment._id) === id)) continue;
    if (runningTotal + treatment.priceETB > ceiling) continue;
    picked.push({ treatment, dayOfStay: day });
    runningTotal += treatment.priceETB;
    day = day >= days ? 1 : day + 1;
    if (picked.length >= days * 2) break; // up to 2 services per day
  }

  const items: GeneratedPlanItem[] = picked.map(({ treatment, dayOfStay }) => {
    const item: GeneratedPlanItem = {
      treatmentId: String(treatment._id),
      dayOfStay,
      rationale: rationaleFor(treatment, attributes, context),
    };
    if (attributes.sensitivityHint === "medium" && hasIrritant(treatment)) {
      const names = irritantNames(treatment).join(", ");
      item.caution = `Contains ${names} — may not suit sensitive skin. Confirm with guest.`;
    }
    return item;
  });

  // Recompute totals from authoritative treatment data (FR11).
  const totalETB = picked.reduce((s, { treatment }) => s + treatment.priceETB, 0);
  const totalDurationMinutes = picked.reduce(
    (s, { treatment }) => s + treatment.durationMinutes,
    0
  );

  return { items, totalETB, totalDurationMinutes };
}

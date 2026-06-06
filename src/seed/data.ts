import type { IngredientRole } from "@/models/Ingredient";
import type { TreatmentCategory } from "@/models/Treatment";

export interface SeedGoal {
  value: string;
  label: string;
  order: number;
  active: boolean;
}

export const SEED_GOALS: SeedGoal[] = [
  { value: "hydration", label: "Hydration", order: 1, active: true },
  { value: "glow", label: "Glow", order: 2, active: true },
  { value: "relaxation", label: "Relaxation", order: 3, active: true },
  { value: "anti_aging", label: "Anti-aging", order: 4, active: true },
  { value: "evenness", label: "Even tone", order: 5, active: true },
  { value: "soothing", label: "Soothing", order: 6, active: true },
];

// Seed data answers PRD OQ2 in the same way the client-side mock-menu does —
// a representative Kuriftu menu so the demo can show the FR9 ingredient-driven
// swap (high-sensitivity guest avoids services flagged irritant).

export interface SeedIngredient {
  name: string;
  role?: IngredientRole;
  irritantForSensitive: boolean;
}

export const SEED_INGREDIENTS: SeedIngredient[] = [
  { name: "Hyaluronic acid", role: "active", irritantForSensitive: false },
  { name: "Aloe vera", role: "moisturizer", irritantForSensitive: false },
  { name: "Glycerin", role: "moisturizer", irritantForSensitive: false },
  { name: "Glycolic acid", role: "exfoliant", irritantForSensitive: true },
  { name: "Coffee extract", role: "active", irritantForSensitive: false },
  { name: "Vitamin C", role: "active", irritantForSensitive: true },
  { name: "Centella asiatica", role: "active", irritantForSensitive: false },
  { name: "Colloidal oatmeal", role: "moisturizer", irritantForSensitive: false },
  { name: "Panthenol", role: "moisturizer", irritantForSensitive: false },
  { name: "Niacinamide", role: "active", irritantForSensitive: false },
  { name: "Salicylic acid", role: "exfoliant", irritantForSensitive: true },
  { name: "Zinc PCA", role: "active", irritantForSensitive: false },
  { name: "Raw honey", role: "moisturizer", irritantForSensitive: false },
  { name: "Shea butter", role: "moisturizer", irritantForSensitive: false },
  { name: "Sea salt", role: "exfoliant", irritantForSensitive: true },
  { name: "Essential oil blend", role: "fragrance", irritantForSensitive: true },
  { name: "Jojoba oil", role: "moisturizer", irritantForSensitive: false },
  { name: "Arnica oil", role: "active", irritantForSensitive: false },
  { name: "Lavender oil", role: "fragrance", irritantForSensitive: true },
];

export interface SeedTreatment {
  name: string;
  category: TreatmentCategory;
  description: string;
  durationMinutes: number;
  priceETB: number;
  targetAttributes: string[];
  ingredientNames: string[];
  active: boolean;
}

export const SEED_TREATMENTS: SeedTreatment[] = [
  {
    name: "Lake Tana Hydra Facial",
    category: "facial",
    description: "Deep hydration facial with hyaluronic infusion.",
    durationMinutes: 60,
    priceETB: 2800,
    targetAttributes: ["hydration:low", "skinType:dry", "skinType:normal"],
    ingredientNames: ["Hyaluronic acid", "Aloe vera", "Glycerin"],
    active: true,
  },
  {
    name: "Ethiopian Coffee Glow Peel",
    category: "facial",
    description: "Brightening exfoliation with mild AHA.",
    durationMinutes: 45,
    priceETB: 2400,
    targetAttributes: ["pigmentationEvenness:uneven", "texture:uneven", "skinType:combination"],
    ingredientNames: ["Glycolic acid", "Coffee extract", "Vitamin C"],
    active: true,
  },
  {
    name: "Highland Calming Facial",
    category: "facial",
    description: "Soothing facial for sensitive skin — fragrance-free.",
    durationMinutes: 50,
    priceETB: 2600,
    targetAttributes: ["sensitivityHint:high", "skinType:dry"],
    ingredientNames: ["Centella asiatica", "Colloidal oatmeal", "Panthenol"],
    active: true,
  },
  {
    name: "Rift Valley Balancing Facial",
    category: "facial",
    description: "Sebum-balancing facial for oily/combination skin.",
    durationMinutes: 55,
    priceETB: 2500,
    targetAttributes: ["oiliness:high", "skinType:oily", "skinType:combination"],
    ingredientNames: ["Niacinamide", "Salicylic acid", "Zinc PCA"],
    active: true,
  },
  {
    name: "Ethiopian Honey Body Wrap",
    category: "body",
    description: "Nourishing wrap with raw Ethiopian honey.",
    durationMinutes: 75,
    priceETB: 3200,
    targetAttributes: ["hydration:low", "texture:rough"],
    ingredientNames: ["Raw honey", "Shea butter"],
    active: true,
  },
  {
    name: "Afar Salt Body Scrub",
    category: "body",
    description: "Mineral salt scrub for renewal.",
    durationMinutes: 45,
    priceETB: 2200,
    targetAttributes: ["texture:rough", "texture:uneven"],
    ingredientNames: ["Sea salt", "Essential oil blend"],
    active: true,
  },
  {
    name: "Kuriftu Signature Massage",
    category: "massage",
    description: "Full-body Swedish-style relaxation massage.",
    durationMinutes: 60,
    priceETB: 2700,
    targetAttributes: ["goal:relaxation"],
    ingredientNames: ["Jojoba oil"],
    active: true,
  },
  {
    name: "Deep Tissue Recovery Massage",
    category: "massage",
    description: "Targeted deep-tissue massage for muscle recovery.",
    durationMinutes: 75,
    priceETB: 3000,
    targetAttributes: ["goal:relaxation"],
    ingredientNames: ["Arnica oil"],
    active: true,
  },
  {
    name: "Volcanic Hot Stone Therapy",
    category: "massage",
    description: "Heated basalt stone massage.",
    durationMinutes: 80,
    priceETB: 3400,
    targetAttributes: ["goal:relaxation"],
    ingredientNames: ["Lavender oil"],
    active: true,
  },
];

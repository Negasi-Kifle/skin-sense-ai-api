import type { SkinAnalysisProvider, SkinAttributes } from "./types";

// Deterministic canned response — PRD AI2 / NFR1. The same demo photo always
// yields the same attributes so the on-stage flow is rehearsable.
const PROFILES: SkinAttributes[] = [
  {
    skinType: "combination",
    hydration: "medium",
    oiliness: "medium",
    texture: "smooth",
    sensitivityHint: "low",
    pigmentationEvenness: "slightly_uneven",
    confidence: 0.82,
  },
  {
    skinType: "dry",
    hydration: "low",
    oiliness: "low",
    texture: "uneven",
    sensitivityHint: "high",
    pigmentationEvenness: "slightly_uneven",
    confidence: 0.78,
  },
  {
    skinType: "oily",
    hydration: "medium",
    oiliness: "high",
    texture: "uneven",
    sensitivityHint: "low",
    pigmentationEvenness: "uneven",
    confidence: 0.84,
  },
  {
    skinType: "normal",
    hydration: "high",
    oiliness: "low",
    texture: "smooth",
    sensitivityHint: "medium",
    pigmentationEvenness: "even",
    confidence: 0.88,
  },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export class MockSkinAnalysisProvider implements SkinAnalysisProvider {
  readonly providerId = "mock" as const;

  async analyze(imageBase64: string, _mediaType: string): Promise<SkinAttributes> {
    // Simulate realistic latency for the loading state (NFR2).
    await new Promise((r) => setTimeout(r, 700));
    const idx = hashString(imageBase64.slice(0, 64)) % PROFILES.length;
    return PROFILES[idx];
  }
}

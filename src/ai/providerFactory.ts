import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { MockSkinAnalysisProvider } from "./MockSkinAnalysisProvider";
import { ClaudeVisionAdapter } from "./ClaudeVisionAdapter";
import type { SkinAnalysisProvider } from "./types";

// PRD AI3 — business logic never imports a concrete adapter. This is the only
// place the env decides which provider to use.
let cached: SkinAnalysisProvider | null = null;

export function getSkinAnalysisProvider(): SkinAnalysisProvider {
  if (cached) return cached;

  if (env.MOCK_MODE) {
    logger.info("Skin analysis provider: mock (MOCK_MODE=true)");
    cached = new MockSkinAnalysisProvider();
    return cached;
  }

  if (!env.ANTHROPIC_API_KEY) {
    logger.warn(
      "MOCK_MODE=false but ANTHROPIC_API_KEY is empty — falling back to MockSkinAnalysisProvider"
    );
    cached = new MockSkinAnalysisProvider();
    return cached;
  }

  logger.info({ model: env.ANTHROPIC_MODEL }, "Skin analysis provider: claude-vision");
  cached = new ClaudeVisionAdapter(env.ANTHROPIC_API_KEY);
  return cached;
}

// Test-only — lets unit tests reset the cached instance.
export function _resetProviderForTest(): void {
  cached = null;
}

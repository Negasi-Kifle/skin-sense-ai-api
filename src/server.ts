import { createApp } from "@/app";
import { connectDB } from "@/db/connect";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

async function main(): Promise<void> {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, mockMode: env.MOCK_MODE, env: env.NODE_ENV },
      "SkinSense backend listening"
    );
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

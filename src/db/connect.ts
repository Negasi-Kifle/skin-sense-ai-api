import mongoose from "mongoose";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  logger.info({ uri: env.MONGODB_URI.replace(/:\/\/.*@/, "://***@") }, "MongoDB connected");
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

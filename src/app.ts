import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { corsOrigins } from "@/config/env";
import { logger } from "@/utils/logger";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { authRouter } from "@/routes/auth.routes";
import { treatmentsRouter } from "@/routes/treatments.routes";
import { guestsRouter } from "@/routes/guests.routes";
import { assessmentsRouter } from "@/routes/assessments.routes";
import { plansRouter } from "@/routes/plans.routes";
import { bookingsRouter } from "@/routes/bookings.routes";
import { dashboardRouter } from "@/routes/dashboard.routes";
import { usersRouter } from "@/routes/users.routes";

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // curl, server-to-server
        if (corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );
  // Payloads include base64 photos (≤8MB raw → ~11MB encoded).
  app.use(express.json({ limit: "15mb" }));
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/treatments", treatmentsRouter);
  app.use("/api/guests", guestsRouter);
  app.use("/api/assessments", assessmentsRouter);
  app.use("/api/plans", plansRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/users", usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

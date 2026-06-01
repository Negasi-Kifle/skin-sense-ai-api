import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@/config/env";
import type { UserRole } from "@/models/User";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  name: string;
}

export function signJwt(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyJwt(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string") {
    throw new Error("Unexpected JWT payload");
  }
  return decoded as JwtPayload;
}

import type { NextFunction, Request, Response } from "express";
import { HttpError } from "@/utils/HttpError";
import { verifyJwt, type JwtPayload } from "@/utils/jwt";
import { STAFF_ROLES, type UserRole } from "@/models/User";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    throw HttpError.unauthorized("Missing bearer token");
  }
  const token = header.slice(7).trim();
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    throw HttpError.unauthorized("Invalid or expired token");
  }
}

// PRD §9 access matrix:
//   staff      = therapist or admin (not customer)
//   therapist  = only therapist
//   admin      = only admin
//   customer   = only customer
export type RoleGate = "staff" | UserRole;

function roleMatchesGate(role: UserRole, gate: RoleGate): boolean {
  if (gate === "staff") return (STAFF_ROLES as readonly string[]).includes(role);
  return gate === role;
}

export function requireRole(...allowed: RoleGate[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw HttpError.unauthorized();
    const role = req.user.role;
    const ok = allowed.some((g) => roleMatchesGate(role, g));
    if (!ok) throw HttpError.forbidden(`Requires role: ${allowed.join(" or ")}`);
    next();
  };
}

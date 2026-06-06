import { Guest } from "@/models/Guest";
import { User } from "@/models/User";
import { hashPassword, verifyPassword } from "@/utils/hash";
import { signJwt } from "@/utils/jwt";
import { HttpError } from "@/utils/HttpError";
import { toAppUserDTO } from "@/utils/mappers";
import { claimSession } from "@/services/PublicSessionService";
import type {
  LoginWithSessionInput,
  RegisterCustomerInput,
  RegisterInput,
} from "@/validators/auth.schema";

export async function login(input: LoginWithSessionInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) throw HttpError.unauthorized("Invalid email or password");

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw HttpError.unauthorized("Invalid email or password");

  const token = signJwt({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });
  if (input.sessionToken) {
    await claimSession(input.sessionToken, String(user._id));
  }
  return { token, user: toAppUserDTO(user) };
}

export async function registrationOpen() {
  const exists = await User.exists({ isFirstTimeAccount: true });
  return { open: !exists };
}

export async function register(input: RegisterInput) {
  const bootstrapExists = await User.exists({ isFirstTimeAccount: true });
  if (bootstrapExists) {
    throw HttpError.forbidden("Public registration is closed");
  }

  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    throw HttpError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name.trim(),
    email,
    passwordHash,
    role: "admin",
    isFirstTimeAccount: true,
  });

  const token = signJwt({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });
  return { token, user: toAppUserDTO(user) };
}

export async function registerCustomer(input: RegisterCustomerInput) {
  const email = input.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    throw HttpError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name.trim(),
    email,
    passwordHash,
    role: "customer",
    isFirstTimeAccount: false,
  });

  if (input.sessionToken) {
    await claimSession(input.sessionToken, String(user._id));
    const guest = await Guest.findOne({ sessionToken: input.sessionToken });
    if (guest && input.name.trim()) {
      guest.name = input.name.trim();
      await guest.save();
    }
  }

  const token = signJwt({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });
  return { token, user: toAppUserDTO(user) };
}

import { User } from "@/models/User";
import { hashPassword } from "@/utils/hash";
import { HttpError } from "@/utils/HttpError";
import { toUserDTO } from "@/utils/mappers";
import type { CreateUserInput } from "@/validators/user.schema";

export async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(toUserDTO);
}

export async function createUser(input: CreateUserInput) {
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
    role: input.role,
    isFirstTimeAccount: false,
  });

  return toUserDTO(user);
}

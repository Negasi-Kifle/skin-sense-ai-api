import crypto from "crypto";
import { Assessment } from "@/models/Assessment";
import { Guest } from "@/models/Guest";
import { User } from "@/models/User";
import { HttpError } from "@/utils/HttpError";
import { toGuestDTO } from "@/utils/mappers";

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createPublicSession() {
  const sessionToken = generateSessionToken();
  const doc = await Guest.create({
    name: "Visitor",
    consentGiven: true,
    consentAt: new Date(),
    source: "public",
    sessionToken,
  });
  return { sessionToken, guest: toGuestDTO(doc) };
}

export async function assertSessionGuest(sessionToken: string, guestId: string) {
  const guest = await Guest.findOne({ sessionToken, _id: guestId });
  if (!guest) {
    throw HttpError.forbidden("Invalid session or guest for this journey");
  }
  if (!guest.consentGiven) {
    throw HttpError.unprocessable("Cannot continue without photo consent");
  }
  return guest;
}

export async function claimSession(sessionToken: string, userId: string) {
  const guest = await Guest.findOne({ sessionToken });
  if (!guest) return;

  if (!guest.userId) {
    guest.userId = userId as unknown as typeof guest.userId;
  }
  if (guest.name === "Visitor") {
    const user = await User.findById(userId);
    if (user?.name) guest.name = user.name;
  }
  await guest.save();

  await Assessment.updateMany(
    { sessionToken, customerId: { $exists: false } },
    { $set: { customerId: userId } }
  );
}

export async function updateGuestForUser(
  guestId: string,
  userId: string,
  input: { name?: string; contact?: string }
) {
  const guest = await Guest.findOne({ _id: guestId, userId });
  if (!guest) throw HttpError.notFound("Guest not found for this account");
  if (input.name?.trim()) guest.name = input.name.trim();
  if (input.contact !== undefined) guest.contact = input.contact.trim() || undefined;
  await guest.save();
  return toGuestDTO(guest);
}

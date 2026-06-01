import type { FilterQuery } from "mongoose";
import { Booking, type BookingDoc, type BookingStatus } from "@/models/Booking";
import { Treatment } from "@/models/Treatment";
import { Guest } from "@/models/Guest";
import { User } from "@/models/User";
import { HttpError } from "@/utils/HttpError";
import { getPlanById } from "./PlanService";
import { toBookingDTO } from "@/utils/mappers";
import type {
  CreateBookingInput,
  ListBookingsQuery,
  UpdateBookingStatusInput,
} from "@/validators/booking.schema";

// PRD FR15 — booking-level state machine.
// `pending → confirmed → completed`, and `cancelled` from any non-completed
// state. The same machine applies to individual selectedItems.
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (from === to) return;
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw HttpError.unprocessable(
      `Illegal status transition: ${from} → ${to}`,
      { allowed: ALLOWED_TRANSITIONS[from] }
    );
  }
}

export async function createBooking(input: CreateBookingInput, therapistUserId: string) {
  const plan = await getPlanById(input.planId);

  const therapist = await User.findById(therapistUserId);
  if (!therapist) throw HttpError.unauthorized();
  const guest = await Guest.findById(plan.guestId);
  if (!guest) throw HttpError.notFound("Guest not found for plan");

  // Resolve selected ids → Treatment docs, drop unknowns.
  const selectedIds = input.selectedTreatmentIds;
  const treatments = await Treatment.find({ _id: { $in: selectedIds } });
  const byId = new Map(treatments.map((t) => [String(t._id), t]));

  const selectedItems = selectedIds
    .map((id) => byId.get(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({
      treatmentId: t._id,
      treatmentName: t.name,
      status: "pending" as BookingStatus,
    }));

  if (selectedItems.length === 0) {
    throw HttpError.unprocessable("None of the selected treatments are valid");
  }

  // FR11: recompute from DB.
  const totalETB = selectedItems.reduce((s, i) => {
    const t = byId.get(String(i.treatmentId));
    return s + (t?.priceETB ?? 0);
  }, 0);

  const doc = await Booking.create({
    planId: plan._id,
    guestId: plan.guestId,
    guestName: guest.name,
    createdBy: therapist._id,
    therapistName: therapist.name,
    selectedItems,
    status: "pending",
    totalETB,
  });
  return toBookingDTO(doc);
}

export async function listBookings(query: ListBookingsQuery) {
  const filter: FilterQuery<BookingDoc> = {};
  if (query.status) filter.status = query.status;
  if (query.therapistId) filter.createdBy = query.therapistId;
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.createdAt.$lte = new Date(query.dateTo);
  }

  const [items, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Booking.countDocuments(filter),
  ]);
  return { items: items.map(toBookingDTO), total, limit: query.limit, skip: query.skip };
}

export async function getBookingById(id: string) {
  const doc = await Booking.findById(id);
  if (!doc) throw HttpError.notFound("Booking not found");
  return toBookingDTO(doc);
}

export async function updateBookingStatus(id: string, input: UpdateBookingStatusInput) {
  const doc = await Booking.findById(id);
  if (!doc) throw HttpError.notFound("Booking not found");

  assertTransition(doc.status, input.status);

  doc.status = input.status;
  // Mirror to all non-terminal selectedItems so a confirm/complete cascades.
  if (input.status === "confirmed" || input.status === "completed") {
    for (const it of doc.selectedItems ?? []) {
      if (it.status !== "completed" && it.status !== "cancelled") {
        it.status = input.status;
      }
    }
  }
  if (input.status === "cancelled") {
    for (const it of doc.selectedItems ?? []) {
      if (it.status !== "completed") it.status = "cancelled";
    }
  }
  await doc.save();
  return toBookingDTO(doc);
}

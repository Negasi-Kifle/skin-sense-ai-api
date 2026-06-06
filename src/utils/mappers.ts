import type { TreatmentDoc } from "@/models/Treatment";
import type { GuestDoc } from "@/models/Guest";
import type { AssessmentDoc } from "@/models/Assessment";
import type { TreatmentPlanDoc } from "@/models/TreatmentPlan";
import type { BookingDoc } from "@/models/Booking";
import type { UserDoc } from "@/models/User";
import type { IngredientDoc } from "@/models/Ingredient";
import type { GoalDoc } from "@/models/Goal";

// Map Mongoose docs to the on-the-wire shapes that the admin + client apps
// already type against (`id` as string, ISO timestamps). Centralising avoids
// scattering `toString()` and `toISOString()` across controllers.

export const toGoalDTO = (d: GoalDoc) => ({
  id: String(d._id),
  value: d.value,
  label: d.label,
  order: d.order,
  active: d.active,
});

export const toIngredientDTO = (d: IngredientDoc) => ({
  id: String(d._id),
  name: d.name,
  role: d.role,
  irritantForSensitive: d.irritantForSensitive,
});

export const toTreatmentDTO = (d: TreatmentDoc) => ({
  id: String(d._id),
  name: d.name,
  category: d.category,
  description: d.description,
  durationMinutes: d.durationMinutes,
  priceETB: d.priceETB,
  targetAttributes: d.targetAttributes ?? [],
  ingredients: (d.ingredients ?? []).map((i) => ({
    ingredientId: String(i.ingredientId),
    name: i.name,
    role: i.role,
    irritantForSensitive: i.irritantForSensitive,
  })),
  active: d.active,
});

export const toGuestDTO = (d: GuestDoc) => ({
  id: String(d._id),
  name: d.name,
  contact: d.contact,
  consentGiven: d.consentGiven,
  consentAt: d.consentAt.toISOString(),
});

export const toAssessmentDTO = (d: AssessmentDoc) => ({
  id: String(d._id),
  guestId: String(d.guestId),
  therapistId: String(d.therapistId),
  attributes: d.attributes,
  provider: d.provider,
  imageRetained: d.imageRetained,
  createdAt: (d as unknown as { createdAt: Date }).createdAt.toISOString(),
});

export const toPlanDTO = (d: TreatmentPlanDoc) => ({
  id: String(d._id),
  guestId: String(d.guestId),
  assessmentId: String(d.assessmentId),
  items: (d.items ?? []).map((i) => ({
    treatmentId: String(i.treatmentId),
    dayOfStay: i.dayOfStay,
    rationale: i.rationale,
    caution: i.caution,
  })),
  totalETB: d.totalETB,
  totalDurationMinutes: d.totalDurationMinutes,
  createdAt: (d as unknown as { createdAt: Date }).createdAt.toISOString(),
});

export const toBookingDTO = (d: BookingDoc) => ({
  id: String(d._id),
  planId: String(d.planId),
  guestId: String(d.guestId),
  guestName: d.guestName,
  therapistName: d.therapistName,
  selectedItems: (d.selectedItems ?? []).map((i) => ({
    treatmentId: String(i.treatmentId),
    treatmentName: i.treatmentName,
    scheduledDate: i.scheduledDate ? i.scheduledDate.toISOString() : undefined,
    status: i.status,
  })),
  status: d.status,
  totalETB: d.totalETB,
  createdAt: (d as unknown as { createdAt: Date }).createdAt.toISOString(),
  updatedAt: (d as unknown as { updatedAt: Date }).updatedAt.toISOString(),
});

export const toStaffUserDTO = (d: UserDoc) => ({
  name: d.name,
  email: d.email,
  role: d.role,
});

export const toUserDTO = (d: UserDoc) => ({
  id: String(d._id),
  name: d.name,
  email: d.email,
  role: d.role,
  createdAt: (d as unknown as { createdAt: Date }).createdAt.toISOString(),
});

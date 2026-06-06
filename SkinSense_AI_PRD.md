# SkinSense AI — Product Requirements Document

**Version:** 1.1 (Hackathon MVP)
**Event:** Wellness Hackathon 2026 — ALX Ethiopia × Kuriftu Resorts × WeVa Sphere
**Build window:** June 6 → June 14, 2026
**Author:** [Team name]
**Status:** Draft for build

> **Changelog v1.1:** Added admin service + ingredient management; `PlanGenerator` now considers a service's ingredients (vs. guest sensitivity) before recommending. Amharic deferred — MVP is English-only (multi-language is future scope).

---

## 1. Summary

SkinSense AI is a **therapist-assisted skin wellness tool** for Kuriftu Resorts. During guest intake, a Kuriftu therapist captures a photo and a short intake. The system performs a **cosmetic skin assessment** (not a medical diagnosis), then generates a **personalized, multi-day spa treatment plan mapped directly to Kuriftu's service menu** — with pricing, duration, and rationale. Plans convert into **bookings stored in our database**, which Kuriftu staff manage through an admin dashboard.

The product's value is not the photo. It is the **personalization-to-revenue layer**: turning a single walk-in treatment into a sequenced multi-treatment itinerary across the guest's stay, raising revenue per guest — while respecting each service's **ingredients** against the guest's skin sensitivity.

---

## 2. Problem & Opportunity

A Kuriftu guest typically books one treatment, chosen ad hoc. There is no systematic, consistent way to (a) assess what a guest's skin needs in cosmetic terms, (b) match that to the full menu while accounting for service ingredients, and (c) sequence treatments across a multi-day stay. The result is under-personalized service and lost upsell.

**Opportunity:** an AI layer that does what a great concierge does — but consistently, in seconds — and measurably increases **attach rate** (treatments booked per guest) and **basket size** (ETB per guest).

---

## 3. Goals & Non-Goals

### 3.1 Goals (MVP)
- G1. Let a therapist run a guest through assessment → plan → booking in under 3 minutes.
- G2. Produce a cosmetic skin assessment using Claude Vision (via a swappable adapter).
- G3. Generate a multi-day plan that references **only real Kuriftu menu items**, considers each service's **ingredients** against guest sensitivity, and includes per-item rationale (English).
- G4. Let admins **encode services with their ingredients** through the dashboard, and persist/manage bookings.
- G5. Demo reliably on stage June 14 (network-independent fallback).

### 3.2 Non-Goals (explicitly out of scope for MVP)
- N1. Medical diagnosis, condition detection, allergy claims, or any clinical statement.
- N2. Real payment processing (Telebirr/card) — pricing is displayed only.
- N3. Live integration with Kuriftu's real POS/PMS — bookings live in our DB.
- N4. Guest self-service mobile app — therapist is the only operator.
- N5. Training a custom skin model.
- N6. Multi-language (Amharic, Afaan Oromo) — **deferred to future scope.** MVP is English-only.

---

## 4. Users

- **Primary user — Kuriftu Therapist:** operates the intake flow on a tablet/laptop. Captures photo, fills intake, reviews and confirms the plan, creates the booking. Human-in-the-loop reduces liability and improves accuracy.
- **Secondary user — Kuriftu Manager/Admin:** uses the dashboard to (a) manage the **service menu and its ingredients**, and (b) view/manage bookings and revenue metrics.
- **Subject (not a user) — Guest:** never operates the system in MVP; consents to a photo being taken.

---

## 5. Scope & Core Flows

### 5.1 Flow A — Therapist Intake (primary)
1. Therapist logs in.
2. Creates/selects a guest record (name, **consent captured**).
3. Captures or uploads a guest photo.
4. System runs the **SkinAnalysisProvider** → returns cosmetic attributes (including a sensitivity hint).
5. Therapist adds intake context: goals (e.g. hydration, glow, relaxation), sensitivities, length of stay (days), budget tier.
6. System generates a **sequenced treatment plan** from the Kuriftu menu — **filtering/flagging services by ingredient vs. sensitivity** — with rationale, total ETB, and total duration.
7. Therapist reviews, optionally toggles items, confirms.
8. System creates a **booking** (saved to DB).

### 5.2 Flow B — Admin: Service & Ingredient Management (new)
1. Admin logs in.
2. Opens the **Services** area of the dashboard.
3. Creates or edits a service: name, category, description, duration, price (ETB), target attributes, and a **list of ingredients** — each optionally flagged as a *potential irritant for sensitive skin*.
4. Activates/deactivates services. Only active services are eligible for plans.

### 5.3 Flow C — Admin: Booking Management
1. Admin sees a list of bookings (filter by status/date/therapist).
2. Opens a booking, updates status (pending → confirmed → completed → cancelled).
3. Sees summary metrics: bookings count, average basket (ETB), average attach rate, top services.

---

## 6. Functional Requirements

**Assessment**
- FR1. The system shall accept an image (capture or upload, JPEG/PNG, ≤ 8 MB).
- FR2. The system shall return a structured cosmetic assessment: `skinType`, `hydration`, `oiliness`, `texture`, `sensitivityHint`, `pigmentationEvenness`, plus `confidence`. **No medical/condition field exists in the schema.**
- FR3. If the provider fails or `MOCK_MODE=true`, the system shall return a canned assessment without erroring. (Demo safety.)
- FR4. The system shall not persist the raw photo by default; it stores **derived attributes only** unless image retention is explicitly enabled. (Privacy.)

**Service & ingredient management (admin)**
- FR5. Admins shall create and edit services including: name, category, description, duration, `priceETB`, `targetAttributes`, and an **`ingredients` list**.
- FR6. Each ingredient shall carry an optional `irritantForSensitive` flag (cosmetic suitability only — never an allergy/medical claim).
- FR7. Admins shall activate/deactivate services. Only `active` services are eligible for plan generation.

**Plan generation**
- FR8. The system shall generate a plan of 1–N services **selected only from active Kuriftu menu items in the DB**. Any item the LLM returns that does not match a real `treatmentId` shall be rejected/dropped (validated server-side).
- FR9. The `PlanGenerator` shall **consider each candidate service's ingredients against the guest's sensitivity** before recommending. For a `sensitivityHint` of `high`, services containing ingredients flagged `irritantForSensitive` shall be **avoided, or surfaced with an explicit caution**, and the rationale shall reflect this reasoning.
- FR10. Each plan item shall include: `treatmentId`, `dayOfStay`, and a short `rationale` tied to the assessment, goals, and (where relevant) ingredient suitability.
- FR11. The plan shall compute `totalETB` and `totalDurationMinutes` from authoritative DB pricing — **never from LLM-stated prices.**
- FR12. The therapist shall be able to remove items before confirming; totals recompute.

**Booking & dashboard**
- FR13. Confirming a plan shall create a `Booking` persisted in MongoDB, linked to guest, assessment, plan, and creating therapist.
- FR14. The dashboard shall list bookings with filters (status, date range, therapist).
- FR15. Staff shall update booking status through a defined state machine: `pending → confirmed → completed`, plus `cancelled` from any non-completed state.
- FR16. The dashboard shall compute and display: total bookings, average basket (ETB), average attach rate (items per booking), top services.

**Auth**
- FR17. Staff (therapist/admin) shall authenticate via email + password (JWT). Roles gate the dashboard; service management is admin-only.

---

## 7. AI / ML Requirements

### 7.1 Adapter pattern (required)
All skin analysis goes through a single interface so the vision provider is swappable (Claude Vision now, a specialized dermatology-cosmetic API later) without touching business logic.

```typescript
// src/ai/SkinAnalysisProvider.ts
export interface SkinAttributes {
  skinType: 'dry' | 'normal' | 'combination' | 'oily';
  hydration: 'low' | 'medium' | 'high';
  oiliness: 'low' | 'medium' | 'high';
  texture: 'smooth' | 'uneven' | 'rough';
  sensitivityHint: 'low' | 'medium' | 'high';
  pigmentationEvenness: 'even' | 'slightly_uneven' | 'uneven';
  confidence: number; // 0..1
}

export interface SkinAnalysisProvider {
  analyze(imageBase64: string, mediaType: string): Promise<SkinAttributes>;
}
```

- AI1. `ClaudeVisionAdapter` implements `SkinAnalysisProvider` using the Anthropic Messages API with an image block. It is prompted to return **strict JSON matching `SkinAttributes`** and to stay strictly cosmetic — **no diagnosis, no condition naming, no medical language.** Output is schema-validated (e.g. Zod) before use; invalid output triggers the fallback.
- AI2. `MockSkinAnalysisProvider` returns deterministic canned attributes. Selected when `MOCK_MODE=true`. This is the on-stage safety net.
- AI3. A factory selects the provider from env. Business logic never references a concrete adapter.

### 7.2 Plan generation (ingredient-aware)
- AI4. A `PlanGenerator` service sends Claude: the `SkinAttributes`, the guest intake (goals, sensitivities, stay length, budget tier), and the **full active menu (ids, names, categories, target attributes, and each service's ingredients + irritant flags)**. It must return JSON: an ordered list of `{ treatmentId, dayOfStay, rationale }`.
- AI5. The prompt constrains selection to provided `treatmentId`s only. Server-side validation drops any unknown id (defense against hallucinated services).
- AI6. **Ingredient reasoning:** the prompt instructs the model to weigh ingredient suitability against `sensitivityHint`. The server may additionally **pre-filter** services flagged `irritantForSensitive` for high-sensitivity guests, so safety does not rely on the model alone.
- AI7. Prices and durations are **recomputed from the DB**, not trusted from the model.

### 7.3 Hard constraints
- AI8. Cosmetic-only. The word "diagnosis," condition names, and allergy/reaction claims must not appear in any output. The assessment schema structurally cannot hold a medical condition. Ingredient flags express cosmetic *suitability* ("may not suit sensitive skin"), not allergy risk.
- AI9. Claude Vision is a general model, not a clinical device. Copy and consent text must reflect this ("cosmetic guidance, not medical advice").

---

## 8. Data Model (MongoDB / Mongoose)

```typescript
// User (Kuriftu staff)
{
  name: string;
  email: string;            // unique
  passwordHash: string;
  role: 'therapist' | 'admin';
  createdAt: Date;
}

// Treatment (Kuriftu service menu — admin-managed)
{
  name: string;
  category: string;                 // e.g. 'facial' | 'body' | 'massage'
  description: string;
  durationMinutes: number;
  priceETB: number;
  targetAttributes: string[];       // e.g. ['hydration:low','skinType:dry']
  ingredients: [{
    name: string;
    role?: string;                  // e.g. 'active','exfoliant','fragrance','moisturizer'
    irritantForSensitive: boolean;  // cosmetic suitability flag (default false)
  }];
  active: boolean;
}

// Guest
{
  name: string;
  contact?: string;
  consentGiven: boolean;            // required true before assessment
  consentAt: Date;
  createdAt: Date;
}

// Assessment (derived attributes only; no raw photo by default)
{
  guestId: ObjectId;            // ref Guest
  therapistId: ObjectId;        // ref User
  attributes: SkinAttributes;   // embedded
  provider: 'claude-vision' | 'mock';
  imageRetained: boolean;       // default false
  createdAt: Date;
}

// TreatmentPlan
{
  guestId: ObjectId;
  assessmentId: ObjectId;
  items: [{
    treatmentId: ObjectId;      // ref Treatment
    dayOfStay: number;
    rationale: string;
  }];
  totalETB: number;             // computed from Treatment docs
  totalDurationMinutes: number; // computed
  createdAt: Date;
}

// Booking
{
  planId: ObjectId;
  guestId: ObjectId;
  createdBy: ObjectId;          // ref User (therapist)
  selectedItems: [{
    treatmentId: ObjectId;
    scheduledDate?: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  }];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalETB: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 9. API Surface (Express)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | public | Staff login → JWT |
| GET | `/api/treatments` | staff | List active menu items |
| POST | `/api/treatments` | admin | Create service (with ingredients) |
| PUT | `/api/treatments/:id` | admin | Edit service / ingredients |
| PATCH | `/api/treatments/:id` | admin | Activate / deactivate |
| POST | `/api/guests` | staff | Create guest (with consent) |
| POST | `/api/assessments` | therapist | Image in → cosmetic attributes (uses adapter) |
| POST | `/api/plans` | therapist | assessmentId + intake → generated plan |
| POST | `/api/bookings` | therapist | Create booking from a plan |
| GET | `/api/bookings` | staff | List/filter bookings (dashboard) |
| GET | `/api/bookings/:id` | staff | Booking detail |
| PATCH | `/api/bookings/:id` | staff | Update status (state machine) |
| GET | `/api/dashboard/metrics` | admin | Attach rate, avg basket, top services |

---

## 10. Architecture & Tech Stack

- **Language:** TypeScript
- **API:** Express.js (REST)
- **DB:** MongoDB + Mongoose
- **AI:** Anthropic Messages API (Claude Vision for assessment, Claude for plan generation) behind the adapter
- **Validation:** Zod (request bodies + LLM JSON output)
- **Auth:** JWT, bcrypt password hashing, role middleware
- **Frontend:** [your choice — keep it lean; therapist flow + admin dashboard with Services and Bookings areas]
- **Config:** env-driven (`MOCK_MODE`, `ANTHROPIC_API_KEY`, `JWT_SECRET`, `MONGODB_URI`)

**Layering:** routes → controllers → services (`AssessmentService`, `PlanGenerator`, `TreatmentService`, `BookingService`) → adapters/models. AI providers are injected, never imported directly into controllers.

---

## 11. Non-Functional Requirements

- NFR1. **Demo safety:** `MOCK_MODE` toggle returns canned assessment + plan with zero network dependency. A pre-seeded guest and known-good photo are part of the demo dataset.
- NFR2. **Performance:** assessment + plan round-trip target < 8s on conference Wi-Fi; show a loading state.
- NFR3. **Privacy:** raw photos not persisted by default; consent required and timestamped; no sensitive identity/financial data collected.
- NFR4. **Liability copy:** every assessment/plan screen carries a visible "cosmetic guidance, not medical advice" line (English).
- NFR5. **Resilience:** any AI failure degrades to fallback, never a broken screen.

---

## 12. Success Metrics

Pitch these in the room — they are hospitality language, not ML language.
- M1. **Attach rate:** avg treatments per booking (target: > 1, ideally 3+ across a stay).
- M2. **Basket size:** avg ETB per booking vs. single-treatment baseline.
- M3. **Time-to-plan:** therapist completes intake → confirmed booking in < 3 min.
- M4. **Demo:** 1 flawless live run end-to-end on June 14, including an ingredient-driven swap for a sensitive-skin guest.

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Live CV API fails / poor on dark skin under stage lights | Demo embarrassment | `MOCK_MODE` fallback; pre-tested known-good photo; happy-path only on stage |
| LLM hallucinates services or prices | Wrong plan / lost trust | Constrain to menu ids; server-side validation; prices from DB only |
| Ingredient logic drifts into allergy/medical claims | Liability | Cosmetic suitability flag only; explicit disclaimer copy; server pre-filter |
| "Diagnosis" framing invites liability | Judge skepticism | Cosmetic-only schema; therapist-in-the-loop |
| Scope creep (payments, real PMS, multi-language) | Miss June 14 | Hard non-goals (§3.2); booking lives in our DB only |

---

## 14. Future (post-hackathon, not built now)

- **Multi-language** (Amharic first, then Afaan Oromo) across UI and AI-generated plan text.
- Real Kuriftu PMS/POS + Telebirr integration.
- Guest self-service pre-arrival flow.
- Swap Claude Vision for a cosmetic-tuned model validated on darker skin tones.
- Richer ingredient intelligence (guest-declared sensitivities, ingredient-conflict detection across a multi-day plan).

---

## 15. Open Questions

- OQ1. Frontend framework preference, or leave to the team?
- OQ2. Do you have the actual Kuriftu menu (names, prices, durations, **ingredients**) to seed, or should we mock a representative menu for the demo?
- OQ3. Any branding constraints from Kuriftu (logo/colors) for the demo UI?
- OQ4. For ingredients — a free-text list per service, or a controlled/shared ingredient library admins pick from? (Library is cleaner for the irritant flag, slightly more build.)
# SkinSense AI — Backend API

Express + Mongoose backend for the SkinSense AI hackathon project (PRD v1.1).

Implements the API surface in PRD §9, the data model in §8, and the
swappable AI adapter pattern in §7.

## Quick start

```bash
cp .env.example .env       # then edit JWT_SECRET / MONGODB_URI as needed
npm install
npm run seed               # seeds users, ingredient catalog, 9 Kuriftu treatments
npm run dev                # http://localhost:4000
```

Default seeded accounts (override in `.env`):

| Role      | Email                       | Password         |
| --------- | --------------------------- | ---------------- |
| admin     | admin@kuriftu.local         | admin1234        |
| therapist | therapist@kuriftu.local     | therapist1234    |

## Folder layout

```
src/
  ai/             SkinAnalysisProvider interface, Mock + Claude Vision adapters,
                  PlanGenerator (ingredient-aware, PRD AI4-AI7).
  config/         env loader (zod-validated).
  controllers/    Thin: parse → call service → respond.
  db/             Mongo connection.
  middleware/     auth (JWT), role gate, error handler, request logger.
  models/         Mongoose schemas (PRD §8).
  routes/         Express routers, one per resource.
  services/       Business logic (AssessmentService, PlanService, BookingService…).
  seed/           Idempotent seed script.
  utils/          shared helpers (jwt, hash, mappers).
  validators/     Zod request-body schemas.
```

## AI modes

- `MOCK_MODE=true` (default): no network. Deterministic mock assessment + a
  rule-based PlanGenerator. Demo-safe.
- `MOCK_MODE=false` + `ANTHROPIC_API_KEY=…`: Claude Vision performs the
  assessment; the PlanGenerator still pre-filters server-side for
  high-sensitivity guests so safety never depends on the model alone (AI6).

## Disclaimer

This is cosmetic guidance only. The schema cannot represent medical
conditions, allergies, or diagnoses — by design (PRD AI8).

# SkinSense AI — Tasks

## :large_red_square: High Priority

## :large_yellow_square: Medium Priority

- Wire admin dashboard metrics to `GET /api/dashboard/metrics` (see `dashboard/src/lib/api.ts` stub)

## :white_tick: Completed Tasks

### 06/06/2026

- Unified frontend in `dashboard/` — copied all `client-side` UI (therapist intake, home, layouts, stores, API types); role-based routing (`admin` vs `therapist`); single `/login` with role redirect; `client-side/` left intact as legacy copy
- Admin services menu wired to full `/api/treatments` CRUD (dashboard `AppProvider` + `ServicesPage` + `ServiceFormPage` loading states)
- Admin ingredient library wired to full `/api/ingredients` CRUD (backend routes + dashboard `AppProvider` + `IngredientsPage` loading states)

### 06/02/2026

- Full therapist intake + booking API integration in `client-side` (login, guests, assessments, treatments, plans, `POST /api/bookings`, home list, confirmation refresh)

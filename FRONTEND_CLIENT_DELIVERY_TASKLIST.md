# Frontend Transition Task List (MVP to Client Delivery)

Last updated: March 3, 2026  
Scope: Frontend-only transition from current `health1/client` (React CRA) to client-deliverable frontend on `latest` (Next.js).

## 1. Goal

Deliver a stable, production-ready, mobile-first frontend suitable for client handover, while preserving existing business flows from MVP.

## 2. Current Status Snapshot

- Existing production logic/UI is in `health1/client` (React 18 + CRA + React Router).
- New frontend foundation exists in `latest` (Next.js 16 + App Router + TypeScript + Tailwind).
- Migration has not started yet at feature level (only scaffold is ready in `latest`).

## 3. Transition Approach

Use `latest` as the new frontend codebase and migrate module-by-module from `health1/client` with parity checks.

## 4. Frontend Workstream Task List

## A. Architecture & Project Foundation

- Define folder architecture in `latest` for `app`, `features`, `components`, `lib`, `types`, `styles`.
- Define route groups for `public`, `patient`, `doctor`, `receptionist`, `admin`.
- Add environment strategy for `dev`, `staging`, `prod` frontend variables.
- Create API client layer with centralized interceptors and error mapping.
- Define global error boundary and not-found page strategy.

## B. Route Migration (Page-by-Page)

- Map all current routes from `health1/client/src/App.js` to Next App Router paths.
- Migrate public routes first: landing, login, register.
- Migrate patient routes: home, booking, appointments, profile, notifications.
- Migrate doctor routes: profile, appointments, patients.
- Migrate admin routes: users, doctors.
- Implement route guards for authenticated/role-based pages.
- Validate deep-link behavior and refresh-safe navigation.

## C. Authentication UX & Session Handling

- Rebuild login/register screens in Next.js.
- Implement patient phone OTP-compatible UX placeholders (provider integration handled backend).
- Implement token/session storage strategy and silent re-auth behavior.
- Add forced logout flow for expired/invalid tokens.
- Add role-based redirect rules after login.

## D. UI System & Mobile-First Consistency

- Extract reusable design tokens (spacing, color, radius, typography, shadows).
- Build core shared components: buttons, inputs, cards, tables, modals, loaders, badges.
- Standardize responsive breakpoints across all pages.
- Recreate landing page with doctor details parity.
- Replace one-off styles with reusable component styling patterns.

## E. Feature Parity Migration

- Appointment booking flow parity.
- Appointment listing and status handling parity.
- Notification page parity.
- Profile and user details parity.
- Doctor management list and actions parity.
- Patient records views parity.
- File upload UI parity for reports/prescriptions.

## F. Reliability, Performance, Accessibility

- Add loading skeletons and error states for all API-backed pages.
- Add empty states and retry actions.
- Optimize images/fonts for mobile network conditions.
- Add accessibility checks (labels, keyboard navigation, focus states, contrast).
- Run Core Web Vitals baseline checks for public pages.

## G. SEO & Public Surface

- Set real metadata for landing/public pages (title, description, OG tags).
- Add favicon/app icons and structured page metadata.
- Add sitemap/robots configuration for public sections.
- Keep private dashboards non-indexed.

## H. Quality Gates & Release Readiness

- Enable lint + typecheck + build checks in CI.
- Add smoke tests for critical user journeys.
- Add visual QA checklist for mobile/tablet/desktop.
- Add release checklist for frontend handover.

## 5. Recommended Delivery Milestones

## Milestone 1: Foundation (Week 1)

- Project architecture locked.
- API client and auth shell ready.
- Shared component base ready.

Definition of done:
- `latest` builds cleanly and has baseline layout + route guard framework.

## Milestone 2: Core User Flows (Week 2-3)

- Public + patient flows migrated.
- Doctor critical screens migrated.

Definition of done:
- End-to-end booking and appointment flows work from new frontend.

## Milestone 3: Admin/Polish/Client Handover (Week 4)

- Admin routes migrated.
- SEO/performance/accessibility pass.
- QA and sign-off package ready.

Definition of done:
- Full route parity with MVP frontend and documented release checklist completed.

## 6. Transition Risk Register (Frontend)

- Risk: Route behavior regression during migration.
- Mitigation: Route mapping sheet + parity test cases per page.

- Risk: Inconsistent role authorization UX.
- Mitigation: Central route-guard utility and role redirect tests.

- Risk: Styling drift across pages.
- Mitigation: shared design tokens/components before page migration.

- Risk: API contract mismatch.
- Mitigation: typed API layer + staging validation against backend.

## 7. Handover Artifacts Required for Client

- Route mapping document (old route to new route).
- UI component inventory and design token sheet.
- Known limitations + deferred items list.
- QA report (mobile/tablet/desktop).
- Deployment and rollback instructions for frontend.

## 8. Immediate Next Planning Actions (No code)

- Freeze final page inventory to migrate.
- Prioritize flows by client criticality.
- Decide deadline-driven scope cut list for V1.


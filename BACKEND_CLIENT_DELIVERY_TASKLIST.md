# Backend Transition Task List (MVP to Client Delivery)

Last updated: March 3, 2026  
Scope: Backend-only transition plan for `health1` to client-deliverable quality.

## 1. Goal

Deliver a secure, observable, API-stable backend that supports multi-location scheduling, patient records, payments status, and production-grade notification flows.

## 2. Current Backend Snapshot

- Runtime/framework: Node.js + Express (JavaScript)
- Database: MongoDB (Mongoose)
- Auth: JWT + role checks
- OTP: email-based flow currently in use
- File handling: `multer` local upload flow
- Logging: `morgan` request logs
- API style: REST under `/api/v1/*`

## 3. Backend Workstream Task List

## A. API Contract & Versioning

- Freeze and document all current `/api/v1` endpoints.
- Define response envelope standard for all controllers.
- Add API versioning policy and deprecation notes.
- Create OpenAPI spec for core modules:
  - auth
  - appointments/scheduling
  - doctor/receptionist/admin
  - documents
- Introduce generated API types for frontend integration.

## B. Request Validation & Error Model

- Add schema validation (Zod) to all write endpoints.
- Enforce strict validation for auth, booking, profile update, file metadata.
- Define unified error codes and error response shape.
- Add correlation ID in request context and error logs.

## C. Authentication, OTP, and Session Security

- Add phone OTP production flow (DLT-compliant integration path).
- Keep email OTP as fallback channel policy.
- Add OTP abuse protections:
  - per phone/IP/device rate limits
  - max attempt counters
  - temporary lockouts
- Harden JWT/session handling:
  - token expiry policy
  - refresh/rotation approach (if required)
  - server-side revoke strategy for compromised sessions

## D. Security Hardening (Must-have)

- Add `helmet` for security headers.
- Add strict `cors` origin allowlist.
- Add `express-rate-limit` (global + auth/OTP stricter buckets).
- Add payload size limits and upload size/type enforcement.
- Add security-focused middleware order review.
- Remove any sensitive data leakage from API responses/logs.

## E. Multi-Location Scheduling Integrity

- Enforce no-overlap constraints across doctor locations and times.
- Normalize schedule recurrence representation.
- Add slot generation conflict checks for weekly/monthly/custom rules.
- Add race-condition safeguards on booking (double-book prevention).

## F. Payment Status and Auditability

- Standardize payment state machine (`PAID`, `UNPAID`, optional `PARTIAL`).
- Track actor + timestamp for receptionist payment updates.
- Add immutable audit trail for payment status changes.

## G. Document Storage & Patient Records

- Move uploads from local disk to secure object storage.
- Keep metadata and access controls in DB.
- Enforce document visibility by role + appointment relation.
- Add signed URL or controlled download pathway.

## H. Notification Delivery Pipeline

- Decouple notification send from request-response path.
- Add queue-based workers for SMS/email/WhatsApp events.
- Add retry, failure, and dead-letter handling.
- Track delivery states in DB for support visibility.

## I. Observability, Operations, and Reliability

- Replace/augment request logging with structured JSON logs (`pino`).
- Add metrics:
  - API latency
  - error rate
  - queue backlog
  - OTP failure rates
- Add health/readiness endpoints.
- Add backup and restore verification process.
- Add staging environment parity checks before production release.

## J. Testing & Release Quality Gates

- Add unit tests for validation, auth, scheduling conflict logic.
- Add integration tests for critical flows:
  - login/otp/register
  - book appointment
  - upload/download documents
  - payment status updates
- Add API smoke tests in CI.
- Require lint + tests + build checks before release.

## 4. Milestones (Backend)

## Milestone 1: Security + Contract Baseline (Week 1-2)

- validation layer added
- security middleware stack added
- API response/error contract finalized

Definition of done:
- Core auth and appointment endpoints meet contract and security baseline.

## Milestone 2: Functional Integrity (Week 2-4)

- scheduling conflict protections
- payment auditability
- notification pipeline decoupling started

Definition of done:
- Booking and payment workflows are deterministic and auditable.

## Milestone 3: Production Reliability (Week 4-6)

- queue workers + delivery tracking
- storage hardening
- metrics/logging/alerts + backup drills

Definition of done:
- Backend is monitorable, recoverable, and support-ready for client operations.

## 5. Backend Handover Checklist

- API contract document signed off.
- Role permission matrix validated.
- OTP and auth abuse controls tested.
- Security middleware and rate limits active in production.
- Audit logs available for key actions.
- Backup/restore proof documented.
- Incident response and on-call contact process documented.

## 6. Priority Order (if timeline is tight)

1. Security hardening + request validation.
2. OTP/auth reliability and abuse prevention.
3. Scheduling and booking integrity checks.
4. Logging/metrics and alerting.
5. Queue + advanced delivery and storage improvements.


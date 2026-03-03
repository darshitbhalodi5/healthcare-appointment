# Database & Storage Transition Task List (MVP to Client Delivery)

Last updated: March 3, 2026  
Scope: Data layer and document storage readiness for client delivery.

## 1. Goal

Move from MVP-grade data/storage setup to a production-ready model that is secure, reliable, auditable, and easy to operate for healthcare workflows.

## 2. Current Snapshot

- Primary DB: MongoDB (`mongoose`) in `health1`.
- Files: local server storage under project uploads.
- Data model: user/doctor/appointment/documents built for MVP velocity.
- Backup/restore and disaster recovery process: not formalized for client SLA.

## 3. Client-Ready Target State

## 3.1 Database target

Recommended:
- PostgreSQL as the operational system of record for:
  - recurring schedules
  - slot generation
  - appointments
  - payment status audit
  - role/permission controls

Reason:
- relational constraints are better for schedule conflicts, payment states, and audit-heavy workflows.

## 3.2 Storage target

Recommended:
- Object storage (S3-compatible) for reports/prescriptions/uploads.
- Database stores only metadata, ownership, access policy, and lifecycle state.

Reason:
- Local filesystem uploads are not durable/scalable enough for client delivery.

## 4. Data Domains to Formalize

- Identity domain: users, roles, auth events.
- Practice domain: doctor profile, locations, fees.
- Scheduling domain: availability rules, generated slots, booking locks.
- Clinical docs domain: files, versions, visibility permissions, timeline.
- Billing domain: payment status transitions and audit trail.
- Compliance domain: consent records, deletion requests, retention policies.

## 5. DB Design Requirements (Client-Ready)

- Unique constraints:
  - user phone/email uniqueness strategy
  - slot uniqueness per doctor/location/date-time
- Integrity constraints:
  - no overlapping active schedules for same doctor
  - valid payment state transitions only
- Audit fields on critical tables:
  - `created_at`, `updated_at`, `created_by`, `updated_by`
- Soft delete strategy where needed:
  - maintain traceability while supporting patient deletion flows
- Index strategy:
  - doctor/date/location schedule queries
  - appointment status timelines
  - patient history retrieval

## 6. Storage Design Requirements (Client-Ready)

- Bucket/container strategy:
  - separate environments: `dev`, `staging`, `prod`
  - logical prefixes per tenant/domain (`patient-docs`, `prescriptions`)
- File key structure:
  - non-guessable object keys
  - no PII in file names/paths
- Access model:
  - private objects by default
  - signed URL or controlled download endpoint
- Validation:
  - strict MIME + extension + size validation
  - malware scanning workflow (if feasible)
- Lifecycle:
  - retention rules by document type
  - deletion propagation to storage + metadata

## 7. Security & Compliance Controls (Data Layer)

- Encryption in transit (TLS) and at rest for DB/storage.
- Secrets management for DB and storage credentials.
- Row/record access enforcement via backend role checks.
- Data minimization for stored patient personal details.
- Audit logs for:
  - document access/download
  - payment updates
  - profile/schedule edits
- Data deletion workflow aligned with patient request handling.

## 8. Backup, Recovery, and Reliability Tasks

- Define RPO/RTO targets with client.
- Automated DB backups with retention schedule.
- Point-in-time recovery (PITR) setup for production DB.
- Storage versioning or recovery strategy for accidental deletions.
- Monthly restore drill (DB + documents metadata consistency check).
- Incident runbook for data corruption/data loss.

## 9. Migration Strategy (Practical)

## Phase 1: Stabilize current MVP data setup

- Add clear data dictionary for existing Mongo models.
- Add missing indexes for hot queries.
- Improve upload metadata consistency and validation.
- Define backup cadence immediately (even before full migration).

## Phase 2: Dual-track readiness

- Design PostgreSQL schema mapped to current business entities.
- Build migration mapping document (Mongo model to SQL table).
- Introduce storage abstraction layer in backend code.
- Start writing new uploads to object storage in staging.

## Phase 3: Cutover

- Backfill data from Mongo to PostgreSQL.
- Verify parity for key reports and operational workflows.
- Switch reads/writes to new DB in controlled rollout.
- Freeze legacy write paths, keep rollback plan.

## 10. Decision Matrix (If timeline is tight)

Option A (fast launch):
- Keep MongoDB for V1, move files to object storage now, add strict backups/audit.

Option B (client-contract preferred):
- Migrate to PostgreSQL + object storage before final handover.

Recommended default:
- Option A for immediate go-live, then planned Option B within a fixed post-launch window.

## 11. Delivery Checklist (DB + Storage)

- Data model document approved.
- Critical constraints/indexes implemented.
- Object storage integration tested.
- Upload/download authorization tested by role.
- Backup + restore evidence documented.
- Retention and deletion workflow tested.
- Monitoring for DB/storage health active.

## 12. Dependencies on Other Workstreams

- Frontend migration depends on stable API contracts and document URLs strategy.
- Auth/OTP hardening depends on identity schema consistency.
- Notification and billing tracking depend on immutable event/audit records.


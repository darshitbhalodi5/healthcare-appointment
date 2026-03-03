# Specification Upgrade Task List (Functional Scope Delta)

Last updated: March 3, 2026  
Scope: Convert MVP behavior into client-contract functional behavior across core product modules.

## 1. Purpose

This document expands the `Functional Scope Delta` section into execution tasks, acceptance criteria, and validation points for delivery planning and UAT sign-off.

## 2. Functional Delta Matrix (Expanded)

| Area | MVP Typical Behavior | Client-Ready Requirement |
|---|---|---|
| Multi-location scheduling | Basic slot setup | Recurring rules, overlap prevention across locations, slot auto-generation with conflict checks |
| Booking workflow | Basic booking/approval | Auto-approval policy + doctor cancellation reason + patient notification trail |
| Payment status | Manual/basic state | Paid/Unpaid lifecycle, receptionist marking with timestamp and actor audit |
| Patient history | Fragmented uploads | Unified chronological record timeline (appointments, uploads, prescriptions, notes) |
| Prescription management | Upload file only | Versioned prescription records + download history + role-restricted visibility |
| Data deletion | Ad-hoc/manual | Formal patient deletion request flow with one-click purge and deletion audit |
| Access control | Role-based basic | Permission matrix per role, especially receptionist configurable scope |
| OTP/login | Not fully production SMS-ready | DLT-compliant phone OTP with abuse controls and fallback policy |
| Reliability | Best effort | Defined uptime target, incident response, backup and restore drills |

## 3. Area-Wise Task Breakdown

## A. Multi-Location Scheduling

Tasks:
- Add recurring schedule types (weekly, monthly, custom interval).
- Add overlap validation across all active locations for same doctor.
- Auto-generate slots based on recurrence + slot duration.
- Add schedule conflict error messaging for receptionist/doctor workflows.

Acceptance criteria:
- System rejects overlapping slots across locations.
- Recurring schedules generate expected future slots without duplicates.
- Slot availability updates correctly after booking/cancellation.

## B. Booking Workflow

Tasks:
- Implement auto-approval with configurable doctor override.
- Add mandatory cancellation reason for doctor/receptionist cancellation.
- Add event trail for booking state transitions.
- Trigger notifications on booking create/cancel/reschedule.

Acceptance criteria:
- Every status transition is time-stamped and actor-stamped.
- Patient receives booking/cancellation communication trail.

## C. Payment Status

Tasks:
- Define payment states (`UNPAID`, `PAID`, optional `PARTIAL`).
- Add receptionist mark-paid endpoint with audit fields.
- Add history log for payment state changes.

Acceptance criteria:
- Payment status changes are traceable by actor and timestamp.
- Dashboard/report can filter by payment status and period.

## D. Patient History

Tasks:
- Build unified patient timeline by date-time.
- Merge appointment notes, reports, prescriptions, and status events.
- Add patient search with fast timeline retrieval.

Acceptance criteria:
- Doctor can view complete chronological history in one view.
- Timeline includes document actions and clinical notes.

## E. Prescription Management

Tasks:
- Add prescription versioning model.
- Track uploader, time, and version reason (if replaced).
- Add controlled download history logging.
- Enforce role-based visibility rules.

Acceptance criteria:
- Latest version is clearly identified.
- Prior versions remain auditable (unless deleted by policy).
- Unauthorized roles cannot access restricted documents.

## F. Data Deletion

Tasks:
- Add patient deletion request submission flow.
- Add doctor/admin review + one-click deletion execution.
- Add deletion audit log and confirmation record.
- Ensure storage and DB metadata are both cleaned.

Acceptance criteria:
- Deletion workflow is reproducible and auditable.
- No orphaned documents remain after deletion action.

## G. Access Control

Tasks:
- Define formal permission matrix for all roles.
- Add configurable receptionist permissions by doctor.
- Enforce permission checks at backend service layer.
- Add admin view to review/modify granted permissions.

Acceptance criteria:
- API access denied when role lacks permission.
- Receptionist can only perform explicitly granted actions.

## H. OTP/Login

Tasks:
- Implement phone OTP flow with DLT template mapping.
- Add OTP abuse controls (rate limit, attempts, lockout).
- Keep fallback channel behavior explicitly defined.
- Add login audit events and anomaly alerts.

Acceptance criteria:
- OTP flow passes real-provider staging tests.
- Abuse controls block repeated invalid attempts.

## I. Reliability

Tasks:
- Define uptime and latency targets with stakeholder sign-off.
- Add health checks, monitoring dashboards, and alerting.
- Add incident response runbook and escalation path.
- Add backup policy + restore drill schedule.

Acceptance criteria:
- Alerting triggers correctly for key failure modes.
- Restore drill evidence exists and is verified.

## 4. Cross-Cutting Dependencies

- Auth/OTP requirements depend on SMS/OTP provider and DLT onboarding.
- Payment and scheduling integrity depend on data-model constraints.
- History and prescription modules depend on storage metadata quality.
- Reliability sign-off depends on observability/operations baseline.

## 5. Test & UAT Checklist by Scope Delta

- Scheduling conflict tests (same doctor, different locations).
- Recurrence generation tests (weekly/monthly/custom).
- Booking transition tests (booked/cancelled/rescheduled/completed).
- Payment audit tests (mark paid, actor/time validation).
- Timeline tests (ordering and completeness).
- Prescription version access tests (role restrictions).
- Data deletion end-to-end tests (DB + storage cleanup).
- OTP abuse and fallback tests.
- Reliability tests (health checks, alerts, backup restore).

## 6. Prioritized Implementation Order

1. Access control + OTP/login hardening.
2. Scheduling conflict rules + booking workflow integrity.
3. Payment lifecycle + audit trail.
4. Patient history + prescription versioning.
5. Data deletion automation.
6. Reliability guardrails and operational drills.

## 7. Client Sign-Off Artifacts

- Updated SRS mapping document (feature-by-feature).
- Permission matrix and role behavior sheet.
- UAT report for all scope-delta areas.
- Incident/backup drill proof.
- Go-live readiness checklist signed by owner/stakeholder.


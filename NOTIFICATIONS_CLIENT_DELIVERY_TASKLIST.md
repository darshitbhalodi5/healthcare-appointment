# Notifications Transition Task List (MVP to Client Delivery)

Last updated: March 3, 2026  
Scope: SMS/Email/WhatsApp notification architecture, delivery reliability, and auditability.

## 1. Goal

Deliver a reliable multi-channel notification system for appointments, OTP, and clinical workflow updates, with delivery tracking and compliance controls.

## 2. Current Snapshot

- MVP is primarily email-oriented for OTP and communications.
- Push notification utilities exist but full production delivery governance is limited.
- Message workflow is not fully queue-driven yet.

## 3. Client-Ready Target State

- Multi-channel notifications:
  - SMS (primary for OTP and service alerts)
  - Email (fallback and detailed communication)
  - Optional WhatsApp (if approved/available)
- Template-governed messaging.
- Queue-based asynchronous dispatch with retries and failure handling.
- End-to-end delivery visibility for support team.

## 4. Notification Workstream Tasks

## A. Event-Driven Notification Model

- Define all notification events:
  - OTP send
  - appointment booked
  - appointment reminder
  - appointment cancelled/rescheduled
  - document uploaded
  - prescription available
- Define channel preference and fallback order per event.

## B. Template Management

- Create template registry with versioning.
- Separate templates by channel and role (patient/doctor/receptionist).
- Enforce parameter validation to avoid malformed messages.
- Keep low-content SMS for sensitive workflows (no clinical details).

## C. SMS OTP & Service Messaging

- Integrate DLT-compliant provider path.
- Map template IDs and headers in configuration.
- Add delivery status callbacks (delivered/failed/rejected).
- Handle provider-specific error codes centrally.

## D. Queue & Retry Architecture

- Introduce queue worker for notification jobs.
- Add retry policy with capped attempts.
- Add dead-letter queue for failed messages.
- Add idempotency controls to prevent duplicate sends.

## E. Delivery Tracking & Support Visibility

- Persist message lifecycle states:
  - queued
  - sent
  - delivered
  - failed
  - retried
- Build admin/receptionist support view for message status checks.
- Add manual resend policy for eligible failed events.

## F. User Preference & Quiet-Hour Policy

- Define mandatory vs optional notification categories.
- Add user preference controls for optional reminders.
- Add quiet-hour rules where applicable (except critical OTP/service needs).

## G. Security Controls for Notifications

- Remove sensitive medical details from SMS bodies.
- Protect webhook endpoints with signature verification.
- Encrypt and protect notification logs containing PII.

## 5. Integration Requirements (Frontend + Backend)

- Frontend should show clear status:
  - OTP sent/resent
  - cooldown timer
  - delivery failure fallback guidance
- Backend should expose consistent event status APIs for support tools.
- Align notification state names across frontend/backend contracts.

## 6. Milestones

## Milestone 1 (Week 1)

- Event catalog and template registry finalized.
- SMS provider integration skeleton + config strategy.

## Milestone 2 (Week 2)

- Queue-based dispatcher live in staging.
- Retry/dead-letter and status persistence working.

## Milestone 3 (Week 3)

- Delivery dashboards and support SOP completed.
- Fallback routing and failure drills tested.

## 7. Handover Checklist

- Notification event matrix approved.
- Template list with IDs documented.
- Retry/failure handling tested.
- Delivery logs queryable by support/admin.
- Channel fallback behavior validated in UAT.


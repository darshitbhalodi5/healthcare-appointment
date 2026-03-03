# Authentication & Authorization Transition Task List (MVP to Client Delivery)

Last updated: March 3, 2026  
Scope: Login, identity, session management, role access, and authorization controls.

## 1. Goal

Deliver a production-ready auth system that is secure, auditable, and aligned with doctor/receptionist/patient workflows.

## 2. Current Snapshot

- JWT-based auth in backend.
- Role-based access exists at basic level.
- OTP path is currently email-based in code.
- Frontend route protection exists in MVP React app.

## 3. Client-Ready Target State

- Patient-first phone login with OTP (India DLT-compliant flow).
- Doctor/receptionist secure login with strong password controls.
- Clear session lifecycle (issue, refresh/expiry, revoke).
- Fine-grained role + permission enforcement (not only route-level).
- Full auth auditability for support and incident handling.

## 4. Authentication Workstream Tasks

## A. Identity Model Hardening

- Define canonical identity keys:
  - patient: primary phone, optional email
  - doctor/receptionist: ID + email/phone as required
- Enforce uniqueness and verification state in data model.
- Add account status states (`active`, `locked`, `suspended`, `pending`).

## B. Login & Registration Flows

- Implement phone OTP registration/login flow for patients.
- Keep controlled fallback channel (email OTP only where policy permits).
- Add resend policy:
  - cooldown
  - resend cap
- Add password policy for non-OTP roles (doctor/receptionist/admin).

## C. OTP Security Controls

- OTP expiry 3-5 minutes.
- Max attempts per OTP.
- One-time use invalidation.
- Rate limits by phone/IP/device.
- Temporary lockout after repeated failures.
- Store OTP hashed, never plaintext.

## D. Token & Session Management

- Standardize JWT claims and token TTL.
- Add refresh token policy (if required by UX/session length).
- Add revoke/blacklist mechanism for compromised sessions.
- Force logout from all sessions for account recovery events.

## E. Password & Credential Controls

- Maintain bcrypt hashing with cost-factor policy.
- Add password complexity and breached-password checks (if feasible).
- Add password reset flow with verified channel.
- Add lockout and challenge on repeated failed login attempts.

## F. Authorization Model (RBAC/PBAC)

- Define permission matrix for:
  - doctor
  - receptionist
  - patient
  - admin
- Add receptionist scoped permissions (configurable by doctor).
- Enforce backend authorization on every protected endpoint.
- Remove any role checks that rely only on frontend logic.

## G. Audit & Monitoring for Auth

- Log critical auth events:
  - login success/failure
  - OTP sent/verified/failed
  - password changes/resets
  - account lock/unlock
  - permission updates
- Add anomaly alerts (OTP abuse spikes, brute-force patterns).

## 5. Integration Requirements (Frontend + Backend)

- Unified auth API contract (`/auth/*` or versioned equivalent).
- Consistent error codes/messages for login/OTP states.
- Standard auth SDK/wrapper in frontend for token/session handling.
- Route guards in frontend must map to backend permission checks.

## 6. Compliance & Legal Dependencies

- SMS OTP must use approved DLT templates/headers/PE mapping.
- Consent notice for OTP and service messages must be visible to users.
- Retain auth logs per policy and incident response requirements.

## 7. Milestones

## Milestone 1 (Week 1)

- Auth model and permission matrix finalized.
- OTP security/rate-limit baseline active.

## Milestone 2 (Week 2)

- Patient phone OTP flow end-to-end in staging.
- Doctor/receptionist auth hardening completed.

## Milestone 3 (Week 3)

- Auth audit logs, alerts, and recovery workflows verified.

## 8. Handover Checklist

- Role-permission matrix approved by stakeholder.
- OTP flow tested with real numbers/providers.
- Lockout/rate-limit tests passed.
- Session expiry/revoke behavior tested.
- Auth event logs queryable by support team.


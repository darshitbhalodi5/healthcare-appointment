# MVP to Client Delivery Transition Plan

Last updated: March 3, 2026  
Project: Multi-Location Doctor Appointment & Patient Management Web Application  
Current codebase: `health1` (Express + MongoDB + React CRA)

## 1. Objective

Define what changes are required to move from current MVP-level implementation to a client-deliverable production system, specifically for:
- independent doctor operating across multiple locations
- receptionist-assisted workflow
- patient self-service with records and prescriptions

## 2. Current MVP Baseline (What exists now)

- Backend: Node.js + Express (JavaScript), MongoDB via Mongoose
- Frontend: React (CRA) mobile-responsive app
- Auth: JWT-based role login; OTP flow currently email-oriented in code
- File handling: local upload handling with metadata in DB
- Notifications: email available; SMS OTP not fully integrated end-to-end
- Deployment model: suitable for MVP/demo and controlled usage

## 3. Client-Ready Target State (What should change)

## 3.1 Frontend Architecture

Current MVP:
- React CRA SPA

Client-ready:
- Move to Next.js (App Router, TypeScript)
- Server-side rendering for public/landing and SEO pages
- Shared design system + reusable component library
- Better route-level performance and bundle control

Reason:
- Better production performance, maintainability, and deployment flexibility.

## 3.2 Backend Architecture

Current MVP:
- Single Express JS app, limited modular boundaries

Client-ready:
- Keep monolith but move to TypeScript and modular service boundaries
- Use strict DTO validation for all APIs
- Introduce job queue for notifications and async tasks
- Add API versioning and deprecation policy

Reason:
- Reduces regressions and improves long-term change safety.

## 3.3 Database & Storage

Current MVP:
- MongoDB for operational data
- Local file uploads on server

Client-ready:
- Preferred: PostgreSQL for relational scheduling data and financial status tracking
- Use secure cloud object storage for prescriptions/reports (S3-compatible)
- Add DB backups, point-in-time recovery policy, and retention controls

Reason:
- Multi-location schedules, slot integrity, and payment tracking are easier to enforce relationally; local files are not client-safe.

## 3.4 Authentication & Authorization

Current MVP:
- JWT login per role
- OTP not fully implemented for Indian SMS production flow

Client-ready:
- Patient phone-first registration/login with OTP
- DLT-compliant SMS provider integration for India (template IDs, headers, PE mapping)
- Role-based access matrix hardened for doctor/receptionist/patient
- Add session management controls, brute-force protections, and audit logs

Reason:
- Required for real user onboarding and compliance-safe operations.

## 3.5 Notifications

Current MVP:
- Email-centric flow

Client-ready:
- Multi-channel notifications (SMS + WhatsApp/email as configured)
- Template-managed message engine
- Delivery status tracking and retry strategy

Reason:
- Reliability and visibility are required for appointment operations.

## 3.6 Security & Compliance

Current MVP:
- Basic auth and role checks

Client-ready:
- DPDP-ready data handling (notice, consent records, retention, deletion workflow)
- CERT-In aligned incident logging and escalation process
- Encryption at rest and in transit for sensitive documents
- Security hardening: rate limiting, WAF/reverse proxy, secrets management
- Periodic VAPT and dependency scanning

Reason:
- Mandatory for production healthcare-facing software delivery.

## 3.7 Observability & Operations

Current MVP:
- Basic logs

Client-ready:
- Structured centralized logs
- Metrics and uptime monitoring
- Error tracking with release correlation
- CI/CD with staging and production promotion gates

Reason:
- Needed for SLA commitment and support operations.

## 4. Specification Upgrade (Functional Scope Delta)

These are key specification upgrades from MVP behavior to client contract behavior.

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

## 5. Suggested Delivery Tiers

## Tier A: MVP Stabilization (keep stack, fast delivery)

- Continue with current Express + MongoDB + React app
- Complete critical gaps only:
  - SMS OTP production integration
  - secure file storage migration
  - audit logs and rate limits
  - basic monitoring and backup policy

Use when:
- timeline and budget are tight
- user volume is low to moderate
- objective is early production launch

## Tier B: Client-Ready V1 (recommended for formal handover)

- Frontend migration to Next.js TypeScript (`latest` project can be base)
- Backend TypeScript modularization
- PostgreSQL + object storage architecture
- full notification pipeline + compliance controls
- CI/CD and operational observability

Use when:
- this is a client-facing contracted delivery
- expected growth and support accountability are higher

## 6. Migration Roadmap (Practical)

Phase 1 (2 to 3 weeks):
- Lock current feature scope and stabilize production defects
- Implement SMS OTP integration and DLT mapping
- Move uploads to cloud object storage

Phase 2 (3 to 5 weeks):
- Introduce DB schema enhancements for recurring schedule/payment audit
- Harden RBAC and add audit/event logging
- Add monitoring, alerts, and backup verification

Phase 3 (4 to 8 weeks):
- Migrate frontend to Next.js TypeScript
- Optional backend TypeScript refactor
- Final compliance review, UAT, and release readiness

## 7. Contract-Ready Acceptance Checklist

- SRS aligned to implemented features and role permissions
- OTP/login flow tested with real provider and approved templates
- Multi-location recurring scheduling conflict checks proven
- Patient data retention/deletion flow documented and tested
- Security test report (VAPT/basic hardening) completed
- Backup restore drill evidence available
- Production monitoring and alerting active
- Admin/doctor/receptionist SOP documents delivered

## 8. Final Recommendation

For immediate release, keep the MVP stack and close critical risk gaps first (OTP, storage, security, audit).  
For client handover quality, execute Tier B and use the `latest` Next.js project as the frontend modernization track while preserving existing business logic from `health1`.


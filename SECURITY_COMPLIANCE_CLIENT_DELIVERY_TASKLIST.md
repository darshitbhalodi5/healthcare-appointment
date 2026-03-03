# Security & Compliance Transition Task List (MVP to Client Delivery)

Last updated: March 3, 2026  
Scope: Security hardening, operational controls, and India-focused compliance readiness for healthcare workflow software.

## 1. Goal

Establish production-grade security and compliance controls required for a client-deliverable healthcare appointment platform.

## 2. Current Snapshot

- Basic JWT auth and role checks are in place.
- Security middleware and centralized policy enforcement are limited.
- Compliance artifacts exist but need operational implementation alignment.

## 3. Client-Ready Target State

- Secure-by-default API and infrastructure posture.
- Documented and enforced privacy/compliance controls.
- Detectable, auditable, and reportable incident process.
- Evidence-based release readiness for client handover.

## 4. Security Workstream Tasks

## A. Application Security Baseline

- Add security headers (`helmet`).
- Add strict CORS allowlist by environment.
- Add global and endpoint-level rate limiting.
- Add payload size limits and strict input validation.
- Add safe error handling (no stack traces/sensitive leakage in responses).

## B. Authentication Security Controls

- Harden OTP endpoints with abuse protections.
- Add brute-force controls for credential login.
- Enforce secure session/token lifecycle.
- Add account lock and recovery workflows.

## C. Data Security Controls

- Enforce encryption in transit (HTTPS/TLS).
- Ensure encryption at rest for DB and object storage.
- Mask or restrict sensitive fields in logs.
- Implement strict file access authorization checks.

## D. Secrets & Configuration Management

- Move secrets from local patterns to secure secret manager strategy.
- Rotate JWT/smtp/provider credentials on defined schedule.
- Separate configs for dev/staging/prod with least privilege.

## E. Dependency & Supply-Chain Security

- Add dependency vulnerability scanning in CI.
- Add lockfile integrity and approved package policy.
- Define patch cadence for critical security updates.

## F. Infrastructure & Runtime Hardening

- Add reverse proxy/WAF strategy (if applicable).
- Restrict network exposure (ports, security groups, firewall rules).
- Enable structured logging and centralized log retention.
- Add environment-level access control and MFA for operators.

## 5. Compliance Workstream Tasks

## A. Privacy & Data Governance

- Publish and align Privacy Policy with actual data flows.
- Implement consent capture records for communication and data processing.
- Implement retention/deletion policy in system behavior.
- Add patient data deletion request workflow with audit trail.

## B. India Messaging/OTP Compliance

- Complete DLT registration artifacts for SMS use.
- Use approved message templates and headers.
- Keep template mapping records for audits and provider issues.

## C. Incident Response & Reporting

- Prepare incident response SOP with ownership matrix.
- Add incident severity classification and response timelines.
- Add breach communication template and escalation flow.
- Maintain logs and evidence required for regulatory response.

## D. Access Governance

- Define least-privilege permissions for doctor/receptionist/admin.
- Add periodic access review process.
- Log all privilege changes and admin actions.

## 6. Verification & Assurance Tasks

- Run baseline VAPT and remediate high/critical findings.
- Add security test cases to release checklist.
- Perform backup + restore drill and document evidence.
- Perform access-control and data-leak simulation tests.

## 7. Milestones

## Milestone 1 (Week 1-2)

- Security middleware baseline and validation in place.
- Secrets/config hygiene and basic monitoring active.

## Milestone 2 (Week 3-4)

- Compliance workflows operational (consent, deletion, logs).
- Incident response and escalation process documented.

## Milestone 3 (Week 5)

- VAPT remediation completed.
- Release evidence package ready for client handover.

## 8. Handover Checklist

- Security architecture note approved.
- Compliance policy set delivered:
  - privacy
  - retention
  - deletion
  - incident response
- VAPT report and remediation tracker attached.
- Access review and audit logging proof available.
- Production security controls validated in UAT sign-off.

## 9. Related Project Docs

- `SMS_OTP_REGULATION_INDIA.md`
- `BACKEND_CLIENT_DELIVERY_TASKLIST.md`
- `DB_STORAGE_CLIENT_DELIVERY_TASKLIST.md`
- `LIGHTWEIGHT_LIBRARY_STACK_AND_INTEGRATION.md`


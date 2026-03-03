# Observability & Operations Transition Task List (MVP to Client Delivery)

Last updated: March 3, 2026  
Scope: Monitoring, logging, alerting, reliability operations, release operations, and support readiness.

## 1. Goal

Move from MVP-level runtime visibility to production-grade observability and operations so the client can run the platform reliably with clear SLA/SLO controls.

## 2. Current Snapshot

- Basic request logging is present.
- No formal SLO/SLA measurement pipeline defined.
- Alerting, on-call, and incident operations are not fully standardized.
- Deployment and rollback procedures are not yet fully documented for client operations.

## 3. Client-Ready Target State

- Structured logs, metrics, traces, and health signals available per environment.
- Actionable alerts tied to service objectives.
- Runbooks and on-call process for incidents and recovery.
- Repeatable release workflow with rollback safety.

## 4. Observability Workstream Tasks

## A. Logging Standardization

- Move to structured JSON logging for API and workers.
- Add request correlation ID propagation across services/jobs.
- Standardize log levels (`debug`, `info`, `warn`, `error`, `fatal`).
- Redact sensitive fields (PII, tokens, credentials).
- Centralize log aggregation and retention by environment.

## B. Metrics and Dashboards

- Define core service metrics:
  - request rate
  - latency (p50/p95/p99)
  - error rate
  - queue depth/retry count
  - OTP success/failure ratio
- Define business metrics:
  - bookings/day
  - cancellation rate
  - payment completion rate
- Build dashboards for:
  - API health
  - auth/OTP
  - appointments
  - notifications
  - storage and DB health

## C. Tracing and Dependency Visibility

- Add distributed tracing for key flows:
  - login/otp
  - booking
  - upload/download document
  - notification dispatch
- Track external dependency latency/failures (SMS, email, DB, object storage).

## D. Health Checks and Synthetic Monitoring

- Add `/health` and `/ready` endpoints.
- Add scheduled synthetic checks for critical journeys:
  - login
  - booking
  - notification callback
- Add uptime checks per environment.

## E. Alerting Strategy

- Create severity-based alert catalog:
  - `P1`: full outage, data risk
  - `P2`: major degradation
  - `P3`: partial degradation
- Configure alerts for:
  - high 5xx rate
  - high latency
  - OTP failures spike
  - queue backlog saturation
  - DB/storage failure thresholds
- Route alerts to on-call channels with escalation policy.

## 5. Operations Workstream Tasks

## A. Environment and Release Operations

- Define environment parity (`dev`, `staging`, `prod`).
- Add CI/CD gates:
  - lint
  - tests
  - build
  - migration checks
- Add release checklist and change approval process.
- Add zero-downtime or low-downtime deployment approach.
- Define rollback procedure with clear trigger conditions.

## B. Database and Storage Operations

- Monitor DB connections, slow queries, lock/wait behavior.
- Monitor storage errors, upload failures, and signed URL failures.
- Add backup success/failure monitoring.
- Run periodic restore drills and document outcomes.

## C. Incident Management

- Create incident response runbook:
  - detection
  - triage
  - containment
  - recovery
  - postmortem
- Define ownership matrix and communication channels.
- Add post-incident template with root cause and action items.

## D. Capacity and Performance Operations

- Set baseline capacity for expected user load.
- Add scaling thresholds and plan (horizontal/vertical as applicable).
- Track performance regression during each release.
- Run load tests for booking and OTP peaks.

## E. Support Operations

- Create support dashboard for live operational status.
- Define L1/L2 support playbooks for common failures:
  - OTP not received
  - booking failures
  - document upload failures
- Add support-facing searchability for request IDs and user-safe diagnostics.

## 6. SLO/SLA Definition Tasks

- Define SLOs with client sign-off:
  - API availability target
  - p95 latency target
  - OTP delivery success target
  - notification delivery target
- Define error budget policy and escalation when breached.
- Publish monthly reliability report template.

## 7. Milestones

## Milestone 1 (Week 1-2)

- Structured logs + core metrics + health checks implemented.

## Milestone 2 (Week 3-4)

- Dashboards + alerting + runbooks operational in staging.

## Milestone 3 (Week 5)

- Production monitoring, on-call process, rollback drill, and SLO tracking active.

## 8. Handover Checklist

- Observability architecture note delivered.
- Dashboards and alert definitions shared with client team.
- On-call + escalation policy documented.
- Incident response runbook approved.
- Release/rollback SOP approved.
- SLO/SLA baselines agreed and measurable.


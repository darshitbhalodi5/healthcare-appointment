# Lightweight Library Stack & Frontend-Backend Integration Guide

Last updated: March 3, 2026  
Scope: Library decisions for client delivery (lightweight, fast, secure) and integration between new frontend (`latest`) and backend (`health1`).

## 1. Current Baseline (from existing code)

- Frontend (`health1/client`): React + Axios + Redux Toolkit + Ant Design.
- Backend (`health1`): Express + Mongoose + JWT + bcryptjs + multer + nodemailer.
- Integration today:
  - Frontend calls `/api/v1/*` via Axios.
  - CRA proxy routes `/api` to `http://localhost:3051`.
  - OTP flow is currently email-based in backend.

## 2. Library Selection Criteria

Use libraries that are:
- Lightweight in runtime and bundle impact.
- Fast in common request/response and render paths.
- Secure by default or with strong security controls.
- Easy to adopt incrementally (no full rewrite required).

## 3. Recommended Library Set (Client-Ready)

## 3.1 Frontend data + forms (Next.js app)

### A. Server state / API caching
- `@tanstack/react-query` (recommended)

Why:
- Handles caching, stale data, retries, request dedupe, optimistic updates.
- Reduces manual `useEffect + loading/error` boilerplate.

### B. Forms
- `react-hook-form` + `@hookform/resolvers` + `zod`

Why:
- `react-hook-form` is small and performant.
- `zod` gives runtime validation + strong TS inference.

### C. HTTP transport
- Prefer native `fetch` wrapper for smallest footprint in Next.js.
- Use Axios only where you explicitly need interceptors/cancellation behavior not covered by your wrapper.

Why:
- Keeps bundle lean and aligns with Next.js data-fetching model.

## 3.2 Frontend-backend contract typing

### Recommended path (least migration risk)
- `openapi-typescript` (+ `openapi-fetch` from same ecosystem)

Why:
- Keep existing REST architecture.
- Generate client types from OpenAPI spec.
- Avoid runtime-heavy SDK codegen.

### Alternative path (higher migration effort)
- `tRPC` for end-to-end types without OpenAPI.

Why/Tradeoff:
- Great type safety, but requires bigger backend/frontend contract refactor.
- Not ideal if you want minimum-disruption client handover.

## 3.3 Backend security + reliability core

Add these to Express:
- `helmet` (security headers)
- `cors` (strict allowlist configuration)
- `express-rate-limit` (especially auth/OTP endpoints)
- `compression` (response compression)
- `pino` + `pino-http` (fast structured logging)
- `zod` (request payload validation)

Optional upgrade:
- Move JWT handling from `jsonwebtoken` to `jose` over time.

## 3.4 Backend async and delivery reliability

- `bullmq` + Redis (for async notifications, retries, delayed reminders)

Why:
- Decouples user request from notification delivery.
- Better reliability and observability for SMS/Email/WhatsApp pipelines.

## 3.5 Data layer for Postgres migration track

- `pg` (node-postgres)
- `drizzle-orm` (+ drizzle-kit)

Why:
- `pg` is lightweight and battle-tested.
- Drizzle stays close to SQL and keeps runtime weight low.

## 3.6 File storage integration

- `@aws-sdk/client-s3` (or compatible provider SDK)

Why:
- Move from local uploads to secure object storage for client delivery.

## 4. Recommended Integration Architecture

## Phase 1 (minimum disruption, fastest)

- Keep REST endpoints under `/api/v1`.
- Add typed API contract:
  - maintain OpenAPI spec for existing endpoints
  - generate frontend types (`openapi-typescript`)
- Add React Query wrappers per domain:
  - `auth`, `appointments`, `doctors`, `documents`, `notifications`

## Phase 2 (client-ready hardening)

- Standardize response envelope:
  - `success`, `message`, `data`, `errorCode`, `meta`
- Add request validation with Zod on all public write endpoints.
- Add centralized error format and correlation IDs.

## Phase 3 (scale/reliability)

- Move notification sending to BullMQ workers.
- Add delivery webhooks + retry + dead-letter handling.

## 5. Concrete Library Recommendation Matrix

| Concern | Recommended | Why | Migration Effort |
|---|---|---|---|
| Server-state on frontend | `@tanstack/react-query` | Fast UX + cache + retries | Low |
| Form validation | `react-hook-form` + `zod` | Lightweight + type-safe | Low |
| API type safety | `openapi-typescript` | Works with existing REST | Medium |
| HTTP client | `fetch` wrapper | Lowest client weight | Low |
| Express hardening | `helmet`, `cors`, `express-rate-limit` | Security baseline | Low |
| Logging | `pino`, `pino-http` | Fast JSON logs | Low |
| Payload validation | `zod` | Prevent invalid input at boundary | Medium |
| Async jobs | `bullmq` | Reliable retries + scheduling | Medium |
| SQL migration | `pg` + `drizzle-orm` | Lightweight typed SQL path | Medium |

## 6. What to Avoid (for this project goal)

- Heavy full-stack rewrites before client handover.
- Multiple competing state libraries in frontend.
- Unvalidated request bodies in backend.
- Local-disk-only document storage in production.
- OTP/auth endpoints without strict rate limit and audit logs.

## 7. Suggested Adoption Order

1. Backend hardening libs (`helmet`, `rate-limit`, `pino`, `zod`).
2. Frontend query/form stack (`tanstack query`, `react-hook-form`, `zod`).
3. Contract typing (`openapi-typescript`).
4. Async queue (`bullmq`) for notifications.
5. DB/storage modernization (`pg` + Drizzle, cloud object storage).

## 8. Primary References

- TanStack Query docs: https://tanstack.com/query/latest/docs/react/installation
- React Hook Form: https://react-hook-form.com/
- Zod docs: https://zod.dev/
- openapi-typescript docs: https://openapi-ts.dev/introduction
- tRPC docs: https://trpc.io/docs/
- Express security best practices: https://expressjs.com/en/advanced/best-practice-security.html
- Helmet: https://www.npmjs.com/package/helmet
- express-rate-limit: https://www.npmjs.com/package/express-rate-limit
- Pino: https://github.com/pinojs/pino
- BullMQ docs: https://docs.bullmq.io/
- node-postgres docs: https://node-postgres.com/
- Drizzle ORM: https://github.com/drizzle-team/drizzle-orm
- Next.js route handlers: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
- Next.js data fetching: https://nextjs.org/docs/app/getting-started/fetching-data


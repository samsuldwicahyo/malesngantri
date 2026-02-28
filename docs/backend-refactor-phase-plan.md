# Malas Ngantri Backend Refactor Plan (Safe Migration)

## Phase 0 - Prep
1. Backup database and snapshot production queue rows.
2. Deploy code with dual-read compatibility disabled for writes.
3. Run migration in staging with representative production data.

## Phase 1 - Booking State Machine
1. Apply Prisma migration for `QueueStatus` mapping to final enum.
2. Enable transition guard via `canTransition(from, to)` in service layer.
3. Expose controlled endpoints for transitions:
   - `PATCH /queues/:id/check-in`
   - `PATCH /queues/:id/start`
   - `PATCH /queues/:id/complete`
   - `PATCH /queues/:id/no-show`

## Phase 2 - Auth + RBAC Hardening
1. Keep JWT auth as backend source of truth.
2. Enforce role-only operational routes (`ADMIN`, `BARBER`, `CUSTOMER`).
3. Block `SUPER_ADMIN` from tenant operational queue transitions.

## Phase 3 - Tenant Isolation
1. Apply `requireTenantOwnership` middleware to sensitive routes.
2. For update/delete operations, enforce tenant predicate (`id + barbershopId`).
3. Remove/lock compatibility endpoints that bypass tenant context.

## Phase 4 - Subscription Enforcement
1. Apply `requireActiveSubscription` on booking and operational tenant endpoints.
2. Return `403 SUBSCRIPTION_INACTIVE` for expired/suspended tenants.
3. Keep landing/public read-only endpoints accessible.

## Phase 5 - Routing Cleanup (Frontend)
1. Canonical routes:
   - `/`
   - `/:slug`
   - `/:slug/admin`
2. Mark `/t/*`, `/dashboard/*`, queue legacy pages as deprecated.
3. Add redirect + telemetry before final removal.

## Phase 6 - Integration Test Rollout
1. Activate integration tests (tenant isolation, RBAC, transition guard, subscription).
2. Gate release on green test pipeline.
3. Add smoke tests for public booking + worker status flow.

## Rollback Strategy
1. Revert API deploy first (blue/green).
2. Restore DB snapshot if enum migration causes application incompatibility.
3. Keep feature flags for route deprecation rollback.

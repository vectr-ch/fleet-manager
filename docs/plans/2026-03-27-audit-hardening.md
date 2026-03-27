# Audit Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the most concrete frontend flow regressions and hardening gaps found during the FM audit, and add baseline automated coverage for the new behavior.

**Architecture:** Preserve the existing Next.js + tRPC structure, but correct backend contract mismatches, remove misleading UX, and add a lightweight automated test harness for middleware and selected auth/invite helpers.

**Tech Stack:** Next.js, TypeScript, tRPC, existing npm toolchain

---

### Task 1: Fix frontend/backend contract mismatches

**Files:**
- Modify: `src/server/routers/user-account.ts`
- Modify: `src/components/layout/org-switcher.tsx`
- Modify: `src/app/invites/accept/page.tsx`
- Modify: `src/app/admin/organisations/page.tsx`
- Modify: `src/lib/types.ts`

**Steps:**
1. Fix org switching to use the backend’s real default-org update contract.
2. Fix the logged-in invite-accept flow so the user can reach the newly joined org instead of bouncing off middleware.
3. Align org-admin invite UX with the URL-based invite flow instead of exposing only raw tokens where possible.

### Task 2: Remove misleading or stale frontend behavior

**Files:**
- Modify: `src/app/(dashboard)/overview/page.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/components/layout/topbar.tsx`
- Modify: `src/components/layout/sidebar.tsx`

**Steps:**
1. Stop showing hardcoded fake overview stats.
2. Remove stale password-change copy that contradicts the current backend.
3. Hide admin shell chrome on public admin pages.
4. Reduce exposure of obviously stubbed product surfaces in navigation until they are implemented.

### Task 3: Tighten frontend auth hardening

**Files:**
- Modify: `src/server/routers/auth.ts`
- Modify: `src/server/routers/sysadmin-auth.ts`
- Modify: `src/server/routers/sysadmin-reset-password.ts`
- Modify: `src/lib/auth/cookies.ts`
- Modify: `src/lib/auth/sysadmin-cookies.ts`

**Steps:**
1. Clear MFA challenge cookies after successful MFA completion.
2. Tighten public sysadmin password-setting validation at the tRPC boundary to match UI policy.

### Task 4: Add baseline automated tests and verification

**Files:**
- Modify: `package.json`
- Create: `test/`

**Steps:**
1. Add a lightweight test runner suitable for the current repo.
2. Add focused tests for middleware routing and at least one auth/invite boundary touched by this patch.
3. Run lint, tests, and build.

# FM Audit Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix FM auth, invite, navigation, and middleware hardening issues from the audit while adding focused automated coverage.

**Architecture:** Keep the existing Next.js and tRPC structure, but move the most fragile routing decisions into small helpers, align org switching with the real backend contract, and reuse the shared password policy at the public password-setting boundary.

**Tech Stack:** Next.js, TypeScript, tRPC, Zod, Vitest, npm

---

### Task 1: Add failing tests for middleware routing and password validation

**Files:**
- Create: `test/middleware.test.ts`
- Create: `test/sysadmin-reset-password.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`

**Step 1: Write the failing middleware tests**

Cover these behaviors:

- `/invites/accept` is allowed with or without auth cookies
- `/select-org` requires `access_token` but not `current_org`
- logged-in users visiting `/login` are redirected to `/overview` or `/select-org`
- public admin pages are treated as public-shell pages

**Step 2: Write the failing sysadmin password validation tests**

Cover these behaviors:

- weak passwords fail input validation for `confirm`
- weak passwords fail input validation for `acceptInvite`
- a valid password reaches the procedure without input-schema failure

**Step 3: Run the tests and confirm they fail for the expected reasons**

Run: `npm test -- --run`

Expected: tests fail because helpers or schemas do not yet match the desired behavior.

### Task 2: Implement the middleware and auth boundary changes

**Files:**
- Modify: `src/middleware.ts`
- Modify: `src/server/routers/sysadmin-reset-password.ts`
- Modify: `src/lib/password.ts`

**Step 1: Extract pure middleware helpers**

Add helper exports for public path checks and route decision logic so middleware behavior can be tested without the full Next runtime.

**Step 2: Reuse the shared password validator at the tRPC boundary**

Create a shared Zod password schema in `src/lib/password.ts` and use it in the sysadmin public password-set procedures.

**Step 3: Run the focused tests**

Run: `npm test -- --run test/middleware.test.ts test/sysadmin-reset-password.test.ts`

Expected: focused tests pass.

### Task 3: Fix org switching, invite flow, MFA cleanup, and UI hardening

**Files:**
- Modify: `src/server/routers/user-account.ts`
- Modify: `src/components/layout/org-switcher.tsx`
- Modify: `src/app/invites/accept/page.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/components/layout/topbar.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/server/routers/auth.ts`
- Modify: `src/server/routers/sysadmin-auth.ts`
- Modify: `src/lib/auth/cookies.ts`
- Modify: `src/lib/auth/sysadmin-cookies.ts`

**Step 1: Fix the org switch backend contract**

Resolve the chosen org from the user membership list, send `PATCH /users/:id` with `default_org_id`, then update local cookies.

**Step 2: Fix invite accept success routing**

Drive success copy and next-step routing from whether a password was submitted, sending existing-account joins to `/select-org`.

**Step 3: Clear MFA challenge cookies after success**

Delete challenge cookies after successful `mfaConfirm` and `mfaVerify` for both user and sysadmin flows.

**Step 4: Remove stale UI copy and hide public admin chrome**

Remove the obsolete password-change note in settings and skip admin shell chrome on public admin pages.

**Step 5: Reduce primary nav exposure**

Keep only `Overview`, `Map`, `Fleet`, `Bases`, and `Settings` in topbar/sidebar.

### Task 4: Verify the full repo state

**Files:**
- Modify: `package-lock.json`

**Step 1: Run lint**

Run: `npm run lint`

**Step 2: Run tests**

Run: `npm test -- --run`

**Step 3: Run build**

Run: `npm run build`

**Step 4: Review git diff**

Run: `git status --short`

Confirm only the intended FM files were changed.

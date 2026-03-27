# FM Audit Hardening Design

## Scope

This pass is limited to the Fleet Manager repo and focuses on concrete flow and boundary fixes without broad refactors. The target outcomes are:

- align org switching with the real backend contract
- prevent logged-in invite acceptance from ending in an incorrect redirect loop
- remove stale password-change messaging
- hide admin shell chrome on public admin pages
- reduce exposure of obviously stubbed surfaces in primary navigation
- clear MFA challenge cookies after successful MFA completion
- enforce the shared password policy at the public sysadmin password-setting boundary
- add lightweight automated coverage for middleware routing and one touched auth/password boundary

## Design

### Org switching

`user-account.updateDefaultOrg` currently calls a non-matching endpoint using an org slug. The backend contract is `PATCH /users/:id` with `default_org_id`, so the router will first load the caller's org memberships, resolve the selected slug to a concrete org id, then patch the user record. FM will keep writing the local `current_org` and `current_org_name` cookies after a successful backend response so the UI changes immediately and existing middleware behavior stays intact.

The org switcher already has the org list in memory. It will pass `orgId`, `orgSlug`, and `orgName` to the mutation, disable repeated clicks while pending, and refresh on success.

### Invite accept flow

`/invites/accept` remains always public in middleware. The broken part is the page-level flow: it infers logged-in state from a client-readable cookie and uses that to drive copy and the post-success destination. That is brittle and can drift from the actual contract. The page will instead derive its mode from user action:

- if a password is provided, treat the invite as account creation and route to `/login`
- if no password is provided, treat it as an existing-account join and route to `/select-org`

That keeps the logged-in path valid even when no current org cookie exists yet and avoids middleware bounce confusion.

### Password and MFA hardening

Shared password rules already exist in `src/lib/password.ts`. Public sysadmin token redemption routes will reuse those rules at the tRPC input boundary rather than accepting any non-empty string.

Both user and sysadmin MFA flows currently leave challenge cookies behind after successful `mfaConfirm` or `mfaVerify`. New clear helpers will delete those cookies immediately after auth cookies are set.

The stale password-change warning in dashboard settings will be removed because the backend route now exists.

### Public admin chrome and nav reduction

`admin/layout` will treat `/admin/login`, `/admin/accept-invite`, `/admin/reset-password`, and `/admin/reset-password/confirm` as public-shell pages and render them without the admin header/nav.

Primary navigation will be reduced conservatively:

- keep `Overview`, `Map`, `Fleet`, `Bases`, and `Settings`
- hide `Missions`, `Telemetry`, `Audit`, and `Alerts` from topbar and sidebar

Routes remain in place and can still be reached directly.

### Tests

The repo has no current test harness, so this pass will add a minimal Vitest setup. To keep coverage high-signal and low-maintenance:

- extract middleware path classification and redirect decisions into small pure helpers and test them
- add one focused boundary test for sysadmin public password validation, proving weak passwords are rejected before any backend call is made

## Risks and mitigations

- Middleware logic is easy to regress. Extracting pure helpers makes behavior explicit and testable without spinning up Next.
- Org switch behavior depends on backend membership data. The router will fail closed if the selected slug is not found instead of patching arbitrary ids.
- Public invite flow still depends on backend acceptance semantics. This pass only fixes FM-side routing and contract use, not backend invite issuance.

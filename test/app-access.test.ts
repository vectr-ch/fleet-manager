import test from "node:test";
import assert from "node:assert/strict";
import {
  getInviteAcceptContinuePath,
  resolveAccess,
  shouldShowAdminShell,
} from "@/lib/routing/app-access";

test("resolveAccess allows forced org selection even when a current org exists", () => {
  const decision = resolveAccess({
    pathname: "/select-org",
    initialized: true,
    hasSysadminToken: false,
    hasAccessToken: true,
    hasCurrentOrg: true,
    forceSelectOrg: true,
  });

  assert.deepEqual(decision, { type: "next" });
});

test("resolveAccess redirects authenticated users away from login", () => {
  const decision = resolveAccess({
    pathname: "/login",
    initialized: true,
    hasSysadminToken: false,
    hasAccessToken: true,
    hasCurrentOrg: true,
    forceSelectOrg: false,
  });

  assert.deepEqual(decision, { type: "redirect", destination: "/overview" });
});

test("shouldShowAdminShell hides chrome on public admin pages", () => {
  assert.equal(shouldShowAdminShell("/admin/login"), false);
  assert.equal(shouldShowAdminShell("/admin/accept-invite"), false);
  assert.equal(shouldShowAdminShell("/admin/reset-password/confirm"), false);
  assert.equal(shouldShowAdminShell("/admin/organisations"), true);
});

test("getInviteAcceptContinuePath sends logged-in users to forced org selection", () => {
  assert.equal(getInviteAcceptContinuePath(true), "/select-org?force=1");
  assert.equal(getInviteAcceptContinuePath(false), "/login");
});

test("resolveAccess keeps invite acceptance public regardless of auth state", () => {
  const decision = resolveAccess({
    pathname: "/invites/accept",
    initialized: true,
    hasSysadminToken: false,
    hasAccessToken: true,
    hasCurrentOrg: true,
    forceSelectOrg: false,
  });

  assert.deepEqual(decision, { type: "next" });
});

test("resolveAccess protects admin pages without sysadmin auth", () => {
  const decision = resolveAccess({
    pathname: "/admin/sysadmins",
    initialized: true,
    hasSysadminToken: false,
    hasAccessToken: false,
    hasCurrentOrg: false,
    forceSelectOrg: false,
  });

  assert.deepEqual(decision, { type: "redirect", destination: "/admin/login" });
});

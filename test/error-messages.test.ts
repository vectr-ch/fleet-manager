import test from "node:test";
import assert from "node:assert/strict";
import { friendlyError } from "@/lib/error-messages";

test("friendlyError prettifies assigned-node conflicts for base decommissioning", () => {
  assert.equal(
    friendlyError(new Error("has_assigned_nodes")),
    "This base still has assigned nodes. Reassign or decommission them first.",
  );
});

test("friendlyError prettifies fleet and enrollment device errors", () => {
  assert.equal(
    friendlyError(new Error("invalid_base")),
    "Select a valid base before continuing.",
  );
  assert.equal(
    friendlyError(new Error("base_decommissioned")),
    "The selected base has been decommissioned.",
  );
  assert.equal(
    friendlyError(new Error("device_decommissioned")),
    "This device has been decommissioned and cannot be used for this action.",
  );
  assert.equal(
    friendlyError(new Error("already_enrolled")),
    "This device is already enrolled.",
  );
  assert.equal(
    friendlyError(new Error("no_certificate")),
    "There is no active certificate for this device.",
  );
});

test("friendlyError prettifies org selection and invite errors", () => {
  assert.equal(
    friendlyError(new Error("no_org_selected")),
    "Select an organisation to continue.",
  );
  assert.equal(
    friendlyError(new Error("not_member_of_org")),
    "You no longer have access to this organisation.",
  );
  assert.equal(
    friendlyError(new Error("invalid_or_expired_invite")),
    "This invite is invalid or has expired.",
  );
  assert.equal(
    friendlyError(new Error("password_required")),
    "Set a password to complete the invitation.",
  );
});

test("friendlyError prettifies MFA and passkey settings errors", () => {
  assert.equal(
    friendlyError(new Error("mfa_not_enabled")),
    "Two-factor authentication is not enabled for this account.",
  );
  assert.equal(
    friendlyError(new Error("admin_requires_mfa")),
    "Organisation admins must keep two-factor authentication enabled.",
  );
  assert.equal(
    friendlyError(new Error("passkeys_not_configured")),
    "Passkeys are not available in this environment.",
  );
  assert.equal(
    friendlyError(new Error("registration_session_expired")),
    "Your passkey registration session expired. Please try again.",
  );
  assert.equal(
    friendlyError(new Error("invalid_session_data")),
    "This authentication session is invalid or expired. Please try again.",
  );
  assert.equal(
    friendlyError(new Error("registration_failed")),
    "Passkey registration failed. Please try again.",
  );
});

test("friendlyError falls back to the original message for unknown errors", () => {
  assert.equal(friendlyError(new Error("something_unmapped")), "something_unmapped");
});

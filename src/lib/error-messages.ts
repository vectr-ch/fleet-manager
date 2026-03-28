/**
 * Maps API error codes to human-readable messages.
 * Used across login, MFA, and admin pages.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  invalid_credentials: "Invalid email or password.",
  account_locked: "Account temporarily locked due to too many failed attempts.",
  unauthenticated: "Your session has expired. Please sign in again.",
  no_org_selected: "Select an organisation to continue.",
  not_member_of_org: "You no longer have access to this organisation.",

  // Rate limiting
  too_many_requests: "Too many attempts. Please wait a moment and try again.",

  // MFA
  invalid_mfa_code: "Invalid verification code. Please try again.",
  invalid_mfa_challenge: "Your session has expired. Please sign in again.",
  mfa_setup_expired: "MFA setup session expired. Please sign in again.",
  invalid_code: "Invalid verification code. Please try again.",
  mfa_not_enabled: "Two-factor authentication is not enabled for this account.",
  admin_requires_mfa: "Organisation admins must keep two-factor authentication enabled.",

  // Tokens
  invalid_token: "This link has expired or is invalid.",
  invalid_refresh_token: "Your session has expired. Please sign in again.",
  invalid_or_expired_token: "This link is invalid or has expired.",
  invalid_or_expired_invite: "This invite is invalid or has expired.",
  password_required: "Set a password to complete the invitation.",

  // Validation
  invalid_request: "Some of the submitted information is invalid. Check the form and try again.",
  invalid_id: "The requested resource identifier is invalid.",
  invalid_credential: "The provided credential is invalid.",
  invalid_email: "Please enter a valid email address.",
  invalid_password: "Password does not meet the requirements.",
  email_taken: "An account with this email already exists.",
  org_slug_taken: "This organisation URL is already taken.",
  cannot_reset_own_password: "You cannot reset your own password this way.",
  has_assigned_nodes: "This base still has assigned drones. Reassign or decommission them first.",
  invalid_base: "Select a valid base before continuing.",
  base_decommissioned: "The selected base has been decommissioned.",
  already_decommissioned: "This device has already been decommissioned.",
  not_decommissioned: "This device is not decommissioned.",
  device_decommissioned: "This device has been decommissioned and cannot be used for this action.",
  already_enrolled: "This device is already enrolled.",
  no_certificate: "There is no active certificate for this device.",
  passkeys_not_configured: "Passkeys are not available in this environment.",
  user_not_found: "The requested user was not found.",
  registration_session_expired: "Your passkey registration session expired. Please try again.",
  invalid_session_data: "This authentication session is invalid or expired. Please try again.",
  registration_failed: "Passkey registration failed. Please try again.",
  login_session_expired: "Your passkey login session expired. Please try again.",
  passkey_login_failed: "Passkey verification failed. Please try again.",

  // Generic
  not_found: "The requested resource was not found.",
  internal_server_error: "Something went wrong. Please try again later.",
};

/**
 * Converts an API error into a user-friendly message.
 * Falls back to the raw message if no mapping exists.
 */
export function friendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  return ERROR_MESSAGES[message] ?? message;
}

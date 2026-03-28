/**
 * Maps API error codes to human-readable messages.
 * Used across login, MFA, and admin pages.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  invalid_credentials: "Invalid email or password.",
  account_locked: "Account temporarily locked due to too many failed attempts.",
  unauthenticated: "Your session has expired. Please sign in again.",

  // Rate limiting
  too_many_requests: "Too many attempts. Please wait a moment and try again.",

  // MFA
  invalid_mfa_code: "Invalid verification code. Please try again.",
  invalid_mfa_challenge: "Your session has expired. Please sign in again.",
  mfa_setup_expired: "MFA setup session expired. Please sign in again.",
  invalid_code: "Invalid verification code. Please try again.",

  // Tokens
  invalid_token: "This link has expired or is invalid.",
  invalid_refresh_token: "Your session has expired. Please sign in again.",

  // Validation
  invalid_email: "Please enter a valid email address.",
  invalid_password: "Password does not meet the requirements.",
  email_taken: "An account with this email already exists.",
  org_slug_taken: "This organisation URL is already taken.",
  cannot_reset_own_password: "You cannot reset your own password this way.",

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

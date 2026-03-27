export const USER_MIN_LENGTH = 8;
export const SYSADMIN_MIN_LENGTH = 12;

function buildRules(minLength: number) {
  return [
    { test: (pw: string) => pw.length >= minLength, label: `At least ${minLength} characters` },
    { test: (pw: string) => /[A-Z]/.test(pw), label: "Uppercase letter" },
    { test: (pw: string) => /[a-z]/.test(pw), label: "Lowercase letter" },
    { test: (pw: string) => /\d/.test(pw), label: "Digit" },
    { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: "Special character" },
  ];
}

function validateAgainstRules(password: string, minLength: number): string | null {
  const failing = buildRules(minLength).filter((r) => !r.test(password));
  if (failing.length === 0) return null;
  return `Password must contain: ${failing.map((r) => r.label.toLowerCase()).join(", ")}`;
}

export function validatePassword(password: string): string | null {
  return validateAgainstRules(password, USER_MIN_LENGTH);
}

export function validateSysadminPassword(password: string): string | null {
  return validateAgainstRules(password, SYSADMIN_MIN_LENGTH);
}

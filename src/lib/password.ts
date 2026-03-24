const PASSWORD_RULES = [
  { test: (pw: string) => pw.length >= 8, label: "At least 8 characters" },
  { test: (pw: string) => /[A-Z]/.test(pw), label: "Uppercase letter" },
  { test: (pw: string) => /[a-z]/.test(pw), label: "Lowercase letter" },
  { test: (pw: string) => /\d/.test(pw), label: "Digit" },
  { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: "Special character" },
];

export function validatePassword(password: string): string | null {
  const failing = PASSWORD_RULES.filter((r) => !r.test(password));
  if (failing.length === 0) return null;
  return `Password must contain: ${failing.map((r) => r.label.toLowerCase()).join(", ")}`;
}

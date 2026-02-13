export function validateEmail(rawEmail: unknown): { ok: boolean; errors: string[]; value?: string } {
  if (typeof rawEmail !== "string") {
    return { ok: false, errors: ["Email must be a string."] };
  }

  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    return { ok: false, errors: ["Email is required."] };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      ok: false,
      errors: ["Email is invalid."],
    };
  }

  return {
    ok: true,
    errors: [],
    value: email,
  };
}

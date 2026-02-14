import { validateEmail } from "@/lib/email/validateEmail";

const MAX_ROLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;

export type ValidatedClinicClaimRequestPayload = {
  name: string;
  email: string;
  role?: string;
  message?: string;
};

export type ValidateClaimRequestResult =
  | {
      ok: true;
      value: ValidatedClinicClaimRequestPayload;
    }
  | {
      ok: false;
      errors: string[];
    };

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function validateClinicClaimRequest(payload: unknown): ValidateClaimRequestResult {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["Request body must be an object."],
    };
  }

  const value = payload as Record<string, unknown>;
  const errors: string[] = [];

  const name = normalizeOptionalText(value.name);
  if (!name) {
    errors.push("name is required.");
  }

  const rawEmail = normalizeOptionalText(value.email);
  if (!rawEmail) {
    errors.push("email is required.");
  }

  let email: string | undefined;
  if (rawEmail) {
    const emailValidation = validateEmail(rawEmail);
    if (!emailValidation.ok || !emailValidation.value) {
      errors.push("email is invalid.");
    } else {
      email = emailValidation.value;
    }
  }

  const role = normalizeOptionalText(value.role);
  if (role && role.length > MAX_ROLE_LENGTH) {
    errors.push(`role must be at most ${MAX_ROLE_LENGTH} characters.`);
  }

  const message = normalizeOptionalText(value.message);
  if (message && message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`message must be at most ${MAX_MESSAGE_LENGTH} characters.`);
  }

  if (errors.length > 0 || !name || !email) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      role,
      message,
    },
  };
}

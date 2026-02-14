import { validateEmail } from "@/lib/email/validateEmail";

const MAX_NOTE_LENGTH = 2000;

export type ValidatedClinicEditSuggestionPayload = {
  suggestedPhone?: string;
  suggestedWhatsapp?: string;
  suggestedWebsiteUrl?: string;
  suggestedYelpUrl?: string;
  suggestedNote?: string;
  contactEmail?: string;
};

export type ValidateSuggestionResult =
  | {
      ok: true;
      value: ValidatedClinicEditSuggestionPayload;
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

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateClinicEditSuggestion(payload: unknown): ValidateSuggestionResult {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["Request body must be an object."],
    };
  }

  const value = payload as Record<string, unknown>;
  const errors: string[] = [];

  const suggestedPhone = normalizeOptionalText(value.suggestedPhone);
  const suggestedWhatsapp = normalizeOptionalText(value.suggestedWhatsapp);
  const suggestedWebsiteUrl = normalizeOptionalText(value.suggestedWebsiteUrl);
  const suggestedYelpUrl = normalizeOptionalText(value.suggestedYelpUrl);
  const suggestedNote = normalizeOptionalText(value.suggestedNote);
  const contactEmail = normalizeOptionalText(value.contactEmail);

  if (
    !suggestedPhone &&
    !suggestedWhatsapp &&
    !suggestedWebsiteUrl &&
    !suggestedYelpUrl &&
    !suggestedNote
  ) {
    errors.push("Provide at least one suggested field or note.");
  }

  if (suggestedWebsiteUrl && !isValidHttpUrl(suggestedWebsiteUrl)) {
    errors.push("suggestedWebsiteUrl must be a valid URL.");
  }

  if (suggestedYelpUrl && !isValidHttpUrl(suggestedYelpUrl)) {
    errors.push("suggestedYelpUrl must be a valid URL.");
  }

  if (suggestedNote && suggestedNote.length > MAX_NOTE_LENGTH) {
    errors.push(`suggestedNote must be at most ${MAX_NOTE_LENGTH} characters.`);
  }

  if (contactEmail) {
    const emailValidation = validateEmail(contactEmail);
    if (!emailValidation.ok) {
      errors.push("contactEmail is invalid.");
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    value: {
      suggestedPhone,
      suggestedWhatsapp,
      suggestedWebsiteUrl,
      suggestedYelpUrl,
      suggestedNote,
      contactEmail,
    },
  };
}

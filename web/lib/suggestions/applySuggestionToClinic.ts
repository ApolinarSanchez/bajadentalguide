type ClinicContactFields = {
  phone?: string | null;
  whatsapp?: string | null;
  websiteUrl?: string | null;
  yelpUrl?: string | null;
};

type SuggestionFields = {
  suggestedPhone?: string | null;
  suggestedWhatsapp?: string | null;
  suggestedWebsiteUrl?: string | null;
  suggestedYelpUrl?: string | null;
};

function normalizeOptionalText(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildClinicContactUpdatesFromSuggestion(
  suggestion: SuggestionFields,
): Partial<Pick<ClinicContactFields, "phone" | "whatsapp" | "websiteUrl" | "yelpUrl">> {
  const updates: Partial<Pick<ClinicContactFields, "phone" | "whatsapp" | "websiteUrl" | "yelpUrl">> =
    {};

  const suggestedPhone = normalizeOptionalText(suggestion.suggestedPhone);
  if (suggestedPhone !== undefined) {
    updates.phone = suggestedPhone;
  }

  const suggestedWhatsapp = normalizeOptionalText(suggestion.suggestedWhatsapp);
  if (suggestedWhatsapp !== undefined) {
    updates.whatsapp = suggestedWhatsapp;
  }

  const suggestedWebsiteUrl = normalizeOptionalText(suggestion.suggestedWebsiteUrl);
  if (suggestedWebsiteUrl !== undefined) {
    updates.websiteUrl = suggestedWebsiteUrl;
  }

  const suggestedYelpUrl = normalizeOptionalText(suggestion.suggestedYelpUrl);
  if (suggestedYelpUrl !== undefined) {
    updates.yelpUrl = suggestedYelpUrl;
  }

  return updates;
}

export function applySuggestionToClinic<T extends ClinicContactFields>(
  clinic: T,
  suggestion: SuggestionFields,
): T {
  const updates = buildClinicContactUpdatesFromSuggestion(suggestion);
  return {
    ...clinic,
    ...updates,
  };
}

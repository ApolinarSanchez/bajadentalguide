type PublishSignals = {
  phone?: string | null;
  websiteUrl?: string | null;
  whatsapp?: string | null;
};

function hasDirectContact(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function computeIsPublished(signals: PublishSignals): boolean {
  return (
    hasDirectContact(signals.phone) ||
    hasDirectContact(signals.websiteUrl) ||
    hasDirectContact(signals.whatsapp)
  );
}

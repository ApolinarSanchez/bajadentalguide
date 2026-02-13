export const FOLLOWUP_7D_TEMPLATE = "followup_7d";

export type FollowupProfileInput = {
  emailOptIn: boolean;
  unsubscribedAt: Date | null;
  emailCapturedAt: Date | null;
};

export function isFollowupDue(
  profile: FollowupProfileInput,
  now = new Date(),
  hasTemplateLog = false,
): boolean {
  if (!profile.emailOptIn) {
    return false;
  }

  if (profile.unsubscribedAt) {
    return false;
  }

  if (!profile.emailCapturedAt) {
    return false;
  }

  if (hasTemplateLog) {
    return false;
  }

  const dueBy = new Date(now.getTime());
  dueBy.setDate(dueBy.getDate() - 7);

  return profile.emailCapturedAt.getTime() <= dueBy.getTime();
}

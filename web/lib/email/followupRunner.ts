import { db } from "@/lib/db";
import { logEvent } from "@/lib/events";
import { createEmailProvider, type EmailProvider } from "@/lib/email/provider";
import { FOLLOWUP_7D_TEMPLATE, isFollowupDue, type FollowupProfileInput } from "@/lib/email/followupSchedule";

type SendFollowupsInput = {
  now?: Date;
  provider?: EmailProvider;
  template?: string;
  baseUrl?: string;
};

type ProfileInput = {
  sessionId: string;
  email: string;
  unsubscribeToken: string;
};

export async function runFollowupJobs({
  now = new Date(),
  provider = createEmailProvider(),
  template = FOLLOWUP_7D_TEMPLATE,
  baseUrl = process.env.BASE_URL ?? "http://localhost:3000",
}: SendFollowupsInput = {}): Promise<{ sent: number; skipped: number }> {
  const dueDateCutoff = new Date(now.getTime());
  dueDateCutoff.setDate(dueDateCutoff.getDate() - 7);

  const dueProfiles = await db.sessionProfile.findMany({
    where: {
      emailOptIn: true,
      unsubscribedAt: null,
      emailCapturedAt: {
        lte: dueDateCutoff,
      },
    },
    select: {
      sessionId: true,
      email: true,
      emailOptIn: true,
      unsubscribedAt: true,
      emailCapturedAt: true,
      unsubscribeToken: true,
      emailLogs: {
        where: {
          template,
        },
        select: {
          id: true,
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const row of dueProfiles) {
    const profile: FollowupProfileInput = {
      emailOptIn: row.emailOptIn,
      unsubscribedAt: row.unsubscribedAt,
      emailCapturedAt: row.emailCapturedAt,
    };
    const mapped: ProfileInput = {
      sessionId: row.sessionId,
      email: row.email ?? "",
      unsubscribeToken: row.unsubscribeToken,
    };

    const shouldRun = isFollowupDue(profile, now, row.emailLogs.length > 0);
    if (!shouldRun || !mapped.email) {
      skipped += 1;
      continue;
    }

    const subject = "How did your Tijuana dental visit go?";
    const shortlistLink = `${baseUrl}/shortlist`;
    const text = `How did your Tijuana dental visit go?\n\n${shortlistLink}\n\nLeave a BDG review and tell us how it went: ${shortlistLink}`;
    const html = `${subject}\n\n<a href=\"${shortlistLink}\">View your shortlist</a>\n\n<a href=\"${baseUrl}/unsubscribe?token=${mapped.unsubscribeToken}\">Unsubscribe</a>`;

    try {
      await provider.sendEmail({
        to: mapped.email,
        subject,
        text,
        html,
      });

      await db.emailLog.create({
        data: {
          sessionId: mapped.sessionId,
          email: mapped.email,
          template,
          status: "sent",
        },
      });

      await logEvent({
        sessionId: mapped.sessionId,
        eventName: "email_sent",
        metadata: {
          template,
        },
      });

      sent += 1;
    } catch (error) {
      await db.emailLog.create({
        data: {
          sessionId: mapped.sessionId,
          email: mapped.email,
          template,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return {
    sent,
    skipped,
  };
}

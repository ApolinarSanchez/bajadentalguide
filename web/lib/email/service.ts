import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/events";
import { validateEmail } from "@/lib/email/validateEmail";

type CaptureResult = {
  ok: boolean;
  status: number;
  errors?: string[];
};

export async function captureSessionEmail({
  sessionId,
  payload,
}: {
  sessionId: string;
  payload: unknown;
}): Promise<CaptureResult> {
  if (!sessionId) {
    return {
      ok: false,
      status: 400,
      errors: ["Missing session id."],
    };
  }

  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      status: 400,
      errors: ["Request body must be an object."],
    };
  }

  const body = payload as { email?: unknown; optIn?: unknown };
  const emailResult = validateEmail(body.email);
  if (!emailResult.ok) {
    return {
      ok: false,
      status: 400,
      errors: emailResult.errors,
    };
  }

  if (typeof body.optIn !== "boolean") {
    return {
      ok: false,
      status: 400,
      errors: ["optIn is required and must be true/false."],
    };
  }

  const now = new Date();
  const email = emailResult.value;
  let existing = await db.sessionProfile.findUnique({
    where: {
      sessionId,
    },
    select: {
      sessionId: true,
      unsubscribeToken: true,
    },
  });

  if (!existing) {
    existing = {
      sessionId,
      unsubscribeToken: randomUUID(),
    } as { sessionId: string; unsubscribeToken: string };
  }

  try {
    const saved = await db.sessionProfile.upsert({
      where: {
        sessionId,
      },
      create: {
        sessionId,
        email,
        emailOptIn: body.optIn,
        emailCapturedAt: body.optIn ? now : null,
        unsubscribeToken: existing.unsubscribeToken,
      },
      update: {
        email,
        emailOptIn: body.optIn,
        emailCapturedAt: body.optIn ? now : null,
        ...(existing.unsubscribeToken ? { unsubscribeToken: existing.unsubscribeToken } : {}),
      },
      select: {
        sessionId: true,
      },
    });

    if (!saved) {
      return {
        ok: false,
        status: 500,
        errors: ["Unable to save email profile."],
      };
    }

    if (body.optIn) {
      await logEvent({
        sessionId,
        eventName: "email_capture",
        metadata: {
          optIn: true,
        },
      });
    }

    return {
      ok: true,
      status: 200,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        status: 409,
        errors: ["Unable to save email profile."],
      };
    }

    throw error;
  }
}

type UnsubscribeResult = {
  ok: boolean;
  status: number;
  found?: boolean;
};

export async function unsubscribeSessionByToken(token: string): Promise<UnsubscribeResult> {
  const profile = await db.sessionProfile.findUnique({
    where: {
      unsubscribeToken: token,
    },
    select: {
      sessionId: true,
    },
  });

  if (!profile) {
    return {
      ok: false,
      status: 404,
      found: false,
    };
  }

  await db.sessionProfile.update({
    where: {
      sessionId: profile.sessionId,
    },
    data: {
      emailOptIn: false,
      unsubscribedAt: new Date(),
    },
  });

  await logEvent({
    sessionId: profile.sessionId,
    eventName: "email_unsubscribe",
    metadata: {
      token,
    },
  });

  return {
    ok: true,
    status: 200,
    found: true,
  };
}

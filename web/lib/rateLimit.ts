import { db } from "@/lib/db";

export function getWindowStart(now: Date, windowSec: number): Date {
  const windowMs = Math.max(1, windowSec) * 1000;
  const startMs = Math.floor(now.getTime() / windowMs) * windowMs;
  return new Date(startMs);
}

export async function consumeRateLimit(params: {
  key: string;
  action: string;
  limit: number;
  windowSec: number;
  now?: Date;
}): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = params.now ?? new Date();
  const windowStart = getWindowStart(now, params.windowSec);
  const resetAt = new Date(windowStart.getTime() + params.windowSec * 1000);

  return db.$transaction(async (tx) => {
    const existing = await tx.rateLimitCounter.findUnique({
      where: {
        key_action_windowStart: {
          key: params.key,
          action: params.action,
          windowStart,
        },
      },
      select: {
        count: true,
      },
    });

    if (existing && existing.count >= params.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    if (existing) {
      const updated = await tx.rateLimitCounter.update({
        where: {
          key_action_windowStart: {
            key: params.key,
            action: params.action,
            windowStart,
          },
        },
        data: {
          count: {
            increment: 1,
          },
        },
        select: {
          count: true,
        },
      });

      return {
        allowed: true,
        remaining: Math.max(0, params.limit - updated.count),
        resetAt,
      };
    }

    const created = await tx.rateLimitCounter.create({
      data: {
        key: params.key,
        action: params.action,
        windowStart,
        count: 1,
      },
      select: {
        count: true,
      },
    });

    return {
      allowed: true,
      remaining: Math.max(0, params.limit - created.count),
      resetAt,
    };
  });
}

export function rateLimitResponse(resetAt: Date): Response {
  const retryAfterSec = Math.max(
    0,
    Math.ceil((resetAt.getTime() - Date.now()) / 1000),
  );

  return new Response(
    JSON.stringify({
      ok: false,
      error: "rate_limited",
      message: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}

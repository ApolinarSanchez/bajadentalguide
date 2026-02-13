import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { submitReview } from "@/lib/reviews/service";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

const REVIEW_LIMIT = parsePositiveInt(process.env.RATE_LIMIT_REVIEW_LIMIT, 10);
const REVIEW_WINDOW_SEC = parsePositiveInt(process.env.RATE_LIMIT_REVIEW_WINDOW_SEC, 3600);

export async function POST(request: Request) {
  const sessionId = (await cookies()).get("bdg_session")?.value;
  if (!sessionId) {
    return NextResponse.json(
      {
        message: "Missing session id.",
      },
      { status: 400 },
    );
  }

  const limitResult = await consumeRateLimit({
    key: sessionId,
    action: "review_submit",
    limit: REVIEW_LIMIT,
    windowSec: REVIEW_WINDOW_SEC,
  });

  if (!limitResult.allowed) {
    return rateLimitResponse(limitResult.resetAt);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const result = await submitReview({
    sessionId,
    payload,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.errors.join("; "),
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true }, { status: result.status });
}

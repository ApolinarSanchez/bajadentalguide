import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { captureSessionEmail } from "@/lib/email/service";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

const EMAIL_LIMIT = parsePositiveInt(process.env.RATE_LIMIT_EMAIL_LIMIT, 5);
const EMAIL_WINDOW_SEC = parsePositiveInt(process.env.RATE_LIMIT_EMAIL_WINDOW_SEC, 3600);

export async function POST(request: Request) {
  const sessionId = (await cookies()).get("bdg_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ message: "Missing session id." }, { status: 400 });
  }

  const limitResult = await consumeRateLimit({
    key: sessionId,
    action: "email_capture",
    limit: EMAIL_LIMIT,
    windowSec: EMAIL_WINDOW_SEC,
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

  const result = await captureSessionEmail({
    sessionId,
    payload,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.errors?.join("; ") ?? "Unable to save email.",
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true }, { status: result.status });
}

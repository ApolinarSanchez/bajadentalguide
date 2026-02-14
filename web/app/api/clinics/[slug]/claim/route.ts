import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { submitClinicClaimRequest } from "@/lib/claims/service";

export const dynamic = "force-dynamic";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

const CLAIM_LIMIT = parsePositiveInt(process.env.RATE_LIMIT_EMAIL_LIMIT, 5);
const CLAIM_WINDOW_SEC = parsePositiveInt(process.env.RATE_LIMIT_EMAIL_WINDOW_SEC, 3600);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const sessionId = (await cookies()).get("bdg_session")?.value;
  const ip = getClientIp(request);

  const limitResult = await consumeRateLimit({
    key: `ip:${ip}`,
    action: "clinic_claim_request_submit",
    limit: CLAIM_LIMIT,
    windowSec: CLAIM_WINDOW_SEC,
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

  const result = await submitClinicClaimRequest({
    clinicSlug: slug,
    payload,
    sessionId,
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

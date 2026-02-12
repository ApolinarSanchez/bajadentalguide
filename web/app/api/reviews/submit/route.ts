import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { submitReview } from "@/lib/reviews/service";

export const dynamic = "force-dynamic";

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

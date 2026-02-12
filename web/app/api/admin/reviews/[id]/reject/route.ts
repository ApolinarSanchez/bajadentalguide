import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rejectReview } from "@/lib/reviews/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminSessionId = (await cookies()).get("bdg_session")?.value;

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

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      {
        message: "Request body must be an object.",
      },
      { status: 400 },
    );
  }

  const reason = typeof (payload as { reason?: unknown }).reason === "string" ? (payload as { reason: string }).reason : "";
  const result = await rejectReview({
    reviewId: id,
    reason,
    adminSessionId,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.errors.join("; "),
      },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true });
}

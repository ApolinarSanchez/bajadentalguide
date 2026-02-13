import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { captureSessionEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sessionId = (await cookies()).get("bdg_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ message: "Missing session id." }, { status: 400 });
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

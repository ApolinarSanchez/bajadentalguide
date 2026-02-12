import { getSessionIdFromCookies } from "@/lib/session";
import { isShortlistSource, toggleSavedClinic } from "@/lib/shortlist";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const sessionId = getSessionIdFromCookies(await cookies());
  if (!sessionId) {
    return NextResponse.json(
      {
        message: "Missing session cookie.",
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

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      {
        message: "Request body must be an object.",
      },
      { status: 400 },
    );
  }

  const clinicId = (payload as { clinicId?: unknown }).clinicId;
  if (typeof clinicId !== "string" || clinicId.trim().length === 0) {
    return NextResponse.json(
      {
        message: "clinicId is required.",
      },
      { status: 400 },
    );
  }

  const sourceInput = (payload as { source?: unknown }).source;
  const source = typeof sourceInput === "string" && isShortlistSource(sourceInput)
    ? sourceInput
    : "clinics_list";

  try {
    const result = await toggleSavedClinic({
      sessionId,
      clinicId,
      source,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to toggle shortlist.";
    const status = message === "Clinic not found" ? 404 : 500;
    return NextResponse.json(
      {
        message,
      },
      { status },
    );
  }
}

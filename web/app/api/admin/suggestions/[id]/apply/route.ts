import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applyClinicEditSuggestion } from "@/lib/suggestions/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const adminSessionId = (await cookies()).get("bdg_session")?.value;

  const result = await applyClinicEditSuggestion({
    suggestionId: id,
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

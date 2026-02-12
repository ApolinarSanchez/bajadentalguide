import { importClinics } from "@/lib/import/importClinics";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

  const dryRun = Boolean((payload as { dryRun?: unknown }).dryRun);
  const rows = (payload as { rows?: unknown }).rows;

  if (!Array.isArray(rows)) {
    return NextResponse.json(
      {
        message: "rows must be an array.",
      },
      { status: 400 },
    );
  }

  const result = await importClinics({
    dryRun,
    rows,
  });

  return NextResponse.json(result);
}

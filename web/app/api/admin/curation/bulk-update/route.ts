import { z } from "zod";
import { db } from "@/lib/db";
import { bulkUpdateClinics } from "@/lib/admin/curationService";
import { NextResponse } from "next/server";

const inputSchema = z
  .object({
    clinicIds: z.array(z.string().min(1)).min(1).max(500),
    action: z.enum(["publish", "unpublish", "feature", "unfeature", "assign_featured_ranks"]),
    mode: z.enum(["append", "start_at"]).optional(),
    startingRank: z.number().int().min(0).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action !== "assign_featured_ranks") {
      return;
    }

    if (value.mode === "start_at" && value.startingRank === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startingRank is required when mode is start_at.",
        path: ["startingRank"],
      });
    }
  });

function buildValidationMessage(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join("; ");
}

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

  const parsed = inputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: buildValidationMessage(parsed.error),
      },
      { status: 400 },
    );
  }

  try {
    const result = await bulkUpdateClinics(db, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to update clinics.",
      },
      { status: 500 },
    );
  }
}

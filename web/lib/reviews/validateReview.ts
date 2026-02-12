import type { ReviewStatus } from "@prisma/client";

const MIN_BODY_LENGTH = 40;
const MAX_BODY_LENGTH = 4000;

export type ValidatedReviewPayload = {
  clinicId: string;
  ratingOverall: number;
  body: string;
  procedure?: string;
  visitMonth?: number;
  visitYear?: number;
  headline?: string;
};

export type ValidationResult =
  | {
      ok: true;
      value: ValidatedReviewPayload;
    }
  | {
      ok: false;
      errors: string[];
    };

export type ReviewForAggregate = {
  status: ReviewStatus | string;
  ratingOverall: number;
};

function toNonEmptyTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalText(value: unknown): string | undefined {
  if (typeof value === "undefined" || value === null) {
    return undefined;
  }

  return toNonEmptyTrimmedString(value);
}

function toInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const asNumber = Number(value);
    return Number.isInteger(asNumber) ? asNumber : undefined;
  }

  return undefined;
}

export function validateReview(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      errors: ["Request body must be an object."],
    };
  }

  const value = payload as Record<string, unknown>;
  const errors: string[] = [];

  const clinicId = toNonEmptyTrimmedString(value.clinicId);
  if (!clinicId) {
    errors.push("clinicId is required.");
  }

  const ratingOverall = toInt(value.ratingOverall);
  if (typeof ratingOverall !== "number") {
    errors.push("ratingOverall is required and must be an integer.");
  } else if (ratingOverall < 1 || ratingOverall > 5) {
    errors.push("ratingOverall must be between 1 and 5.");
  }

  const body = toNonEmptyTrimmedString(value.body);
  if (!body) {
    errors.push("body is required.");
  } else {
    if (body.length < MIN_BODY_LENGTH) {
      errors.push(`body must be at least ${MIN_BODY_LENGTH} characters.`);
    }
    if (body.length > MAX_BODY_LENGTH) {
      errors.push(`body must be at most ${MAX_BODY_LENGTH} characters.`);
    }
  }

  const visitMonth = toInt(value.visitMonth);
  if (typeof visitMonth !== "undefined" && (visitMonth < 1 || visitMonth > 12)) {
    errors.push("visitMonth must be between 1 and 12.");
  }

  const visitYear = toInt(value.visitYear);
  const currentYear = new Date().getFullYear();
  if (typeof visitYear !== "undefined" && (visitYear < 2000 || visitYear > currentYear)) {
    errors.push(`visitYear must be between 2000 and ${currentYear}.`);
  }

  const procedure = toOptionalText(value.procedure);
  const headline = toOptionalText(value.headline);

  if (errors.length > 0 || !clinicId || typeof ratingOverall !== "number" || !body) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      clinicId,
      ratingOverall,
      body,
      procedure,
      visitMonth,
      visitYear,
      headline,
    },
  };
}

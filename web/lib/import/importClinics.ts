import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import type { ClinicCsvRow } from "@/lib/import/parseClinicCsv";

export type ClinicImportRowInput = Partial<ClinicCsvRow> & {
  [key: string]: unknown;
};

export type ClinicImportRowError = {
  rowIndex: number;
  message: string;
};

export type ImportClinicsResult = {
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  errors: ClinicImportRowError[];
};

type NormalizedClinicImportRow = ClinicCsvRow;

const urlFields: Array<keyof Pick<ClinicCsvRow, "websiteUrl" | "googleMapsUrl" | "yelpUrl">> = [
  "websiteUrl",
  "googleMapsUrl",
  "yelpUrl",
];

const optionalStringFields: Array<
  keyof Pick<
    ClinicCsvRow,
    "addressLine1" | "city" | "state" | "country" | "phone" | "whatsapp" | "websiteUrl" | "googleMapsUrl" | "yelpUrl"
  >
> = [
  "addressLine1",
  "city",
  "state",
  "country",
  "phone",
  "whatsapp",
  "websiteUrl",
  "googleMapsUrl",
  "yelpUrl",
];

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeClinicImportRows(rows: ClinicImportRowInput[]): {
  rows: NormalizedClinicImportRow[];
  errors: ClinicImportRowError[];
} {
  const validRows: NormalizedClinicImportRow[] = [];
  const errors: ClinicImportRowError[] = [];
  const seenSlugs = new Set<string>();

  rows.forEach((inputRow, index) => {
    const rowIndex = index + 1;
    const rowErrors: string[] = [];

    const normalizedName = normalizeString(inputRow.name);
    if (!normalizedName) {
      rowErrors.push("Name is required.");
    }

    const rawSlug = normalizeString(inputRow.slug);
    const normalizedSlugSource = rawSlug ?? normalizedName;
    const normalizedSlug = normalizedSlugSource ? slugify(normalizedSlugSource) : "";
    if (!normalizedSlug) {
      rowErrors.push("Slug is required and could not be generated.");
    }

    if (normalizedSlug && seenSlugs.has(normalizedSlug)) {
      rowErrors.push(`Duplicate slug "${normalizedSlug}" in import payload.`);
    }

    const normalizedRow: Partial<NormalizedClinicImportRow> = {
      name: normalizedName,
      slug: normalizedSlug,
    };

    optionalStringFields.forEach((field) => {
      const normalizedValue = normalizeString(inputRow[field]);
      if (normalizedValue !== undefined) {
        normalizedRow[field] = normalizedValue;
      }
    });

    urlFields.forEach((field) => {
      const value = normalizedRow[field];
      if (value && !isValidHttpUrl(value)) {
        rowErrors.push(`${field} must be a valid URL.`);
      }
    });

    if (rowErrors.length > 0) {
      rowErrors.forEach((message) => {
        errors.push({
          rowIndex,
          message,
        });
      });
      return;
    }

    seenSlugs.add(normalizedSlug);
    validRows.push(normalizedRow as NormalizedClinicImportRow);
  });

  return {
    rows: validRows,
    errors,
  };
}

function toClinicMutationData(row: NormalizedClinicImportRow) {
  return {
    name: row.name,
    slug: row.slug,
    ...(row.addressLine1 !== undefined ? { addressLine1: row.addressLine1 } : {}),
    ...(row.city !== undefined ? { city: row.city } : {}),
    ...(row.state !== undefined ? { state: row.state } : {}),
    ...(row.country !== undefined ? { country: row.country } : {}),
    ...(row.phone !== undefined ? { phone: row.phone } : {}),
    ...(row.whatsapp !== undefined ? { whatsapp: row.whatsapp } : {}),
    ...(row.websiteUrl !== undefined ? { websiteUrl: row.websiteUrl } : {}),
    ...(row.googleMapsUrl !== undefined ? { googleMapsUrl: row.googleMapsUrl } : {}),
    ...(row.yelpUrl !== undefined ? { yelpUrl: row.yelpUrl } : {}),
  };
}

export async function importClinics({
  dryRun,
  rows,
}: {
  dryRun: boolean;
  rows: ClinicImportRowInput[];
}): Promise<ImportClinicsResult> {
  const normalized = normalizeClinicImportRows(rows);
  const slugs = normalized.rows.map((row) => row.slug);

  const existingClinics =
    slugs.length > 0
      ? await db.clinic.findMany({
          where: {
            slug: {
              in: slugs,
            },
          },
          select: {
            slug: true,
          },
        })
      : [];

  const existingSlugs = new Set(existingClinics.map((clinic) => clinic.slug));

  let createdCount = 0;
  let updatedCount = 0;

  normalized.rows.forEach((row) => {
    if (existingSlugs.has(row.slug)) {
      updatedCount += 1;
      return;
    }
    createdCount += 1;
  });

  if (!dryRun && normalized.rows.length > 0) {
    await db.$transaction(
      normalized.rows.map((row) => {
        const data = toClinicMutationData(row);
        return db.clinic.upsert({
          where: {
            slug: row.slug,
          },
          update: data,
          create: data,
        });
      }),
    );
  }

  return {
    createdCount,
    updatedCount,
    errorCount: normalized.errors.length,
    errors: normalized.errors,
  };
}

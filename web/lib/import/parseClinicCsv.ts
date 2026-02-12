import { slugify } from "@/lib/slugify";

export type ClinicCsvRow = {
  name: string;
  slug: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  whatsapp?: string;
  websiteUrl?: string;
  googleMapsUrl?: string;
  yelpUrl?: string;
};

export type ClinicCsvParseError = {
  rowIndex: number;
  message: string;
};

export type ParseClinicCsvResult = {
  rows: ClinicCsvRow[];
  errors: ClinicCsvParseError[];
};

const headerToField: Record<string, keyof ClinicCsvRow> = {
  name: "name",
  slug: "slug",
  addressline1: "addressLine1",
  city: "city",
  state: "state",
  country: "country",
  phone: "phone",
  whatsapp: "whatsapp",
  websiteurl: "websiteUrl",
  googlemapsurl: "googleMapsUrl",
  yelpurl: "yelpUrl",
};

function parseCsvCells(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell.trim() === "")) {
    rows.pop();
  }

  return rows;
}

function toTrimmed(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseClinicCsv(text: string): ParseClinicCsvResult {
  const csvRows = parseCsvCells(text);
  if (csvRows.length === 0) {
    return {
      rows: [],
      errors: [{ rowIndex: 0, message: "CSV content is empty." }],
    };
  }

  const headerRow = csvRows[0].map((value) => value.trim().toLowerCase());
  const hasNameHeader = headerRow.includes("name");
  if (!hasNameHeader) {
    return {
      rows: [],
      errors: [{ rowIndex: 0, message: 'CSV must include a "name" header.' }],
    };
  }

  const rows: ClinicCsvRow[] = [];
  const errors: ClinicCsvParseError[] = [];

  for (let dataRowIndex = 1; dataRowIndex < csvRows.length; dataRowIndex += 1) {
    const csvRow = csvRows[dataRowIndex];
    if (csvRow.every((value) => value.trim() === "")) {
      continue;
    }

    const draft: Partial<ClinicCsvRow> = {};

    for (let columnIndex = 0; columnIndex < headerRow.length; columnIndex += 1) {
      const header = headerRow[columnIndex];
      const field = headerToField[header];
      if (!field) {
        continue;
      }
      const value = toTrimmed(csvRow[columnIndex]);
      if (value !== undefined) {
        draft[field] = value as never;
      }
    }

    const rowErrors: string[] = [];
    const name = toTrimmed(draft.name);
    if (!name) {
      rowErrors.push("Name is required.");
    }

    const slugSource = toTrimmed(draft.slug) ?? name;
    const slug = slugSource ? slugify(slugSource) : "";
    if (!slug) {
      rowErrors.push("Slug could not be generated.");
    }

    if (rowErrors.length > 0) {
      rowErrors.forEach((message) => {
        errors.push({
          rowIndex: dataRowIndex,
          message,
        });
      });
      continue;
    }

    rows.push({
      ...draft,
      name: name as string,
      slug,
    });
  }

  return {
    rows,
    errors,
  };
}

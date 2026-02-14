import type { DenueClinicRow } from "./normalize.ts";

const CSV_HEADERS = [
  "name",
  "slug",
  "addressLine1",
  "city",
  "state",
  "country",
  "phone",
  "whatsapp",
  "websiteUrl",
  "googleMapsUrl",
  "yelpUrl",
] as const;

function escapeCsvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, "\"\"")}"`;
}

export function clinicRowsToCsv(rows: DenueClinicRow[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const row of rows) {
    const cells = CSV_HEADERS.map((header) => {
      const value = row[header] ?? "";
      return escapeCsvCell(String(value));
    });
    lines.push(cells.join(","));
  }

  return lines.join("\n");
}

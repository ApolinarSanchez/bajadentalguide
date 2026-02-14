import { describe, expect, it } from "vitest";
import { clinicRowsToCsv } from "@/lib/denue/csv";
import { denueRecordsToClinicRows } from "@/lib/denue/normalize";
import { normalizeClinicImportRows } from "@/lib/import/importClinics";
import { parseClinicCsv } from "@/lib/import/parseClinicCsv";

describe("denue CSV compatibility", () => {
  it("produces CSV accepted by the admin importer normalization flow", () => {
    const records: Array<Record<string, unknown>> = [
      {
        Id: "1001",
        Nombre: "Baja Smile Dental Center",
        Tipo_vialidad: "Av.",
        Calle: "Revolución",
        Num_Exterior: "123",
        Colonia: "Centro",
        CP: "22000",
        Telefono: "6641234567",
        Sitio_internet: "example.com",
        Latitud: "32.5291",
        Longitud: "-117.0382",
      },
      {
        Id: "1002",
        Nombre: "Baja Smile Dental Center",
        Tipo_vialidad: "Blvd.",
        Calle: "Agua Caliente",
        Num_Exterior: "987",
        Colonia: "Zona Río",
        CP: "22010",
        Sitio_internet: "www.bajasmile.mx",
      },
    ];

    const rows = denueRecordsToClinicRows(records);
    const csv = clinicRowsToCsv(rows);
    const parsed = parseClinicCsv(csv);
    const normalized = normalizeClinicImportRows(parsed.rows);

    expect(parsed.errors).toEqual([]);
    expect(normalized.errors).toEqual([]);
    expect(normalized.rows).toHaveLength(2);

    const slugSet = new Set(normalized.rows.map((row) => row.slug));
    expect(slugSet.size).toBe(normalized.rows.length);

    for (const row of normalized.rows) {
      if (row.websiteUrl) {
        const websiteUrl = new URL(row.websiteUrl);
        expect(["http:", "https:"]).toContain(websiteUrl.protocol);
      }

      expect(row.googleMapsUrl).toBeDefined();
      const mapsUrl = new URL(row.googleMapsUrl as string);
      expect(mapsUrl.protocol).toBe("https:");
      expect(mapsUrl.hostname).toBe("www.google.com");
    }
  });
});

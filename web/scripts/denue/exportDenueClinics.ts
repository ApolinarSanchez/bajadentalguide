import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { clinicRowsToCsv } from "../../lib/denue/csv";
import { fetchAllBuscarAreaAct } from "../../lib/denue/denueClient";
import { denueRecordsToClinicRows } from "../../lib/denue/normalize";

type DenueRecord = Record<string, unknown>;

function parseCsvEnvCodes(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 200;
  }
  return parsed;
}

function getRecordId(record: DenueRecord): string | undefined {
  const raw = record.Id;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(raw);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

async function main() {
  const token = process.env.INEGI_DENUE_TOKEN?.trim();
  if (!token) {
    console.error(
      "INEGI_DENUE_TOKEN is required. Set it in web/.env.local before running denue:export:tijuana.",
    );
    process.exit(1);
  }

  const entidad = process.env.DENUE_ENTIDAD?.trim() || "02";
  const municipios = parseCsvEnvCodes(process.env.DENUE_MUNICIPIOS?.trim() || "004");
  const classes = parseCsvEnvCodes(process.env.DENUE_CLASSES?.trim() || "621211");
  const pageSize = parsePageSize(process.env.DENUE_PAGE_SIZE);

  if (municipios.length === 0) {
    console.error("DENUE_MUNICIPIOS must contain at least one municipio code.");
    process.exit(1);
  }
  if (classes.length === 0) {
    console.error("DENUE_CLASSES must contain at least one activity class code.");
    process.exit(1);
  }

  const fetched: unknown[] = [];
  for (const municipio of municipios) {
    for (const clase of classes) {
      console.log(`Fetching DENUE entidad=${entidad} municipio=${municipio} clase=${clase}`);
      const rows = await fetchAllBuscarAreaAct({
        entidad,
        municipio,
        clase,
        token,
        pageSize,
        delayMs: 200,
        maxRetries: 3,
      });
      console.log(`  fetched ${rows.length} records`);
      fetched.push(...rows);
    }
  }

  const seenIds = new Set<string>();
  const deduped: DenueRecord[] = [];

  for (const item of fetched) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as DenueRecord;
    const id = getRecordId(record);
    if (id) {
      if (seenIds.has(id)) {
        continue;
      }
      seenIds.add(id);
    }
    deduped.push(record);
  }

  const clinicRows = denueRecordsToClinicRows(deduped);
  const csv = clinicRowsToCsv(clinicRows);

  const outDir = path.join(process.cwd(), "tmp");
  const outFile = path.join(outDir, "denue-tijuana-dentists.csv");
  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, csv, "utf8");

  const missingPhone = clinicRows.filter((row) => !row.phone).length;
  const missingWebsite = clinicRows.filter((row) => !row.websiteUrl).length;

  console.log("");
  console.log(`Output: ${outFile}`);
  console.log(`Total records fetched: ${fetched.length}`);
  console.log(`Rows written: ${clinicRows.length}`);
  console.log(`Missing phone: ${missingPhone}`);
  console.log(`Missing website: ${missingWebsite}`);
  console.log("");
  console.log("Sample rows:");
  clinicRows.slice(0, 5).forEach((row, index) => {
    console.log(
      `${index + 1}. ${row.name} | ${row.slug} | ${row.websiteUrl ?? "(no website)"}`,
    );
  });
}

main().catch((error) => {
  console.error("DENUE export failed.", error);
  process.exit(1);
});

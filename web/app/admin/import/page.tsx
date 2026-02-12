"use client";

import type { ClinicImportRowInput, ImportClinicsResult } from "@/lib/import/importClinics";
import { parseClinicCsv } from "@/lib/import/parseClinicCsv";
import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

type ImportState = {
  status: "idle" | "running" | "done" | "error";
  result?: ImportClinicsResult;
  message?: string;
};

export default function AdminImportPage() {
  const [rows, setRows] = useState<ClinicImportRowInput[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ rowIndex: number; message: string }>>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importState, setImportState] = useState<ImportState>({ status: "idle" });

  const hasBlockingClientErrors = parseErrors.length > 0;

  const previewRows = useMemo(() => rows.slice(0, 10), [rows]);

  async function handleCsvSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    const parsed = parseClinicCsv(content);

    setFileName(file.name);
    setRows(parsed.rows);
    setParseErrors(parsed.errors);
    setImportState({ status: "idle" });
  }

  async function submitImport(dryRun: boolean) {
    if (rows.length === 0) {
      setImportState({
        status: "error",
        message: "Choose a CSV file with at least one valid row first.",
      });
      return;
    }

    setImportState({ status: "running" });

    try {
      const response = await fetch("/api/admin/import-clinics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dryRun,
          rows,
        }),
      });

      if (!response.ok) {
        setImportState({
          status: "error",
          message: `Import failed with status ${response.status}.`,
        });
        return;
      }

      const result = (await response.json()) as ImportClinicsResult;
      setImportState({
        status: "done",
        result,
        message: dryRun ? "Dry run complete." : "Import complete.",
      });
    } catch {
      setImportState({
        status: "error",
        message: "Import request failed.",
      });
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Import Clinics CSV</h1>
      <p>
        <Link href="/admin">Back to admin list</Link>
      </p>

      <label htmlFor="clinic-csv-input" style={{ display: "block", marginBottom: "0.5rem" }}>
        CSV file
      </label>
      <input
        id="clinic-csv-input"
        name="clinic-csv-input"
        type="file"
        accept=".csv,text/csv"
        onChange={handleCsvSelection}
      />

      {fileName ? <p>Selected file: {fileName}</p> : null}

      {parseErrors.length > 0 ? (
        <section aria-label="CSV validation errors">
          <h2>Validation errors</h2>
          <ul>
            {parseErrors.map((error, index) => (
              <li key={`${error.rowIndex}-${index}`}>
                Row {error.rowIndex}: {error.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rows.length > 0 ? (
        <section aria-label="CSV preview">
          <h2>Preview ({rows.length} rows)</h2>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
                  Name
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
                  Slug
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
                  Website
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.5rem" }}>
                  WhatsApp
                </th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr key={`${row.slug}-${index}`}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.name}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{row.slug}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                    {row.websiteUrl ?? "-"}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                    {row.whatsapp ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => submitImport(true)}
          disabled={importState.status === "running" || rows.length === 0 || hasBlockingClientErrors}
        >
          Validate on server (dry run)
        </button>
        <button
          type="button"
          onClick={() => submitImport(false)}
          disabled={importState.status === "running" || rows.length === 0 || hasBlockingClientErrors}
        >
          Import clinics
        </button>
      </div>

      {importState.message ? <p>{importState.message}</p> : null}
      {importState.result ? (
        <section aria-label="Import result">
          <p>Created: {importState.result.createdCount}</p>
          <p>Updated: {importState.result.updatedCount}</p>
          <p>Errors: {importState.result.errorCount}</p>
          {importState.result.errors.length > 0 ? (
            <ul>
              {importState.result.errors.map((error, index) => (
                <li key={`${error.rowIndex}-${index}`}>
                  Row {error.rowIndex}: {error.message}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

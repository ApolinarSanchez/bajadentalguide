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
    <section className="stack">
      <header className="pageHeader stack">
        <div className="pageTitleRow">
          <h1>Import clinics CSV</h1>
          <Link href="/admin" className="btn btnSecondary btnSm">
            Back to admin list
          </Link>
        </div>
        <p className="pageSubtitle">
          Upload a CSV with clinic name, slug, and contact fields, preview the
          parsed rows, then validate or import.
        </p>
      </header>

      <section className="card stack" aria-label="CSV upload">
        <div className="field">
          <label htmlFor="clinic-csv-input">CSV file</label>
          <input
            id="clinic-csv-input"
            name="clinic-csv-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvSelection}
          />
        </div>
        {fileName ? <p>Selected file: {fileName}</p> : null}
      </section>

      {parseErrors.length > 0 ? (
        <section aria-label="CSV validation errors" className="alert stack">
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
        <section aria-label="CSV preview" className="card stack">
          <h2>Preview ({rows.length} rows)</h2>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Website</th>
                  <th>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${row.slug}-${index}`}>
                    <td>{row.name}</td>
                    <td>{row.slug}</td>
                    <td>{row.websiteUrl ?? "-"}</td>
                    <td>{row.whatsapp ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="fieldRow">
        <button
          className="btn btnSecondary"
          type="button"
          onClick={() => submitImport(true)}
          disabled={importState.status === "running" || rows.length === 0 || hasBlockingClientErrors}
        >
          Validate on server (dry run)
        </button>
        <button
          className="btn btnPrimary"
          type="button"
          onClick={() => submitImport(false)}
          disabled={importState.status === "running" || rows.length === 0 || hasBlockingClientErrors}
        >
          Import clinics
        </button>
      </div>

      {importState.message ? (
        <p className="alert">{importState.message}</p>
      ) : null}
      {importState.result ? (
        <section aria-label="Import result" className="card stack">
          <h2>Import result</h2>
          <div className="row">
            <span className="badge">Created: {importState.result.createdCount}</span>
            <span className="badge">Updated: {importState.result.updatedCount}</span>
            <span className="badge">Errors: {importState.result.errorCount}</span>
          </div>
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
    </section>
  );
}

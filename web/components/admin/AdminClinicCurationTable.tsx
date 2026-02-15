"use client";

import { Alert } from "@/components/Alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CurationClinicRow = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  websiteUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  featuredRank: number | null;
};

type AdminClinicCurationTableProps = {
  clinics: CurationClinicRow[];
  totalCount: number;
  showingFrom: number;
  showingTo: number;
  currentQuery: string;
};

type BulkAction = "publish" | "unpublish" | "feature" | "unfeature" | "assign_featured_ranks";

function hasValue(value: string | null) {
  return Boolean(value && value.trim().length > 0);
}

export function AdminClinicCurationTable({
  clinics,
  totalCount,
  showingFrom,
  showingTo,
  currentQuery,
}: AdminClinicCurationTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [assignMode, setAssignMode] = useState<"append" | "start_at">("append");
  const [startingRank, setStartingRank] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setSelectedIds(new Set());
    setPendingAction(null);
    setMessage("");
    setStatus("idle");
  }, [currentQuery]);

  const selectedClinicIds = useMemo(
    () => clinics.filter((clinic) => selectedIds.has(clinic.id)).map((clinic) => clinic.id),
    [clinics, selectedIds],
  );

  const selectedCount = selectedClinicIds.length;

  function toggleClinic(clinicId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(clinicId);
      } else {
        next.delete(clinicId);
      }
      return next;
    });
  }

  function selectAllOnPage() {
    setSelectedIds(new Set(clinics.map((clinic) => clinic.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function submitBulkAction(action: BulkAction) {
    if (pendingAction || selectedClinicIds.length === 0) {
      return;
    }

    const payload: {
      clinicIds: string[];
      action: BulkAction;
      mode?: "append" | "start_at";
      startingRank?: number;
    } = {
      clinicIds: selectedClinicIds,
      action,
    };

    if (action === "assign_featured_ranks") {
      payload.mode = assignMode;

      if (assignMode === "start_at") {
        const trimmedRank = startingRank.trim();
        if (!trimmedRank) {
          setStatus("error");
          setMessage("Starting rank is required.");
          return;
        }

        const parsedRank = Number.parseInt(trimmedRank, 10);
        if (!Number.isInteger(parsedRank) || parsedRank < 0) {
          setStatus("error");
          setMessage("Starting rank must be a non-negative integer.");
          return;
        }

        payload.startingRank = parsedRank;
      }
    }

    setPendingAction(action);
    setMessage("");
    setStatus("idle");

    try {
      const response = await fetch("/api/admin/curation/bulk-update", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(body.message ?? "Failed to update clinics.");
        return;
      }

      setStatus("success");
      setMessage(body.message ?? "Clinics updated.");
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Failed to update clinics.");
    } finally {
      setPendingAction(null);
    }
  }

  if (clinics.length === 0) {
    return <p className="card">No clinics match the current filters.</p>;
  }

  return (
    <section className="stack">
      <div className="card stack">
        <div className="row">
          <button
            type="button"
            className="btn btnSecondary btnSm"
            onClick={selectAllOnPage}
            disabled={pendingAction !== null}
          >
            Select all on this page
          </button>
          <button
            type="button"
            className="btn btnGhost btnSm"
            onClick={clearSelection}
            disabled={pendingAction !== null}
          >
            Clear selection
          </button>
          <span data-testid="curation-selected-count" className="badge">
            Selected: {selectedCount}
          </span>
          <span className="badge">
            Showing {showingFrom}-{showingTo} of {totalCount}
          </span>
        </div>

        <div className="row" role="group" aria-label="Bulk actions">
          <button
            type="button"
            className="btn btnPrimary btnSm"
            onClick={() => submitBulkAction("publish")}
            disabled={selectedCount === 0 || pendingAction !== null}
          >
            Publish selected
          </button>
          <button
            type="button"
            className="btn btnSecondary btnSm"
            onClick={() => submitBulkAction("unpublish")}
            disabled={selectedCount === 0 || pendingAction !== null}
          >
            Unpublish selected
          </button>
          <button
            type="button"
            className="btn btnSecondary btnSm"
            onClick={() => submitBulkAction("feature")}
            disabled={selectedCount === 0 || pendingAction !== null}
          >
            Feature selected
          </button>
          <button
            type="button"
            className="btn btnSecondary btnSm"
            onClick={() => submitBulkAction("unfeature")}
            disabled={selectedCount === 0 || pendingAction !== null}
          >
            Unfeature selected
          </button>
        </div>

        <div className="fieldRow">
          <div className="field">
            <label htmlFor="bulk-rank-mode">Rank mode</label>
            <select
              id="bulk-rank-mode"
              value={assignMode}
              onChange={(event) => setAssignMode(event.target.value as "append" | "start_at")}
              disabled={pendingAction !== null}
            >
              <option value="append">Append after current max</option>
              <option value="start_at">Start at</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="bulk-starting-rank">Starting rank</label>
            <input
              id="bulk-starting-rank"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={startingRank}
              onChange={(event) => setStartingRank(event.target.value)}
              disabled={assignMode !== "start_at" || pendingAction !== null}
            />
          </div>
          <button
            type="button"
            className="btn btnSecondary btnSm"
            onClick={() => submitBulkAction("assign_featured_ranks")}
            disabled={selectedCount === 0 || pendingAction !== null}
          >
            Assign featured ranks
          </button>
        </div>

        {status !== "idle" && message ? (
          <Alert variant={status === "success" ? "success" : "error"}>{message}</Alert>
        ) : null}
      </div>

      <div className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => {
              const hasPhone = hasValue(clinic.phone);
              const hasWebsite = hasValue(clinic.websiteUrl);
              const hasWhatsapp = hasValue(clinic.whatsapp);

              return (
                <tr key={clinic.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(clinic.id)}
                      onChange={(event) => toggleClinic(clinic.id, event.target.checked)}
                      aria-label={`Select ${clinic.name}`}
                    />
                  </td>
                  <td>
                    <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
                  </td>
                  <td>
                    <span className="muted">{clinic.slug}</span>
                  </td>
                  <td>
                    <div className="row">
                      {hasPhone ? <span className="badge">Phone</span> : null}
                      {hasWebsite ? <span className="badge">Website</span> : null}
                      {hasWhatsapp ? <span className="badge">WhatsApp</span> : null}
                      {!hasPhone && !hasWebsite && !hasWhatsapp ? <span className="muted">None</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="row">
                      <span className="badge">{clinic.isPublished ? "Published" : "Unverified"}</span>
                      {clinic.isFeatured ? (
                        <span className="badge">
                          Featured{clinic.featuredRank !== null ? ` #${clinic.featuredRank}` : ""}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

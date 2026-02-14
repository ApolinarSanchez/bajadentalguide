"use client";

import { Alert } from "@/components/Alert";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ClaimRequestActionsProps = {
  claimRequestId: string;
};

export function ClaimRequestActions({ claimRequestId }: ClaimRequestActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleProcess() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/claims/${claimRequestId}/process`, {
        method: "POST",
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(body.message ?? "Failed to process claim request.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("Failed to process claim request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="stack">
      {message ? <Alert variant="error">{message}</Alert> : null}
      <div className="row">
        <button
          type="button"
          className="btn btnPrimary btnSm"
          onClick={handleProcess}
          disabled={pending}
        >
          {pending ? "Processing..." : "Process"}
        </button>
      </div>
    </div>
  );
}

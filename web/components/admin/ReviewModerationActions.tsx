"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReviewModerationActionsProps = {
  reviewId: string;
};

export function ReviewModerationActions({ reviewId }: ReviewModerationActionsProps) {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleApprove() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: "POST",
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(body.message ?? "Failed to approve review.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("Failed to approve review.");
    } finally {
      setPending(false);
    }
  }

  async function handleReject() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(body.message ?? "Failed to reject review.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("Failed to reject review.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div>
        <button type="button" onClick={handleApprove} disabled={pending}>
          {pending ? "Approving..." : "Approve"}
        </button>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          placeholder="Rejection reason (optional)"
        />
        <button type="button" onClick={handleReject} disabled={pending}>
          {pending ? "Rejecting..." : "Reject"}
        </button>
      </div>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

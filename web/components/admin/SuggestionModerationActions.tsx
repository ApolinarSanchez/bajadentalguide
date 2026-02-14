"use client";

import { Alert } from "@/components/Alert";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SuggestionModerationActionsProps = {
  suggestionId: string;
};

export function SuggestionModerationActions({ suggestionId }: SuggestionModerationActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(path: "apply" | "reject") {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/suggestions/${suggestionId}/${path}`, {
        method: "POST",
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(body.message ?? `Failed to ${path} suggestion.`);
        return;
      }

      router.refresh();
    } catch {
      setMessage(`Failed to ${path} suggestion.`);
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
          onClick={() => submit("apply")}
          disabled={pending}
        >
          {pending ? "Applying..." : "Apply"}
        </button>
        <button
          type="button"
          className="btn btnDanger btnSm"
          onClick={() => submit("reject")}
          disabled={pending}
        >
          {pending ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}

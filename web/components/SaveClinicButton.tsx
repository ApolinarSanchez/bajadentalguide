"use client";

import type { ShortlistSource } from "@/lib/shortlist";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SaveClinicButtonProps = {
  clinicId: string;
  initialSaved: boolean;
  source: ShortlistSource;
  showRemoveLabel?: boolean;
  refreshOnChange?: boolean;
};

export function SaveClinicButton({
  clinicId,
  initialSaved,
  source,
  showRemoveLabel = false,
  refreshOnChange = false,
}: SaveClinicButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) {
      return;
    }

    const previousSaved = saved;
    setSaved(!previousSaved);
    setPending(true);

    try {
      const response = await fetch("/api/shortlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId,
          source,
        }),
      });

      if (!response.ok) {
        setSaved(previousSaved);
        return;
      }

      const result = (await response.json()) as { saved: boolean };
      setSaved(result.saved);

      if (refreshOnChange) {
        router.refresh();
      }
    } catch {
      setSaved(previousSaved);
    } finally {
      setPending(false);
    }
  }

  const label = saved ? (showRemoveLabel ? "Remove" : "Saved") : "Save";

  return (
    <button type="button" onClick={handleToggle} disabled={pending}>
      {pending ? "Saving..." : label}
    </button>
  );
}

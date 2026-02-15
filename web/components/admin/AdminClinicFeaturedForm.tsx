"use client";

import { useState, type ChangeEvent } from "react";

type AdminClinicFeaturedFormProps = {
  clinic: {
    id: string;
    isFeatured: boolean;
    featuredRank: number | null;
  };
  action: (formData: FormData) => Promise<void>;
};

export function AdminClinicFeaturedForm({ clinic, action }: AdminClinicFeaturedFormProps) {
  const [isFeatured, setIsFeatured] = useState(clinic.isFeatured);
  const [rankValue, setRankValue] = useState(clinic.featuredRank?.toString() ?? "");
  const rankInputId = `featured-rank-${clinic.id}`;
  const rankHintId = `featured-rank-hint-${clinic.id}`;

  function handleFeaturedChange(event: ChangeEvent<HTMLInputElement>) {
    setIsFeatured(event.target.checked);
  }

  function handleRankChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    if (nextValue.length === 0) {
      setRankValue("");
      return;
    }

    const parsedValue = Number(nextValue);
    if (Number.isFinite(parsedValue) && parsedValue < 0) {
      setRankValue("0");
      return;
    }

    setRankValue(nextValue);
  }

  return (
    <form action={action} className="row">
      <input type="hidden" name="clinicId" value={clinic.id} />
      <label className="checkboxLabel">
        <input
          type="checkbox"
          name="isFeatured"
          value="1"
          checked={isFeatured}
          onChange={handleFeaturedChange}
        />
        Featured
      </label>
      <div className="field">
        <label htmlFor={rankInputId}>Rank</label>
        <input
          id={rankInputId}
          type="number"
          name="featuredRank"
          min={0}
          step={1}
          inputMode="numeric"
          pattern="[0-9]*"
          value={rankValue}
          onChange={handleRankChange}
          disabled={!isFeatured}
          className="inputSm"
          aria-describedby={rankHintId}
        />
        <p id={rankHintId} className="muted">
          Lower = higher priority.
        </p>
      </div>
      <button type="submit" className="btn btnSecondary btnSm">
        Update
      </button>
    </form>
  );
}

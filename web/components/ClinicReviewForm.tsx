"use client";

import { useMemo, useState, type FormEvent } from "react";

type ClinicReviewFormProps = {
  clinicId: string;
  disabledReason?: string;
  disabled?: boolean;
};

export function ClinicReviewForm({ clinicId, disabled, disabledReason }: ClinicReviewFormProps) {
  const [ratingOverall, setRatingOverall] = useState("5");
  const [procedure, setProcedure] = useState("");
  const [visitMonth, setVisitMonth] = useState("");
  const [visitYear, setVisitYear] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1999 }, (_, index) => 2000 + index).reverse();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId,
          ratingOverall: Number(ratingOverall),
          procedure: procedure || undefined,
          visitMonth: visitMonth ? Number(visitMonth) : undefined,
          visitYear: visitYear ? Number(visitYear) : undefined,
          headline: headline || undefined,
          body,
        }),
      });

      const responseBody = (await response.json()) as { message?: string; ok?: boolean };
      if (!response.ok) {
        setMessage(responseBody.message || "Unable to submit review.");
        return;
      }

      setMessage("Submitted for moderation");
      setSubmitted(true);
    } catch {
      setMessage("Unable to submit review.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section>
      <h2>Leave a BDG review</h2>
      {disabledReason ? <p>{disabledReason}</p> : null}
      <form onSubmit={handleSubmit}>
        <fieldset disabled={Boolean(disabled) || pending || submitted}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="review-rating">Rating</label>
            <select
              id="review-rating"
              value={ratingOverall}
              onChange={(event) => setRatingOverall(event.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="review-procedure">Procedure (optional)</label>
            <input
              id="review-procedure"
              value={procedure}
              onChange={(event) => setProcedure(event.target.value)}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="review-visit-month">Visit month (optional)</label>
            <select
              id="review-visit-month"
              value={visitMonth}
              onChange={(event) => setVisitMonth(event.target.value)}
            >
              <option value="">--</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="review-visit-year">Visit year (optional)</label>
            <select
              id="review-visit-year"
              value={visitYear}
              onChange={(event) => setVisitYear(event.target.value)}
            >
              <option value="">--</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="review-headline">Headline (optional)</label>
            <input
              id="review-headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="review-body">Review</label>
            <textarea
              id="review-body"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
              minLength={40}
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">{pending ? "Submitting..." : "Submit review"}</button>
        </fieldset>
      </form>
      {message ? <p>{message}</p> : null}
    </section>
  );
}

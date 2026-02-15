"use client";

import { Alert } from "@/components/Alert";
import { useState, type FormEvent } from "react";

type ClinicEditSuggestionFormProps = {
  clinicSlug: string;
};

export function ClinicEditSuggestionForm({ clinicSlug }: ClinicEditSuggestionFormProps) {
  const [suggestedPhone, setSuggestedPhone] = useState("");
  const [suggestedWhatsapp, setSuggestedWhatsapp] = useState("");
  const [suggestedWebsiteUrl, setSuggestedWebsiteUrl] = useState("");
  const [suggestedYelpUrl, setSuggestedYelpUrl] = useState("");
  const [suggestedNote, setSuggestedNote] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");
    setStatus("idle");

    try {
      const response = await fetch(`/api/clinics/${clinicSlug}/suggest-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          suggestedPhone: suggestedPhone || undefined,
          suggestedWhatsapp: suggestedWhatsapp || undefined,
          suggestedWebsiteUrl: suggestedWebsiteUrl || undefined,
          suggestedYelpUrl: suggestedYelpUrl || undefined,
          suggestedNote: suggestedNote || undefined,
          contactEmail: contactEmail || undefined,
        }),
      });

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        if (response.status === 429) {
          setMessage("Too many requests. Please try again later.");
          setStatus("error");
          return;
        }
        setMessage(body.message ?? "Unable to submit suggestion.");
        setStatus("error");
        return;
      }

      setSubmitted(true);
      setMessage("Suggestion submitted for moderation.");
      setStatus("success");
    } catch {
      setMessage("Unable to submit suggestion.");
      setStatus("error");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card stack">
      <h2>Suggest an edit</h2>
      <p className="pageSubtitle">
        Share corrections for contact fields and we&apos;ll review before publishing any changes.
      </p>
      <form className="stack" onSubmit={handleSubmit}>
        <fieldset className="stack" disabled={pending || submitted}>
          <div className="field">
            <label htmlFor="suggested-phone">Phone</label>
            <input
              id="suggested-phone"
              value={suggestedPhone}
              onChange={(event) => setSuggestedPhone(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="suggested-whatsapp">WhatsApp</label>
            <input
              id="suggested-whatsapp"
              value={suggestedWhatsapp}
              onChange={(event) => setSuggestedWhatsapp(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="suggested-website">Website URL</label>
            <input
              id="suggested-website"
              type="url"
              value={suggestedWebsiteUrl}
              onChange={(event) => setSuggestedWebsiteUrl(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="suggested-yelp">Yelp URL</label>
            <input
              id="suggested-yelp"
              type="url"
              value={suggestedYelpUrl}
              onChange={(event) => setSuggestedYelpUrl(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="suggested-note">Notes</label>
            <textarea
              id="suggested-note"
              value={suggestedNote}
              onChange={(event) => setSuggestedNote(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="contact-email">Contact email (optional)</label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          {message ? (
            <Alert variant={status === "success" ? "success" : "error"}>{message}</Alert>
          ) : null}
          <button type="submit" className="btn btnPrimary">
            {pending ? "Submitting..." : "Submit suggestion"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}

"use client";

import { Alert } from "@/components/Alert";
import { useState, type FormEvent } from "react";

type ClinicClaimFormProps = {
  clinicSlug: string;
};

export function ClinicClaimForm({ clinicSlug }: ClinicClaimFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setStatusMessage("");
    setStatus("idle");

    try {
      const response = await fetch(`/api/clinics/${clinicSlug}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role: role || undefined,
          message: message || undefined,
        }),
      });

      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        if (response.status === 429) {
          setStatusMessage("Too many requests. Please try again later.");
          setStatus("error");
          return;
        }
        setStatusMessage(body.message ?? "Unable to submit claim request.");
        setStatus("error");
        return;
      }

      setSubmitted(true);
      setStatusMessage("Claim request submitted.");
      setStatus("success");
    } catch {
      setStatusMessage("Unable to submit claim request.");
      setStatus("error");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card stack">
      <h2>Claim this listing</h2>
      <p className="pageSubtitle">
        If you represent this clinic, send a request and we&apos;ll review ownership details.
      </p>
      <form className="stack" onSubmit={handleSubmit}>
        <fieldset className="stack" disabled={pending || submitted}>
          <div className="field">
            <label htmlFor="claim-name">Name</label>
            <input
              id="claim-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="claim-email">Email</label>
            <input
              id="claim-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="claim-role">Role (optional)</label>
            <input
              id="claim-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="claim-message">Message (optional)</label>
            <textarea
              id="claim-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          {statusMessage ? (
            <Alert variant={status === "success" ? "success" : "error"}>{statusMessage}</Alert>
          ) : null}
          <button type="submit" className="btn btnPrimary">
            {pending ? "Submitting..." : "Submit claim request"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}

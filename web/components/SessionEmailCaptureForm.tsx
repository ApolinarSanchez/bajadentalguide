"use client";

import { Alert } from "@/components/Alert";
import { FormEvent, useState } from "react";

type SessionEmailCaptureFormProps = {
  currentEmail?: string | null;
  currentOptIn?: boolean;
};

export function SessionEmailCaptureForm({ currentEmail, currentOptIn }: SessionEmailCaptureFormProps) {
  const [email, setEmail] = useState(currentEmail ?? "");
  const [optIn, setOptIn] = useState(currentOptIn ?? true);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const isErrorMessage =
    message === "Too many requests. Please try again later." ||
    message === "Failed to save email.";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/session/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          optIn,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        if (response.status === 429) {
          setMessage("Too many requests. Please try again later.");
          return;
        }
        setMessage(payload.message ?? "Failed to save email.");
        return;
      }

      setMessage("Email preferences saved.");
    } catch {
      setMessage("Failed to save email.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card stack">
      <h2>Get reminders and follow-ups</h2>
      <p>We’ll email you in about a week to ask how it went and invite a review.</p>
      <form className="stack" onSubmit={handleSubmit}>
        <fieldset className="stack" disabled={pending}>
          <div className="field">
            <label htmlFor="shortlist-email">Email</label>
            <input
              id="shortlist-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="fieldRow">
            <label className="checkboxLabel">
              <input
                type="checkbox"
                checked={optIn}
                onChange={(event) => setOptIn(event.target.checked)}
              />
              Email me reminders
            </label>
          </div>
          {message ? (
            <Alert variant={isErrorMessage ? "error" : "success"}>{message}</Alert>
          ) : null}
          <button className="btn btnPrimary" type="submit">
            {pending ? "Saving..." : "Save reminders"}
          </button>
        </fieldset>
      </form>
      {currentOptIn ? <p>You&apos;re subscribed.</p> : null}
      {currentOptIn ? (
        <p>Unsubscribe link will be included in emails.</p>
      ) : null}
    </section>
  );
}

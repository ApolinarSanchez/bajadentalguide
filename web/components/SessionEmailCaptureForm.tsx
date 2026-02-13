"use client";

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
    <section style={{ border: "1px solid #ddd", borderRadius: "0.5rem", padding: "0.75rem" }}>
      <h2>Get reminders and follow-ups</h2>
      <p>We’ll email you in about a week to ask how it went and invite a review.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="shortlist-email">Email</label>
          <input
            id="shortlist-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            <input
              type="checkbox"
              checked={optIn}
              onChange={(event) => setOptIn(event.target.checked)}
            />{" "}
            Email me reminders
          </label>
        </div>
        <button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save reminders"}
        </button>
      </form>
      {currentOptIn ? <p>You&apos;re subscribed.</p> : null}
      {currentOptIn ? (
        <p>Unsubscribe link will be included in emails.</p>
      ) : null}
      {message ? <p>{message}</p> : null}
    </section>
  );
}

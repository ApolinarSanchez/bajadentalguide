import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicEditSuggestionForm } from "@/components/ClinicEditSuggestionForm";

describe("ClinicEditSuggestionForm", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows API validation errors as an alert", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Provide at least one suggested field or note." }),
    } as Response);

    render(<ClinicEditSuggestionForm clinicSlug="demo-clinic" />);

    fireEvent.click(screen.getByRole("button", { name: "Submit suggestion" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Provide at least one suggested field or note.");
  });

  it("shows successful submissions as status", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ ok: true }),
    } as Response);

    render(<ClinicEditSuggestionForm clinicSlug="demo-clinic" />);

    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "+52-664-123-4567" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit suggestion" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Suggestion submitted for moderation.");
  });
});

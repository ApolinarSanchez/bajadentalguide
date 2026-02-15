import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicClaimForm } from "@/components/ClinicClaimForm";

describe("ClinicClaimForm", () => {
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
      json: async () => ({ message: "email is invalid." }),
    } as Response);

    render(<ClinicClaimForm clinicSlug="demo-clinic" />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Owner Name" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit claim request" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("email is invalid.");
  });

  it("shows successful submissions as status", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ ok: true }),
    } as Response);

    render(<ClinicClaimForm clinicSlug="demo-clinic" />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Owner Name" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit claim request" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Claim request submitted.");
  });
});

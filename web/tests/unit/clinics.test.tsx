import { render, screen } from "@testing-library/react";
import ClinicsPage from "@/app/clinics/page";
import { describe, expect, it } from "vitest";

describe("Clinics page", () => {
  it("renders the clinics heading", () => {
    render(<ClinicsPage />);

    expect(screen.getByRole("heading", { name: "Clinics" })).toBeInTheDocument();
  });

  it("renders placeholder clinic content", () => {
    render(<ClinicsPage />);

    expect(screen.getByText("Placeholder list of clinics.")).toBeInTheDocument();
  });
});

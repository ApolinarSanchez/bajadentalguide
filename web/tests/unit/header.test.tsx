import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "@/components/Header";

describe("Header", () => {
  it("includes primary navigation links", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "Clinics" })).toHaveAttribute("href", "/clinics");
    expect(screen.getByRole("link", { name: "Shortlist" })).toHaveAttribute("href", "/shortlist");
  });
});

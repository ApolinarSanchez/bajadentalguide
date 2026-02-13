import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
  it("includes legal and policy links", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Review Policy" })).toHaveAttribute(
      "href",
      "/review-policy",
    );
    expect(screen.getByRole("link", { name: "Methodology" })).toHaveAttribute(
      "href",
      "/methodology",
    );
  });
});

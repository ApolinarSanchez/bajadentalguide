import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { describe, expect, it } from "vitest";

describe("Home page CTAs", () => {
  it("renders Browse clinics CTA linking to clinics", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("link", { name: "Browse clinics" }),
    ).toHaveAttribute("href", "/clinics");
  });
});

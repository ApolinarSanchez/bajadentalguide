import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { describe, expect, it } from "vitest";

describe("Home page", () => {
  it("renders the expected heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "BajaDentalGuide" }),
    ).toBeInTheDocument();
  });
});

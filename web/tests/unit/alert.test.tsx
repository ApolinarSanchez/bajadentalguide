import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "@/components/Alert";

describe("Alert", () => {
  it("renders error alerts with role alert", () => {
    render(<Alert variant="error">Error</Alert>);

    expect(screen.getByRole("alert")).toHaveTextContent("Error");
  });

  it("renders success alerts with role status", () => {
    render(<Alert variant="success">OK</Alert>);

    expect(screen.getByRole("status")).toHaveTextContent("OK");
  });
});

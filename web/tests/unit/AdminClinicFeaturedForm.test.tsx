import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminClinicFeaturedForm } from "@/components/admin/AdminClinicFeaturedForm";

describe("AdminClinicFeaturedForm", () => {
  it("disables rank input when clinic is not featured and shows helper text", () => {
    const action = vi.fn(async () => {});

    render(
      <AdminClinicFeaturedForm
        clinic={{
          id: "clinic-1",
          isFeatured: false,
          featuredRank: 7,
        }}
        action={action}
      />,
    );

    expect(screen.getByRole("spinbutton", { name: "Rank" })).toBeDisabled();
    expect(screen.getByText("Lower = higher priority.")).toBeVisible();
  });

  it("enables rank input when clinic is featured and keeps existing rank value", () => {
    const action = vi.fn(async () => {});

    render(
      <AdminClinicFeaturedForm
        clinic={{
          id: "clinic-2",
          isFeatured: true,
          featuredRank: 7,
        }}
        action={action}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Featured" })).toBeChecked();
    expect(screen.getByRole("spinbutton", { name: "Rank" })).toBeEnabled();
    expect(screen.getByRole("spinbutton", { name: "Rank" })).toHaveValue(7);
  });
});

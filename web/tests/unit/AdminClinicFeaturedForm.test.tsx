import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminClinicFeaturedForm } from "@/components/admin/AdminClinicFeaturedForm";

describe("AdminClinicFeaturedForm", () => {
  it("renders checked featured toggle and existing rank value", () => {
    const action = vi.fn(async () => {});

    render(
      <AdminClinicFeaturedForm
        clinic={{
          id: "clinic-1",
          isFeatured: true,
          featuredRank: 7,
        }}
        action={action}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "Featured" })).toBeChecked();
    expect(screen.getByRole("spinbutton", { name: /Featured rank/i })).toHaveValue(7);
  });
});

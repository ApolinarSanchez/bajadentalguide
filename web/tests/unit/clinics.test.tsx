import { render, screen } from "@testing-library/react";
import ClinicsPage from "@/app/clinics/page";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    clinic: {
      findMany: findManyMock,
    },
  },
}));

describe("Clinics page", () => {
  beforeEach(() => {
    findManyMock.mockResolvedValue([
      { id: "1", name: "Baja Smile Dental Center", slug: "baja-smile-dental-center" },
      { id: "2", name: "Clinica Dental Rio", slug: "clinica-dental-rio" },
    ]);
  });

  it("renders the clinics heading", async () => {
    render(await ClinicsPage());

    expect(screen.getByRole("heading", { name: "Clinics" })).toBeInTheDocument();
  });

  it("renders clinic names from the database", async () => {
    render(await ClinicsPage());

    expect(screen.getByText("Baja Smile Dental Center")).toBeInTheDocument();
    expect(screen.getByText("Clinica Dental Rio")).toBeInTheDocument();
  });
});

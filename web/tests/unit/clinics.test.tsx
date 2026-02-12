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
      {
        id: "1",
        name: "Baja Smile Dental Center",
        slug: "baja-smile-dental-center",
        websiteUrl: "/__e2e__/target",
        whatsapp: "+52-664-777-1000",
        googleMapsUrl: "https://maps.google.com/?q=baja",
        yelpUrl: "https://www.yelp.com/biz/baja-smile-dental-center",
      },
      {
        id: "2",
        name: "Clinica Dental Rio",
        slug: "clinica-dental-rio",
        websiteUrl: "https://clinica-dental-rio.example",
        whatsapp: "+52-664-777-1002",
        googleMapsUrl: "https://maps.google.com/?q=rio",
        yelpUrl: "https://www.yelp.com/biz/clinica-dental-rio",
      },
    ]);
  });

  it("renders the clinics heading", async () => {
    render(await ClinicsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Clinics" })).toBeInTheDocument();
  });

  it("renders clinic names from the database", async () => {
    render(await ClinicsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Baja Smile Dental Center")).toBeInTheDocument();
    expect(screen.getByText("Clinica Dental Rio")).toBeInTheDocument();
  });
});

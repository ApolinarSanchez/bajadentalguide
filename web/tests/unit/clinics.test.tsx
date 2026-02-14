import { render, screen } from "@testing-library/react";
import ClinicsPage from "@/app/clinics/page";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { clinicFindManyMock, neighborhoodFindManyMock, procedureFindManyMock, cookiesMock } =
  vi.hoisted(() => ({
    clinicFindManyMock: vi.fn(),
    neighborhoodFindManyMock: vi.fn(),
    procedureFindManyMock: vi.fn(),
  cookiesMock: vi.fn(),
  }));

vi.mock("@/lib/db", () => ({
  db: {
    clinic: {
      findMany: clinicFindManyMock,
    },
    neighborhood: {
      findMany: neighborhoodFindManyMock,
    },
    procedure: {
      findMany: procedureFindManyMock,
    },
    savedClinic: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/components/SaveClinicButton", () => ({
  SaveClinicButton: () => <button type="button">Save</button>,
}));

describe("Clinics page", () => {
  beforeEach(() => {
    clinicFindManyMock.mockReset();
    neighborhoodFindManyMock.mockReset();
    procedureFindManyMock.mockReset();
    cookiesMock.mockReset();

    cookiesMock.mockResolvedValue({
      get() {
        return undefined;
      },
    });

    neighborhoodFindManyMock.mockResolvedValue([]);
    procedureFindManyMock.mockResolvedValue([]);

    clinicFindManyMock.mockResolvedValueOnce([]).mockResolvedValueOnce([
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

    expect(screen.getAllByText("Baja Smile Dental Center").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Clinica Dental Rio").length).toBeGreaterThan(0);
  });
});

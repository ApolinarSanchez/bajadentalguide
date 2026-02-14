import { describe, expect, it } from "vitest";
import { validateClinicClaimRequest } from "@/lib/claims/validateClaimRequest";

describe("validateClinicClaimRequest", () => {
  it("rejects invalid payload types", () => {
    const result = validateClinicClaimRequest(null);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("Request body must be an object.");
    }
  });

  it("rejects missing name/email", () => {
    const result = validateClinicClaimRequest({
      name: " ",
      email: " ",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("name is required.");
      expect(result.errors).toContain("email is required.");
    }
  });

  it("rejects invalid email", () => {
    const result = validateClinicClaimRequest({
      name: "Owner Name",
      email: "not-an-email",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("email is invalid.");
    }
  });

  it("accepts valid payload", () => {
    const result = validateClinicClaimRequest({
      name: " Owner Name ",
      email: "Owner@Example.com",
      role: "Practice manager",
      message: "Please contact me to verify ownership.",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Owner Name");
      expect(result.value.email).toBe("owner@example.com");
      expect(result.value.role).toBe("Practice manager");
    }
  });
});

import { describe, expect, it } from "vitest";
import { validateEmail } from "@/lib/email/validateEmail";

describe("validateEmail", () => {
  it("accepts a valid email", () => {
    const result = validateEmail("a@b.com");

    expect(result.ok).toBe(true);
    expect(result.value).toBe("a@b.com");
  });

  it("rejects invalid email", () => {
    const result = validateEmail("not-an-email");

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Email is invalid.");
  });
});

import { describe, expect, it } from "vitest";
import { buildFeaturedUpdateData } from "@/lib/clinics/featuredUpdate";

describe("buildFeaturedUpdateData", () => {
  it("preserves featuredRank when toggled on and rank field is missing", () => {
    const data = buildFeaturedUpdateData({
      isFeatured: true,
      featuredRankRaw: null,
    });

    expect(data.isFeatured).toBe(true);
    expect(data.isPublished).toBe(true);
    expect("featuredRank" in data).toBe(false);
  });

  it("clears featuredRank when toggled off", () => {
    const data = buildFeaturedUpdateData({
      isFeatured: false,
      featuredRankRaw: "7",
    });

    expect(data).toEqual({
      isFeatured: false,
      featuredRank: null,
    });
  });

  it("clears featuredRank when rank input is explicitly blank", () => {
    const data = buildFeaturedUpdateData({
      isFeatured: true,
      featuredRankRaw: "",
    });

    expect(data).toEqual({
      isFeatured: true,
      isPublished: true,
      featuredRank: null,
    });
  });

  it("sets featuredRank when valid integer is provided", () => {
    const data = buildFeaturedUpdateData({
      isFeatured: true,
      featuredRankRaw: "3",
    });

    expect(data).toEqual({
      isFeatured: true,
      isPublished: true,
      featuredRank: 3,
    });
  });

  it("throws on invalid featuredRank values", () => {
    expect(() =>
      buildFeaturedUpdateData({
        isFeatured: true,
        featuredRankRaw: "abc",
      }),
    ).toThrow("featuredRank must be a non-negative integer");

    expect(() =>
      buildFeaturedUpdateData({
        isFeatured: true,
        featuredRankRaw: "-1",
      }),
    ).toThrow("featuredRank must be a non-negative integer");
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const pageFiles = [
  "app/about/page.tsx",
  "app/contact/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/review-policy/page.tsx",
  "app/methodology/page.tsx",
  "app/unsubscribe/page.tsx",
];

describe("Policy and trust pages source", () => {
  it.each(pageFiles)("%s does not use inline styles or a main tag", (filePath) => {
    const source = readFileSync(path.join(process.cwd(), filePath), "utf8");

    expect(source).not.toContain("style={{");
    expect(source).not.toMatch(/<main\b/);
  });
});

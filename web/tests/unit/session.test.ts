import { getSessionIdFromCookies } from "@/lib/session";
import { describe, expect, it } from "vitest";

describe("getSessionIdFromCookies", () => {
  it("returns session id when cookie exists", () => {
    const cookiesLike = {
      get(name: string) {
        if (name === "bdg_session") {
          return { value: "session-123" };
        }
        return undefined;
      },
    };

    expect(getSessionIdFromCookies(cookiesLike)).toBe("session-123");
  });

  it("returns null when session cookie is missing", () => {
    const cookiesLike = {
      get() {
        return undefined;
      },
    };

    expect(getSessionIdFromCookies(cookiesLike)).toBeNull();
  });
});

import { describe, expect, it, vi } from "vitest";
import { fetchAllBuscarAreaAct } from "@/lib/denue/denueClient";

describe("fetchAllBuscarAreaAct", () => {
  it("fetches paginated DENUE pages until an empty array", async () => {
    const payloads = [[{ Id: 1 }, { Id: 2 }], [{ Id: 3 }], []] as const;
    let callIndex = 0;

    const fetchMock = vi.fn(async () => {
      const payload = payloads[Math.min(callIndex, payloads.length - 1)];
      callIndex += 1;
      return {
        ok: true,
        status: 200,
        json: async () => payload,
      } as Response;
    });

    const rows = await fetchAllBuscarAreaAct({
      entidad: "02",
      municipio: "004",
      clase: "621211",
      token: "test-token",
      pageSize: 2,
      delayMs: 0,
      fetchImpl: fetchMock as unknown as typeof fetch,
      sleepFn: async () => Promise.resolve(),
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(rows).toHaveLength(3);

  });
});

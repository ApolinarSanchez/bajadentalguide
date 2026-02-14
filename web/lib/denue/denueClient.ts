const DENUE_BASE_URL = "https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarAreaAct";

type SleepFn = (ms: number) => Promise<void>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTransientStatus(status: number): boolean {
  return status >= 500;
}

export type BuscarAreaActUrlParams = {
  entidad: string;
  municipio: string;
  clase: string;
  regIni: number;
  regFin: number;
  token: string;
};

export function buildBuscarAreaActUrl(params: BuscarAreaActUrlParams): string {
  const segments = [
    DENUE_BASE_URL,
    encodeURIComponent(params.entidad),
    encodeURIComponent(params.municipio),
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    encodeURIComponent(params.clase),
    "0",
    String(params.regIni),
    String(params.regFin),
    "0",
    encodeURIComponent(params.token),
  ];
  return segments.join("/");
}

export type FetchBuscarAreaActPageParams = BuscarAreaActUrlParams & {
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  backoffMs?: number;
  sleepFn?: SleepFn;
};

export async function fetchBuscarAreaActPage(
  params: FetchBuscarAreaActPageParams,
): Promise<unknown[]> {
  const fetchImpl = params.fetchImpl ?? fetch;
  const maxRetries = params.maxRetries ?? 3;
  const backoffMs = params.backoffMs ?? 250;
  const sleepFn = params.sleepFn ?? sleep;
  const url = buildBuscarAreaActUrl(params);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const isLastAttempt = attempt === maxRetries;
    let response: Response;

    try {
      response = await fetchImpl(url);
    } catch (error) {
      if (!isLastAttempt) {
        await sleepFn(backoffMs * 2 ** attempt);
        continue;
      }
      const message = error instanceof Error ? error.message : "Unknown DENUE request error";
      throw new Error(message);
    }

    if (!response.ok) {
      if (isTransientStatus(response.status) && !isLastAttempt) {
        await sleepFn(backoffMs * 2 ** attempt);
        continue;
      }
      throw new Error(`DENUE request failed (${response.status}) for ${url}`);
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      throw new Error(`Unexpected DENUE response payload for ${url}`);
    }
    return payload;
  }

  return [];
}

export type FetchAllBuscarAreaActParams = {
  entidad: string;
  municipio: string;
  clase: string;
  token: string;
  pageSize?: number;
  delayMs?: number;
  fetchImpl?: typeof fetch;
  maxRetries?: number;
  backoffMs?: number;
  sleepFn?: SleepFn;
};

export async function fetchAllBuscarAreaAct(params: FetchAllBuscarAreaActParams): Promise<unknown[]> {
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 200;
  const delayMs = params.delayMs ?? 200;
  const sleepFn = params.sleepFn ?? sleep;

  const records: unknown[] = [];
  let regIni = 1;

  while (true) {
    const regFin = regIni + pageSize - 1;
    const page = await fetchBuscarAreaActPage({
      entidad: params.entidad,
      municipio: params.municipio,
      clase: params.clase,
      regIni,
      regFin,
      token: params.token,
      fetchImpl: params.fetchImpl,
      maxRetries: params.maxRetries,
      backoffMs: params.backoffMs,
      sleepFn,
    });

    if (page.length === 0) {
      break;
    }

    records.push(...page);
    regIni += pageSize;

    if (delayMs > 0) {
      await sleepFn(delayMs);
    }
  }

  return records;
}

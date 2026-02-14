export type ClinicSort = "name_asc" | "name_desc" | "newest";

export type ClinicFilters = {
  q: string;
  neighborhood?: string;
  procedure?: string;
  hasWebsite: boolean;
  hasWhatsapp: boolean;
  hasGoogle: boolean;
  hasYelp: boolean;
  includeUnverified: boolean;
  sort: ClinicSort;
};

type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function getFirstParamValue(input: SearchParamsInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) {
    const value = input.get(key);
    return value === null ? undefined : value;
  }

  const value = input[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseToggle(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "on";
}

function parseSort(value: string | undefined): ClinicSort {
  if (value === "name_desc" || value === "newest" || value === "name_asc") {
    return value;
  }
  return "name_asc";
}

function parseOptionalSlug(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseClinicFilters(searchParams: SearchParamsInput): ClinicFilters {
  return {
    q: (getFirstParamValue(searchParams, "q") ?? "").trim(),
    neighborhood: parseOptionalSlug(getFirstParamValue(searchParams, "neighborhood")),
    procedure: parseOptionalSlug(getFirstParamValue(searchParams, "procedure")),
    hasWebsite: parseToggle(getFirstParamValue(searchParams, "hasWebsite")),
    hasWhatsapp: parseToggle(getFirstParamValue(searchParams, "hasWhatsapp")),
    hasGoogle: parseToggle(getFirstParamValue(searchParams, "hasGoogle")),
    hasYelp: parseToggle(getFirstParamValue(searchParams, "hasYelp")),
    includeUnverified: parseToggle(getFirstParamValue(searchParams, "includeUnverified")),
    sort: parseSort(getFirstParamValue(searchParams, "sort")),
  };
}

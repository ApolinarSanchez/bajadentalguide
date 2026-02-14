import { slugify } from "../slugify.ts";

export type DenueRecord = Record<string, unknown>;

export type DenueClinicRow = {
  name: string;
  slug: string;
  addressLine1?: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  whatsapp: string;
  websiteUrl?: string;
  googleMapsUrl: string;
  yelpUrl: string;
};

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function toIdString(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

export function normalizeWebsiteUrl(value: unknown): string | undefined {
  const raw = toNonEmptyString(value);
  if (!raw || /^(na|n\/a)$/i.test(raw)) {
    return undefined;
  }

  const withScheme =
    /^https?:\/\//i.test(raw)
      ? raw
      : raw.startsWith("www.") || raw.includes(".")
        ? `https://${raw}`
        : undefined;

  if (!withScheme) {
    return undefined;
  }

  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }

    if (parsed.pathname === "/" && !parsed.search && !parsed.hash) {
      return `${parsed.protocol}//${parsed.host}`;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function buildAddressLine1(record: DenueRecord): string | undefined {
  const tipoVialidad = toNonEmptyString(record.Tipo_vialidad);
  const calle = toNonEmptyString(record.Calle);
  const numExterior = toNonEmptyString(record.Num_Exterior);
  const numInterior = toNonEmptyString(record.Num_Interior);
  const colonia = toNonEmptyString(record.Colonia);
  const cp = toNonEmptyString(record.CP);

  const streetParts = [tipoVialidad, calle, numExterior].filter(
    (part): part is string => Boolean(part),
  );

  if (numInterior) {
    streetParts.push(`Int. ${numInterior}`);
  }

  const segments: string[] = [];
  if (streetParts.length > 0) {
    segments.push(streetParts.join(" "));
  }
  if (colonia) {
    segments.push(`Col. ${colonia}`);
  }
  if (cp) {
    segments.push(`CP ${cp}`);
  }

  const address = segments
    .join(", ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,+/g, ", ")
    .replace(/^,\s*/g, "")
    .replace(/,\s*$/g, "")
    .trim();

  return address.length > 0 ? address : undefined;
}

export function parseLatLng(record: DenueRecord): { lat?: number; lng?: number } {
  const lat = toNumber(record.Latitud);
  const lng = toNumber(record.Longitud);

  return {
    ...(lat !== undefined ? { lat } : {}),
    ...(lng !== undefined ? { lng } : {}),
  };
}

export function buildGoogleMapsUrl({
  lat,
  lng,
  name,
  addressLine1,
  city,
  state,
}: {
  lat?: number;
  lng?: number;
  name?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
}): string {
  const query =
    lat !== undefined && lng !== undefined
      ? `${lat},${lng}`
      : [name, addressLine1, city, state].filter(Boolean).join(", ") || "Tijuana, BC";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function denueRecordToClinicRow(record: DenueRecord): DenueClinicRow {
  const id = toIdString(record.Id);
  const name =
    toNonEmptyString(record.Nombre) ??
    toNonEmptyString(record.Denominacion) ??
    (id ? `DENUE clinic ${id}` : "DENUE clinic");
  const slug = slugify(name) || "clinic";
  const addressLine1 = buildAddressLine1(record);
  const phone = toNonEmptyString(record.Telefono);
  const websiteUrl = normalizeWebsiteUrl(record.Sitio_internet);
  const { lat, lng } = parseLatLng(record);

  return {
    name,
    slug,
    ...(addressLine1 ? { addressLine1 } : {}),
    city: "Tijuana",
    state: "BC",
    country: "MX",
    ...(phone ? { phone } : {}),
    whatsapp: "",
    ...(websiteUrl ? { websiteUrl } : {}),
    googleMapsUrl: buildGoogleMapsUrl({
      lat,
      lng,
      name,
      addressLine1,
      city: "Tijuana",
      state: "BC",
    }),
    yelpUrl: "",
  };
}

function compareDenueRecords(a: DenueRecord, b: DenueRecord): number {
  const idA = toNumber(a.Id);
  const idB = toNumber(b.Id);

  if (idA !== undefined && idB !== undefined) {
    return idA - idB;
  }
  if (idA !== undefined) {
    return -1;
  }
  if (idB !== undefined) {
    return 1;
  }

  const nameA = toNonEmptyString(a.Nombre) ?? "";
  const nameB = toNonEmptyString(b.Nombre) ?? "";
  return nameA.localeCompare(nameB);
}

export function denueRecordsToClinicRows(records: DenueRecord[]): DenueClinicRow[] {
  const sorted = [...records].sort(compareDenueRecords);
  const rows = sorted.map((record) => denueRecordToClinicRow(record));

  const usedSlugs = new Set<string>();
  const baseCounters = new Map<string, number>();

  return rows.map((row, index) => {
    const record = sorted[index];
    const baseSlug = row.slug || "clinic";
    const id = toIdString(record.Id);

    let uniqueSlug = baseSlug;
    if (usedSlugs.has(uniqueSlug)) {
      if (id) {
        uniqueSlug = `${baseSlug}-${id}`;
      }

      if (usedSlugs.has(uniqueSlug)) {
        let counter = (baseCounters.get(baseSlug) ?? 1) + 1;
        while (usedSlugs.has(`${baseSlug}-${counter}`)) {
          counter += 1;
        }
        uniqueSlug = `${baseSlug}-${counter}`;
        baseCounters.set(baseSlug, counter);
      }
    }

    usedSlugs.add(uniqueSlug);
    if (!baseCounters.has(baseSlug)) {
      baseCounters.set(baseSlug, 1);
    }

    return {
      ...row,
      slug: uniqueSlug,
    };
  });
}

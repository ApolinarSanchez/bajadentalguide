/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TAXONOMY_NEIGHBORHOODS = [
  {
    name: "Zona Río",
    slug: "zona-rio",
    description: "Business district with clinics near major medical corridors.",
  },
  {
    name: "Centro",
    slug: "centro",
    description: "Central district with walkable access and transit options.",
  },
  {
    name: "Otay",
    slug: "otay",
    description: "Area close to border crossings and commercial zones.",
  },
  {
    name: "Playas de Tijuana",
    slug: "playas-de-tijuana",
    description: "Coastal neighborhood serving west-side communities.",
  },
];

const TAXONOMY_PROCEDURES = [
  {
    name: "Dental Implants",
    slug: "dental-implants",
    description: "Implant-based restoration options.",
  },
  {
    name: "All-on-4",
    slug: "all-on-4",
    description: "Full-arch implant restoration with four implants.",
  },
  {
    name: "Crowns",
    slug: "crowns",
    description: "Tooth-shaped caps used to restore damaged teeth.",
  },
  {
    name: "Veneers",
    slug: "veneers",
    description: "Thin shells placed over front tooth surfaces.",
  },
  {
    name: "Root Canal",
    slug: "root-canal",
    description: "Endodontic treatment for infected tooth pulp.",
  },
];

const KNOWN_E2E_IMPLANTS_CLINIC = {
  name: "BDG E2E Implants Clinic",
  slug: "bdg-e2e-implants-clinic",
  addressLine1: "500 Boulevard Agua Caliente",
  city: "Tijuana",
  state: "BC",
  country: "MX",
  phone: "+52-664-888-2000",
  whatsapp: "+52-664-888-2000",
  websiteUrl: "https://www.bdg-e2e-implants-clinic.example",
  googleMapsUrl: "https://maps.google.com/?q=BDG%20E2E%20Implants%20Clinic",
  yelpUrl: "https://www.yelp.com/biz/bdg-e2e-implants-clinic",
  isPublished: true,
};

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function hasDirectContact(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function computeIsPublished(clinic) {
  return (
    hasDirectContact(clinic.phone) ||
    hasDirectContact(clinic.websiteUrl) ||
    hasDirectContact(clinic.whatsapp)
  );
}

function toSeedClinics() {
  const names = [
    "Baja Smile Dental Center",
    "Pacific Coast Dental Care",
    "Clinica Dental Rio",
    "Sonrisa Norte Dentistry",
    "Blue Wave Implant Studio",
    "Borderline Family Dental",
    "Costa Verde Dental Group",
    "Sunset Oral Health Clinic",
    "Puerta Dental Specialists",
    "La Mesa Dental Arts",
    "Libertad Dental House",
    "Downtown Tijuana Dental Hub",
    "Marina Dental and Implants",
    "Colonia Cacho Dental Center",
    "Riviera Smile Studio",
    "Oceanside Dental Partners",
    "New Image Dental MX",
    "Valle Dorado Dental Lab",
    "Gateway Dental Institute",
    "Dental Care Baja Oeste",
    "Gardenia Dental Practice",
    "Mision Smile and Care",
    "Central Avenue Dental Clinic",
    "Reliable Dental Group MX",
    "Golden Bridge Dental",
    "Point Loma Baja Dental",
  ];

  const usedSlugs = new Map();

  const generatedClinics = names.map((name, index) => {
    const baseSlug = slugify(name);
    const collisionCount = usedSlugs.get(baseSlug) ?? 0;
    usedSlugs.set(baseSlug, collisionCount + 1);
    const slug =
      collisionCount === 0 ? baseSlug : `${baseSlug}-${collisionCount + 1}`;

    return {
      name,
      slug,
      addressLine1: `${100 + index} Avenida Revolucion`,
      city: "Tijuana",
      state: "BC",
      country: "MX",
      phone: `+52-664-555-${String(1000 + index)}`,
      whatsapp: `+52-664-777-${String(1000 + index)}`,
      websiteUrl: index === 0 ? "/__e2e__/target" : `https://www.${slug}.example`,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name)}`,
      yelpUrl: `https://www.yelp.com/biz/${slug}`,
      isPublished: true,
    };
  });

  return [...generatedClinics, { ...KNOWN_E2E_IMPLANTS_CLINIC, isPublished: computeIsPublished(KNOWN_E2E_IMPLANTS_CLINIC) }];
}

async function main() {
  const neighborhoods = await Promise.all(
    TAXONOMY_NEIGHBORHOODS.map((neighborhood) =>
      prisma.neighborhood.upsert({
        where: {
          slug: neighborhood.slug,
        },
        update: neighborhood,
        create: neighborhood,
        select: {
          id: true,
          slug: true,
        },
      }),
    ),
  );

  const procedures = await Promise.all(
    TAXONOMY_PROCEDURES.map((procedure) =>
      prisma.procedure.upsert({
        where: {
          slug: procedure.slug,
        },
        update: procedure,
        create: procedure,
        select: {
          id: true,
          slug: true,
        },
      }),
    ),
  );

  const clinics = toSeedClinics();
  const zonaRioNeighborhood = neighborhoods.find((neighborhood) => neighborhood.slug === "zona-rio");
  const dentalImplantsIndex = procedures.findIndex((procedure) => procedure.slug === "dental-implants");

  const savedClinics = await Promise.all(
    clinics.map((clinic, index) =>
      prisma.clinic.upsert({
        where: { slug: clinic.slug },
        update: {
          ...clinic,
          neighborhoodId:
            clinic.slug === KNOWN_E2E_IMPLANTS_CLINIC.slug && zonaRioNeighborhood
              ? zonaRioNeighborhood.id
              : neighborhoods[index % neighborhoods.length].id,
        },
        create: {
          ...clinic,
          neighborhoodId:
            clinic.slug === KNOWN_E2E_IMPLANTS_CLINIC.slug && zonaRioNeighborhood
              ? zonaRioNeighborhood.id
              : neighborhoods[index % neighborhoods.length].id,
        },
        select: {
          id: true,
          slug: true,
        },
      }),
    ),
  );

  const clinicIds = savedClinics.map((clinic) => clinic.id);

  await prisma.clinicProcedure.deleteMany({
    where: {
      clinicId: {
        in: clinicIds,
      },
    },
  });

  const clinicProcedureRows = savedClinics.flatMap((clinic, index) => {
    const procedureIndexes =
      clinic.slug === KNOWN_E2E_IMPLANTS_CLINIC.slug && dentalImplantsIndex >= 0
        ? [dentalImplantsIndex, (dentalImplantsIndex + 1) % procedures.length]
        : [
            index % procedures.length,
            (index + 1) % procedures.length,
            ...(index % 2 === 0 ? [(index + 2) % procedures.length] : []),
          ];

    const uniqueProcedureIndexes = [...new Set(procedureIndexes)];

    return uniqueProcedureIndexes.map((procedureIndex) => ({
      clinicId: clinic.id,
      procedureId: procedures[procedureIndex].id,
    }));
  });

  await prisma.clinicProcedure.createMany({
    data: clinicProcedureRows,
    skipDuplicates: true,
  });

  console.log(`Seeded ${clinics.length} clinics`);
  console.log(`Seeded ${neighborhoods.length} neighborhoods and ${procedures.length} procedures`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

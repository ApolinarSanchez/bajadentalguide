/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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

  return names.map((name, index) => {
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
      websiteUrl: `https://www.${slug}.example`,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name)}`,
      yelpUrl: `https://www.yelp.com/biz/${slug}`,
    };
  });
}

async function main() {
  const clinics = toSeedClinics();

  await Promise.all(
    clinics.map((clinic) =>
      prisma.clinic.upsert({
        where: { slug: clinic.slug },
        update: clinic,
        create: clinic,
      }),
    ),
  );

  console.log(`Seeded ${clinics.length} clinics`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

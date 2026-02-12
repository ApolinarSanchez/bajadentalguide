import Link from "next/link";

const placeholderClinics = [
  { name: "Clinic One (Placeholder)", slug: "clinic-one" },
  { name: "Clinic Two (Placeholder)", slug: "clinic-two" },
  { name: "Clinic Three (Placeholder)", slug: "clinic-three" },
];

export default function ClinicsPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Clinics</h1>
      <p>Placeholder list of clinics.</p>
      <ul>
        {placeholderClinics.map((clinic) => (
          <li key={clinic.slug}>
            <Link href={`/clinics/${clinic.slug}`}>{clinic.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

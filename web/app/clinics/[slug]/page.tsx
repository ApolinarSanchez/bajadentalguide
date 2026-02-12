type ClinicProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ClinicProfilePage({
  params,
}: ClinicProfilePageProps) {
  const { slug } = await params;

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Clinic Profile</h1>
      <p>Placeholder clinic profile page.</p>
      <p>Slug: {slug}</p>
    </main>
  );
}

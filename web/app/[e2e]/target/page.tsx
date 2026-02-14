import OutboundTargetPage from "@/app/__e2e__/target/page";
import { notFound } from "next/navigation";

type E2eTargetAdapterPageProps = {
  params: Promise<{
    e2e: string;
  }>;
};

export default async function E2eTargetAdapterPage({
  params,
}: E2eTargetAdapterPageProps) {
  const { e2e } = await params;
  if (e2e !== "__e2e__") {
    notFound();
  }

  return <OutboundTargetPage />;
}

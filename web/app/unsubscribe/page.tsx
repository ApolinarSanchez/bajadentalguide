import { unsubscribeSessionByToken } from "@/lib/email/service";

export const dynamic = "force-dynamic";

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await searchParams;
  let message = "We could not verify your unsubscribe token.";

  if (token) {
    const result = await unsubscribeSessionByToken(token);
    if (result.ok) {
      message = "You have been unsubscribed from reminders.";
    } else if (result.status === 404) {
      message = "This unsubscribe token is not valid.";
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Unsubscribe</h1>
      <p>{message}</p>
    </main>
  );
}

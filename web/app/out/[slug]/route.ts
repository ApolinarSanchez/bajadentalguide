import { isOutboundDestination, logOutboundClick } from "@/lib/events/logOutboundClick";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type OutboundRouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

function notFoundResponse() {
  return new NextResponse("Not found", {
    status: 404,
  });
}

export async function GET(request: Request, { params }: OutboundRouteParams) {
  const { slug } = await params;
  const requestUrl = new URL(request.url);
  const destParam = requestUrl.searchParams.get("dest");

  if (!destParam || !isOutboundDestination(destParam)) {
    return notFoundResponse();
  }

  const sessionId = (await cookies()).get("bdg_session")?.value;

  const tracked = await logOutboundClick({
    slug,
    dest: destParam,
    sessionId,
  });

  if (!tracked) {
    return notFoundResponse();
  }

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(tracked.destination, request.url);
  } catch {
    return notFoundResponse();
  }

  return NextResponse.redirect(redirectUrl, 302);
}

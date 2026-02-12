import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "bdg_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="admin", charset="UTF-8"',
    },
  });
}

function parseBasicAuth(authHeader: string): { user: string; pass: string } | null {
  if (!authHeader.startsWith("Basic ")) {
    return null;
  }

  const encoded = authHeader.slice(6).trim();
  if (!encoded) {
    return null;
  }

  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return null;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) {
    return null;
  }

  return {
    user: decoded.slice(0, separator),
    pass: decoded.slice(separator + 1),
  };
}

function withSessionCookie(request: NextRequest, response: NextResponse) {
  const hasSession = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (hasSession) {
    return response;
  }

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: crypto.randomUUID(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) {
    return withSessionCookie(request, NextResponse.next());
  }

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (!expectedUser || !expectedPass) {
    return withSessionCookie(request, unauthorized());
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return withSessionCookie(request, unauthorized());
  }

  const credentials = parseBasicAuth(authorization);
  if (!credentials) {
    return withSessionCookie(request, unauthorized());
  }

  if (credentials.user !== expectedUser || credentials.pass !== expectedPass) {
    return withSessionCookie(request, unauthorized());
  }

  return withSessionCookie(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

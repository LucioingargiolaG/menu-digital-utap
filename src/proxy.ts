// Proxy (antes "middleware") de Next.js 16.
// Protege todo /admin: si no hay sesión válida redirige al login.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  const isLoginPage = pathname === "/admin/login";

  // Sin sesión → al login (el QR del cliente nunca pasa por acá)
  if (!session && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión, el login no tiene sentido → al panel
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

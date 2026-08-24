// Proxy (antes "middleware") de Next.js 16.
// Protege el panel (ruta secreta, ver src/lib/admin-path.ts):
// si no hay sesión válida redirige al login.
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PATH } from "@/lib/admin-path";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  const isLoginPage = pathname === `${ADMIN_PATH}/login`;

  // Sin sesión → al login (el QR del cliente nunca pasa por acá)
  if (!session && !isLoginPage) {
    const loginUrl = new URL(`${ADMIN_PATH}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión, el login no tiene sentido → al panel
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_PATH, request.url));
  }

  return NextResponse.next();
}

// OJO: el matcher debe ser estático (lo parsea el compilador). Si cambiás
// ADMIN_PATH en src/lib/admin-path.ts, actualizalo también acá.
export const config = {
  matcher: ["/utap-gestion-admin/:path*"],
};

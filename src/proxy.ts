// Proxy (antes "middleware") de Next.js 16.
// Protege el panel (ruta secreta, ver src/lib/admin-path.ts):
// si no hay sesión válida redirige al login.
// También verifica rate limiting por cookie (funciona en serverless).
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PATH } from "@/lib/admin-path";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import {
  isBlockedCombined,
  verifyAttemptsCookie,
} from "@/lib/rate-limit";

const ATTEMPTS_COOKIE = "utap_login_attempts";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );
  const isLoginPage = pathname === `${ADMIN_PATH}/login`;

  // Anti fuerza bruta: si la cookie indica intentos fallidos, bloquear
  if (!session && !isLoginPage) {
    const cookieValue = request.cookies.get(ATTEMPTS_COOKIE)?.value;
    const cookieFailures = await verifyAttemptsCookie(cookieValue);

    if (cookieFailures.length > 0) {
      const blockedSecs = isBlockedCombined("proxy", cookieFailures);
      if (blockedSecs > 0) {
        // Redirigir al login con error de bloqueo
        const loginUrl = new URL(`${ADMIN_PATH}/login`, request.url);
        loginUrl.searchParams.set("blocked", "1");
        loginUrl.searchParams.set("secs", String(blockedSecs));
        return NextResponse.redirect(loginUrl);
      }
    }
  }

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

// Helpers de sesión del lado servidor (cookies httpOnly)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";
import { ADMIN_PATH } from "@/lib/admin-path";

// Lee la sesión actual desde la cookie httpOnly
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

// Crea la cookie de sesión (httpOnly, sameSite lax, secure en producción)
export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

// Elimina la cookie de sesión (logout)
export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Para páginas/acciones del panel: exige sesión o redirige al login
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(`${ADMIN_PATH}/login`);
  return session;
}

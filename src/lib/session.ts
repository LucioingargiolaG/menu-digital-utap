// Firma y verificación de JWT de sesión.
// Módulo "edge-safe": solo usa jose, sin dependencias de Node ni next/headers,
// para poder importarlo tanto desde el proxy como desde el servidor.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "utap_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type SessionPayload = { sub: string; username: string };

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  // En producción EXIGE un secreto configurado: sin él, la app no arranca.
  // Así nunca se firman sesiones con un valor débil por descuido.
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET no está definida. Configurala en las variables de entorno del servidor."
      );
    }
    // Fallback solo para desarrollo local
    return new TextEncoder().encode("dev-only-insecure-secret");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

// Devuelve la sesión si el token es válido, o null si no lo es / expiró
export async function verifySessionToken(
  token?: string
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.username !== "string") return null;
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

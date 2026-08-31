// Límite de intentos fallidos de login (anti fuerza bruta).
//
// Doble capa para funcionar en serverless (Vercel):
// 1. Map en memoria → rápido, pero es por instancia
// 2. Cookie firmada → persiste entre requests, funciona entre instancias
//
// La cookie almacena los timestamps de intentos fallidos cifrados.
// Si el atacante la borra, pierde los intentos previos (reset).
// Si la mantiene, el proxy la valida y bloquea.

import { SignJWT, jwtVerify } from "jose";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

// --- Memoria (capa rápida, por instancia) ---

const attempts = new Map<string, number[]>();

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function isBlocked(key: string): number {
  const now = Date.now();
  const timestamps = attempts.get(key);
  if (!timestamps) return 0;

  const fresh = prune(timestamps, now);
  if (fresh.length !== timestamps.length) {
    if (fresh.length === 0) attempts.delete(key);
    else attempts.set(key, fresh);
  }

  if (fresh.length < MAX_FAILURES) return 0;

  const oldest = Math.min(...fresh);
  return Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
}

export function registerFailure(key: string): void {
  const now = Date.now();
  if (attempts.size > 1000) {
    for (const [k, v] of attempts) {
      if (prune(v, now).length === 0) attempts.delete(k);
    }
  }
  const timestamps = prune(attempts.get(key) ?? [], now);
  timestamps.push(now);
  attempts.set(key, timestamps);
}

export function resetFailures(key: string): void {
  attempts.delete(key);
}

// --- Cookie (capa persistente, funciona en serverless) ---

function getCookieSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET no está definida.");
    }
    return new TextEncoder().encode("dev-only-insecure-secret");
  }
  return new TextEncoder().encode(secret);
}

export async function createAttemptsCookie(
  failures: number[]
): Promise<string> {
  const now = Date.now();
  // Solo guardo los últimos 15 minutos
  const fresh = prune(failures, now);
  return new SignJWT({ f: fresh })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Math.ceil(WINDOW_MS / 1000)}s`)
    .sign(getCookieSecret());
}

export async function verifyAttemptsCookie(
  cookie?: string
): Promise<number[]> {
  if (!cookie) return [];
  try {
    const { payload } = await jwtVerify(cookie, getCookieSecret());
    if (!Array.isArray(payload.f)) return [];
    return payload.f.filter((t): t is number => typeof t === "number");
  } catch {
    return [];
  }
}

// Función combinada: verifica AMBAS capas
export function isBlockedCombined(
  key: string,
  cookieFailures: number[]
): number {
  // Verificar memoria primero
  const memBlocked = isBlocked(key);
  if (memBlocked > 0) return memBlocked;

  // Verificar cookie
  const now = Date.now();
  const fresh = prune(cookieFailures, now);
  if (fresh.length < MAX_FAILURES) return 0;

  const oldest = Math.min(...fresh);
  return Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
}

export function registerFailureCombined(
  key: string,
  cookieFailures: number[]
): number[] {
  const now = Date.now();
  // Registrar en memoria
  registerFailure(key);
  // Registrar en cookie
  const fresh = prune(cookieFailures, now);
  fresh.push(now);
  return fresh;
}

export function resetFailuresCombined(key: string): void {
  resetFailures(key);
}

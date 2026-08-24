// Límite de intentos fallidos de login (anti fuerza bruta).
//
// Ventana deslizante en memoria: cada clave guarda los timestamps de sus
// fallos; si supera el máximo dentro de la ventana, se bloquea hasta que
// expire el fallo más viejo.
//
// Limitación conocida: en serverless (Vercel) la memoria es por instancia,
// así que un atacante con muchas requests simultáneas puede repartirse
// entre instancias. Igual sube muchísimo el costo de un ataque de fuerza
// bruta contra un panel de una sola cuenta.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

const attempts = new Map<string, number[]>();

function prune(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

export function isBlocked(key: string): number {
  // Devuelve los segundos restantes de bloqueo, o 0 si no está bloqueado
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

  // Higiene: si el mapa creció mucho (muchas IPs distintas), limpia claves viejas
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

// Subida y borrado de imágenes de productos en /public/uploads
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

type SaveResult = { ok: true; path: string } | { ok: false; error: string };

// Guarda un archivo de imagen y devuelve su ruta pública (/uploads/xxx)
export async function saveUpload(file: File): Promise<SaveResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Formato no permitido (usá JPG, PNG o WebP)." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "La imagen supera los 4 MB." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  // Nombre aleatorio para evitar colisiones y paths maliciosos
  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { ok: true, path: `/uploads/${filename}` };
}

// Borra una imagen previamente subida (best-effort)
export async function deleteUpload(publicPath?: string | null): Promise<void> {
  if (!publicPath) return;
  // Solo se permiten rutas dentro de /uploads
  if (!publicPath.startsWith("/uploads/")) return;

  const filename = path.basename(publicPath);
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // Si no existe o falla, seguimos: no es crítico
  }
}

"use server";

// Acciones del panel de administración.
// Todas exigen sesión (defensa en profundidad además del proxy).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  clearSessionCookie,
  requireSession,
  setSessionCookie,
} from "@/lib/auth";
import { deleteUpload, saveUpload } from "@/lib/images";
import { isBlocked, registerFailure, resetFailures } from "@/lib/rate-limit";
import { ADMIN_PATH } from "@/lib/admin-path";

export type ActionState = { error?: string; ok?: string };

const TIME_REGEX = /^(\d{1,2}):(\d{2})$/;

// Normaliza "9:5" / "09:05" → "09:05"; devuelve null si es inválido
function normalizeTime(raw: string): string | null {
  const match = TIME_REGEX.exec(raw.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Refresca el menú público y las listas del admin tras cada cambio
function revalidateMenu() {
  revalidatePath("/");
  revalidatePath(ADMIN_PATH);
}

/* ------------------------- Autenticación ------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Completá usuario y contraseña." };
  }

  // Anti fuerza bruta: bloqueo por IP tras varios intentos fallidos seguidos.
  // (x-forwarded-for puede traer una lista; la IP real es el primer valor)
  const forwardedFor = (await headers()).get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0].trim() || "unknown";
  const key = `login:${ip}`;

  const blockedSecs = isBlocked(key);
  if (blockedSecs > 0) {
    const mins = Math.max(1, Math.ceil(blockedSecs / 60));
    return {
      error: `Demasiados intentos fallidos. Probá de nuevo en ${mins} min.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { username } });

  // Comparación con hash bcrypt (nunca guardamos texto plano)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    registerFailure(key);
    return { error: "Usuario o contraseña incorrectos." };
  }

  resetFailures(key);
  await setSessionCookie({ sub: user.id, username: user.username });
  redirect(ADMIN_PATH);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect(`${ADMIN_PATH}/login`);
}

/* ----------------------------- Cuentas ---------------------------- */

// Alta de usuario del panel (hash bcrypt; nunca guardamos texto plano)
export async function createUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (username.length < 3) {
    return { error: "El nombre de usuario necesita al menos 3 caracteres." };
  }
  if (password.length < 8) {
    return { error: "La contraseña necesita al menos 8 caracteres." };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { username, passwordHash } });
  } catch {
    return { error: `Ya existe una cuenta "${username}".` };
  }

  revalidatePath(`${ADMIN_PATH}/cuentas`);
  return { ok: `Cuenta "${username}" creada. Ya puede entrar al panel.` };
}

// Baja de usuario: revoca el acceso de inmediato
export async function deleteUserAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // No te podés eliminar a vos mismo (te quedarías afuera sin querer)
  if (id === session.sub) return;

  // Siempre tiene que quedar al menos una cuenta con acceso
  const total = await prisma.user.count();
  if (total <= 1) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath(`${ADMIN_PATH}/cuentas`);
}

/* --------------------------- Productos --------------------------- */

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const priceRaw = Number(String(formData.get("price") ?? "").replace(",", "."));
  const orderRaw = Number(formData.get("order") ?? 0);
  const active = formData.get("active") !== null;
  const removeImage = formData.get("removeImage") === "true";
  const imageFile = formData.get("image");

  // Validaciones
  if (!name) return { error: "El nombre es obligatorio." };
  if (!Number.isFinite(priceRaw) || priceRaw < 0) {
    return { error: "El precio es inválido." };
  }
  if (!categoryId) return { error: "Elegí una categoría." };

  // Imagen nueva (opcional)
  let newImagePath: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    const saved = await saveUpload(imageFile);
    if (!saved.ok) return { error: saved.error };
    newImagePath = saved.path;
  }

  const data = {
    name,
    description,
    price: Math.round(priceRaw),
    categoryId,
    order: Number.isFinite(orderRaw) ? Math.round(orderRaw) : 0,
    active,
  };

  if (id) {
    // Edición
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return { error: "El producto no existe." };

    let imageUrl = existing.imageUrl;
    if (newImagePath) {
      // Reemplazo: borro la imagen anterior del disco
      await deleteUpload(existing.imageUrl);
      imageUrl = newImagePath;
    } else if (removeImage) {
      await deleteUpload(existing.imageUrl);
      imageUrl = null;
    }

    await prisma.product.update({ where: { id }, data: { ...data, imageUrl } });
  } else {
    // Creación
    await prisma.product.create({
      data: { ...data, imageUrl: newImagePath },
    });
  }

  revalidateMenu();
  redirect(ADMIN_PATH);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.delete({ where: { id } });
  await deleteUpload(product.imageUrl);
  revalidateMenu();
}

export async function toggleProductAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { active: !product.active },
  });
  revalidateMenu();
}

/* -------------------------- Categorías --------------------------- */

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const orderRaw = Number(formData.get("order") ?? 0);
  if (!name) return { error: "El nombre es obligatorio." };

  try {
    await prisma.category.create({
      data: {
        name,
        order: Number.isFinite(orderRaw) ? Math.round(orderRaw) : 0,
      },
    });
  } catch {
    return { error: "Ya existe una categoría con ese nombre." };
  }

  revalidateMenu();
  revalidatePath(`${ADMIN_PATH}/categorias`);
  return {};
}

export async function updateCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const orderRaw = Number(formData.get("order") ?? 0);
  const active = formData.get("active") !== null;

  if (!id) return { error: "Categoría inválida." };
  if (!name) return { error: "El nombre es obligatorio." };

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        order: Number.isFinite(orderRaw) ? Math.round(orderRaw) : 0,
        active,
      },
    });
  } catch {
    return { error: "Ya existe una categoría con ese nombre." };
  }

  revalidateMenu();
  revalidatePath(`${ADMIN_PATH}/categorias`);
  return {};
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Borra la categoría y sus productos (cascade configurado en el schema)
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });
  if (!category) return;

  await prisma.category.delete({ where: { id } });
  // Limpia las imágenes de los productos borrados
  await Promise.all(category.products.map((p) => deleteUpload(p.imageUrl)));

  revalidateMenu();
  revalidatePath(`${ADMIN_PATH}/categorias`);
}

/* ------------------------- Configuración ------------------------- */

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  const orderUrl = String(formData.get("orderUrl") ?? "").trim();
  const scheduleEnabled = formData.get("scheduleEnabled") !== null;
  const forceClosed = formData.get("forceClosed") !== null;

  const openTime = normalizeTime(String(formData.get("openTime") ?? ""));
  const closeTime = normalizeTime(String(formData.get("closeTime") ?? ""));

  if (scheduleEnabled && (!openTime || !closeTime)) {
    return { error: "Horarios inválidos (usá formato HH:MM)." };
  }

  await prisma.settings.upsert({
    where: { key: "global" },
    update: {
      orderUrl,
      scheduleEnabled,
      forceClosed,
      openTime: openTime ?? "11:00",
      closeTime: closeTime ?? "23:30",
    },
    create: {
      key: "global",
      orderUrl,
      scheduleEnabled,
      forceClosed,
      openTime: openTime ?? "11:00",
      closeTime: closeTime ?? "23:30",
    },
  });

  revalidateMenu();
  revalidatePath(`${ADMIN_PATH}/configuracion`);
  return {};
}

import { prisma } from "@/lib/db";
import { MenuView, type MenuCategory, type MenuItem } from "@/components/menu/menu-view";
import Link from "next/link";

/*
 * MENÚ PÚBLICO (lo que ve el cliente al escanear el QR).
 *
 * Arquitectura pensada para velocidad:
 * - Server Component: consulta la base directamente (sin API intermedia).
 * - ISR con revalidate = 30: el HTML se sirve cacheado → carga casi
 *   instantánea en cada escaneo. Los cambios del panel admin invalidan
 *   la caché al instante vía revalidatePath.
 * - Si la base no responde, se muestra el menú vacío en vez de un error;
 *   la ISR reintenta sola en el próximo ciclo.
 */

// ISR: ventana de revalidación del HTML cacheado (30 segundos)
export const revalidate = 30;

async function getCategories() {
  return prisma.category.findMany({
    where: { active: true }, // solo categorías visibles
    orderBy: { order: "asc" },
  });
}

async function getProducts() {
  return prisma.product.findMany({
    where: { active: true }, // solo productos activos
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

async function getSettings() {
  // Fila única de configuración (key fija "global")
  return prisma.settings.findUnique({ where: { key: "global" } });
}

export default async function HomePage() {
  // Consultas en paralelo para minimizar la latencia total
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let settings: Awaited<ReturnType<typeof getSettings>> = null;

  try {
    [categories, products, settings] = await Promise.all([
      getCategories(),
      getProducts(),
      getSettings(),
    ]);
  } catch {
    // Base caída: menú vacío temporal; la ISR reintenta automáticamente
  }

  // Configuración: solo se usa el link de pedidos en la vista pública
  const orderUrl = settings?.orderUrl ?? "";

  // DTOs planos y serializables para el componente cliente
  const menuCategories: MenuCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const menuItems: MenuItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    categoryId: p.categoryId,
  }));

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header: título centrado + botón "Hacer pedido" a la derecha */}
      <header className="border-b border-border/70 bg-background">
        <div className="relative mx-auto flex w-full max-w-xl items-center justify-center px-4 py-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Utap</h1>
          {orderUrl && (
            <Link
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-hover active:scale-[0.97]"
            >
              Hacer pedido
            </Link>
          )}
        </div>
      </header>

      {/* Columna única centrada: legible en móvil y elegante en desktop. */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-10 pt-4">
        <MenuView categories={menuCategories} products={menuItems} />
      </main>

      <footer className="mt-8 flex flex-col items-center gap-1.5 border-t border-border/50 pb-10 pt-5 text-center">
        <p className="text-xs font-semibold">Utap</p>
        <p className="text-[11px] text-muted-foreground/70">
          © 2026 · Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

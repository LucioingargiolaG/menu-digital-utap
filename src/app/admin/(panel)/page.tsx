import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata = { title: "Productos · Utap Admin" };

/*
 * Dashboard del panel: la vista más usada por el dueño.
 * Muestra todos los productos agrupados por categoría (respetando el
 * orden de cada uno) con acciones rápidas por fila:
 * - Switch → activar/desactivar (ocultar del menú sin borrar)
 * - Tacho  → eliminar (con confirmación, borra también la imagen)
 * - Lápiz  → editar en /admin/productos/[id]
 */
export default async function AdminProductsPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  const activeCount = products.filter((p) => p.active).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado + resumen */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} en total · {activeCount} activos ·{" "}
            {categories.length} categorías
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]"
        >
          <Plus className="size-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Productos por categoría */}
      {categories.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Primero creá una categoría en la pestaña{" "}
          <Link href="/admin/categorias" className="font-medium text-primary underline underline-offset-2">
            Categorías
          </Link>
          .
        </Card>
      ) : (
        categories.map((category) => {
          const items = products.filter((p) => p.categoryId === category.id);
          return (
            <section key={category.id}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {category.name}
                </h2>
                {!category.active && (
                  <Badge variant="muted">Categoría oculta</Badge>
                )}
              </div>

              <Card className="mt-2 divide-y divide-border overflow-hidden">
                {items.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    Sin productos todavía.
                  </p>
                ) : (
                  items.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt=""
                          width={44}
                          height={44}
                          sizes="44px"
                          className="size-11 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="size-11 shrink-0 rounded-lg bg-muted" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <ProductRowActions
                        id={product.id}
                        name={product.name}
                        active={product.active}
                      />

                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        aria-label={`Editar ${product.name}`}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </div>
                  ))
                )}
              </Card>
            </section>
          );
        })
      )}
    </div>
  );
}

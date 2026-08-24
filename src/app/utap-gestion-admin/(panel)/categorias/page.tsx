import { prisma } from "@/lib/db";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Categorías · Utap Admin" };

// Página de gestión de categorías
export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">Categorías</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Definen las secciones del menú y su orden de aparición.
      </p>

      <div className="mt-6">
        <CategoryManager
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            order: c.order,
            active: c.active,
            productCount: c._count.products,
          }))}
        />
      </div>
    </div>
  );
}

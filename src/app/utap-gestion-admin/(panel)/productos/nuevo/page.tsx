import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { ADMIN_PATH } from "@/lib/admin-path";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Nuevo producto · Utap Admin" };

// Alta de producto nuevo
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={ADMIN_PATH}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a productos
      </Link>
      <h1 className="mt-3 text-xl font-bold">Nuevo producto</h1>

      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}

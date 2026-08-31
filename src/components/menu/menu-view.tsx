"use client";

/*
 * Vista interactiva del menú público de Utap.
 *
 * Es un Client Component porque filtra en memoria (categorías)
 * sin pedir nada al servidor: los datos ya llegan serializados desde la
 * página (Server Component), así el filtrado es instantáneo.
 *
 * Prioridad de diseño: que la gente VEA el menú en el local.
 * Sin modos de pedido ni pasos extra: solo mirar, y si quieren pedir,
 * el botón "Hacer pedido" los lleva al sistema existente.
 */
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";

export type MenuCategory = { id: string; name: string };
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: string;
};

export function MenuView({
  categories,
  products,
}: {
  categories: MenuCategory[];
  products: MenuItem[];
}) {
  const [loaded, setLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 350);
    return () => clearTimeout(t);
  }, []);

  // Filtrado en memoria: sin red, sin esperas. Se recalcula solo si
  // cambian los productos o la categoría seleccionada.
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "all" && p.categoryId !== activeCategory) return false;
      return true;
    });
  }, [products, activeCategory]);

  // Agrupa los productos visibles por categoría respetando el orden
  // definido en el panel (las categorías vacías no se muestran).
  const sections = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        items: filtered.filter((p) => p.categoryId === cat.id),
      }))
      .filter((s) => s.items.length > 0);
  }, [categories, filtered]);

  let cardIndex = 0; // para escalonar las animaciones de entrada

  return (
    <div>
      {/* Overlay spinner: círculo rojo girando mientras carga la primera vez */}
      {!loaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-sm text-muted-foreground">Cargando menú…</p>
          </div>
        </div>
      )}

      {/* Categorías horizontales (scroll lateral sin scrollbar visible).
          touch-pan-x + overscroll-x-contain: el gesto sobre los chips queda
          aislado → deslizar el carrusel no scrollea ni mueve la página. */}
      <nav
        aria-label="Categorías"
        className="scrollbar-none touch-pan-x overscroll-x-contain -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        <CategoryChip
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        >
          Todas
        </CategoryChip>
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() =>
              setActiveCategory(activeCategory === cat.id ? "all" : cat.id)
            }
          >
            {/* "Hamburguesas Simples" → "Simples": chips más cortos */}
            {cat.name.replace("Hamburguesas ", "")}
          </CategoryChip>
        ))}
      </nav>

      {/* Secciones de productos */}
      {sections.length === 0 ? (
        // Estado vacío: sin productos activos publicados
        <div className="animate-fade-in-up mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            No hay productos para mostrar por ahora.
          </p>
        </div>
      ) : (
        sections.map(({ category, items }) => (
          <section key={category.id} className="mt-7">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {category.name}
            </h2>
            <div className="mt-3 flex flex-col gap-3">
              {items.map((item) => {
                // Entrada escalonada: cada card aparece 40ms después
                // (tope 240ms para que el menú completo se vea rápido)
                const delay = Math.min(cardIndex * 40, 240);
                cardIndex += 1;
                return (
                  <ProductCard
                    key={item.id}
                    item={item}
                    style={{ animationDelay: `${delay}ms` }}
                  />
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

// Chip de categoría (filtro horizontal)
function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/*
 * Card del producto.
 * Regla de diseño: si el producto NO tiene imagen, se muestra solo texto
 * (nombre + descripción + precio). Sin placeholders ni íconos: más limpio.
 */
function ProductCard({
  item,
  style,
}: {
  item: MenuItem;
  style?: React.CSSProperties;
}) {
  return (
    <article
      style={style}
      className="animate-fade-in-up flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug">{item.name}</h3>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
        {/* Precio siempre en rojo, formato argentino ($14.000,00) */}
        <p className="mt-2 font-bold text-primary">{formatPrice(item.price)}</p>
      </div>

      {/* Imagen lazy: next/image la convierte a WebP automáticamente */}
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={88}
          height={88}
          sizes="88px"
          loading="lazy"
          className="size-[88px] shrink-0 rounded-xl object-cover"
        />
      )}
    </article>
  );
}

"use client";

// Navegación del panel con estado activo
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_PATH } from "@/lib/admin-path";
import { cn } from "@/lib/utils";

const links = [
  { href: ADMIN_PATH, label: "Productos" },
  { href: `${ADMIN_PATH}/categorias`, label: "Categorías" },
  { href: `${ADMIN_PATH}/configuracion`, label: "Configuración" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto pb-2">
      {links.map((link) => {
        const active =
          link.href === ADMIN_PATH
            ? pathname === ADMIN_PATH
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

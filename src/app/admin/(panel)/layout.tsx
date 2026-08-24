// El panel siempre es dinámico: depende de cookies de sesión
export const dynamic = "force-dynamic";

// Layout del panel: exige sesión y dibuja el shell (topbar + nav)
import { ExternalLink, LogOut } from "lucide-react";
import { Toaster } from "sonner";
import { requireSession } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad: además del proxy, el layout valida la sesión
  const session = await requireSession();

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 pt-3">
          <div className="flex h-10 items-center justify-between gap-3">
            <span className="text-lg font-extrabold tracking-tight">
              Utap{" "}
              <span className="font-medium text-muted-foreground">Admin</span>
            </span>
            <div className="flex items-center gap-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                Ver menú
              </a>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="size-3.5" />
                  Salir
                </Button>
              </form>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-6">{children}</main>

      <footer className="pb-6 text-center text-xs text-muted-foreground/70">
        Conectado como {session.username}
      </footer>

      <Toaster richColors position="top-center" />
    </div>
  );
}

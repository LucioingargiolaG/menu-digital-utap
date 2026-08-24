import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Configuración · Utap Admin" };

// Página de configuración general
export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({
    where: { key: "global" },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">Configuración</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Preferencias generales del menú público.
      </p>

      <div className="mt-6">
        <SettingsForm
          settings={{
            orderUrl: settings?.orderUrl ?? "",
            scheduleEnabled: settings?.scheduleEnabled ?? true,
            openTime: settings?.openTime ?? "11:00",
            closeTime: settings?.closeTime ?? "23:30",
            forceClosed: settings?.forceClosed ?? false,
          }}
        />
      </div>

      {/* Nota sobre el QR */}
      <div className="mt-8 rounded-2xl border border-border bg-muted/60 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Sobre el código QR</p>
        <p className="mt-1">
          El QR de las mesas debe apuntar a la raíz del sitio (ej:{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs">
            https://tu-dominio.com/
          </code>
          ). Nunca apunta a /admin: esa ruta solo es accesible con usuario y
          contraseña.
        </p>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DEV_USERNAME } from "@/lib/admin-path";
import { AccountManager } from "@/components/admin/account-manager";

export const metadata = { title: "Cuentas · Utap Admin" };

// Página de gestión de cuentas del panel
export default async function AccountsPage() {
  const [users, session] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getSession(),
  ]);

  // La cuenta de desarrollo no se lista: nadie desde el panel
  // puede revocarla o resetearle la contraseña.
  const visibleUsers = users.filter((u) => u.username !== DEV_USERNAME);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">Cuentas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Quiénes pueden entrar al panel. Eliminar una cuenta revoca su acceso de
        inmediato.
      </p>

      <div className="mt-6">
        <AccountManager
          users={visibleUsers.map((u) => ({
            id: u.id,
            username: u.username,
            isCurrentUser: u.id === session?.sub,
          }))}
        />
      </div>
    </div>
  );
}

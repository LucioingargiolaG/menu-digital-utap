import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { AccountManager } from "@/components/admin/account-manager";

export const metadata = { title: "Cuentas · Utap Admin" };

// Página de gestión de cuentas del panel
export default async function AccountsPage() {
  const [users, session] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getSession(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">Cuentas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Quiénes pueden entrar al panel. Eliminar una cuenta revoca su acceso de
        inmediato.
      </p>

      <div className="mt-6">
        <AccountManager
          users={users.map((u) => ({
            id: u.id,
            username: u.username,
            isCurrentUser: u.id === session?.sub,
          }))}
        />
      </div>
    </div>
  );
}

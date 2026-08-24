"use client";

// Gestión de cuentas del panel: alta y baja (revocar acceso)
import { useActionState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import {
  createUserAction,
  deleteUserAction,
  type ActionState,
} from "@/app/utap-gestion-admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export type AccountRow = {
  id: string;
  username: string;
  isCurrentUser: boolean;
};

export function AccountManager({ users }: { users: AccountRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      <CreateForm />

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
      {error}
    </p>
  );
}

function CreateForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft"
    >
      <div className="w-full sm:w-auto sm:min-w-40 sm:flex-1">
        <label className="mb-1 block text-sm font-medium">Nueva cuenta</label>
        <Input name="username" required placeholder="Usuario" minLength={3} />
      </div>
      <div className="w-full sm:w-auto sm:min-w-40 sm:flex-1">
        <label className="mb-1 block text-sm font-medium">Contraseña</label>
        <Input
          name="password"
          type="password"
          required
          placeholder="Mínimo 8 caracteres"
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={pending}>
        <UserPlus className="size-4" />
        {pending ? "Creando..." : "Crear cuenta"}
      </Button>
      <div className="w-full flex flex-col gap-2">
        <ErrorText error={state.error} />
        {state.ok && (
          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.ok}
          </p>
        )}
      </div>
    </form>
  );
}

function UserRow({ user }: { user: AccountRow }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {user.username}
            {user.isCurrentUser && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (tu cuenta)
              </span>
            )}
          </p>
        </div>

        {/* La propia cuenta no se puede eliminar desde acá */}
        {!user.isCurrentUser && (
          <form
            action={deleteUserAction}
            onSubmit={(e) => {
              if (!confirm(`¿Eliminar la cuenta "${user.username}"? Ya no podrá entrar al panel.`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={user.id} />
            <button
              type="submit"
              aria-label={`Eliminar ${user.username}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-3.5" />
              Revocar acceso
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

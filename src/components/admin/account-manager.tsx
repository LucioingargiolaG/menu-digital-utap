"use client";

// Gestión de cuentas del panel: alta, baja (revocar acceso)
// y cambio de contraseñas (propia y de otras cuentas).
import { useEffect, useRef, useActionState } from "react";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import {
  createUserAction,
  deleteUserAction,
  changeOwnPasswordAction,
  resetUserPasswordAction,
  type ActionState,
} from "@/app/utap-gestion-admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

// Limpia el formulario cuando la acción termina bien
function useFormReset<T>(state: T & { ok?: string }) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);
  return ref;
}

export type AccountRow = {
  id: string;
  username: string;
  isCurrentUser: boolean;
};

export function AccountManager({ users }: { users: AccountRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      <OwnPasswordForm />

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

function OkText({ ok }: { ok?: string }) {
  if (!ok) return null;
  return (
    <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
      {ok}
    </p>
  );
}

function OwnPasswordForm() {
  const [state, formAction, pending] = useActionState(
    changeOwnPasswordAction,
    initialState
  );
  const formRef = useFormReset(state);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft"
    >
      <div className="w-full sm:w-auto sm:min-w-40 sm:flex-1">
        <label className="mb-1 block text-sm font-medium">Tu contraseña</label>
        <Input
          name="currentPassword"
          type="password"
          required
          placeholder="Contraseña actual"
        />
      </div>
      <div className="w-full sm:w-auto sm:min-w-40 sm:flex-1">
        <label className="mb-1 block text-sm font-medium">&nbsp;</label>
        <Input
          name="newPassword"
          type="password"
          required
          placeholder="Nueva contraseña"
          minLength={8}
        />
      </div>
      <Button type="submit" variant="outline" disabled={pending}>
        <KeyRound className="size-4" />
        {pending ? "..." : "Cambiar"}
      </Button>
      <div className="w-full flex flex-col gap-2">
        <ErrorText error={state.error} />
        <OkText ok={state.ok} />
      </div>
    </form>
  );
}

function CreateForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialState
  );
  const formRef = useFormReset(state);

  return (
    <form
      ref={formRef}
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
  const [resetState, resetFormAction, resetting] = useActionState(
    resetUserPasswordAction,
    initialState
  );
  const resetFormRef = useFormReset(resetState);

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

      {/* Reset de contraseña para otras cuentas */}
      {!user.isCurrentUser && (
        <details className="mt-3">
          <summary className="cursor-pointer select-none text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Cambiar contraseña
          </summary>
          <form ref={resetFormRef} action={resetFormAction} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={user.id} />
            <div className="w-full sm:w-auto sm:min-w-40 sm:flex-1">
              <Input
                name="newPassword"
                type="password"
                required
                placeholder="Nueva contraseña"
                minLength={8}
              />
            </div>
            <Button type="submit" variant="outline" disabled={resetting}>
              <KeyRound className="size-4" />
              {resetting ? "..." : "Actualizar"}
            </Button>
            <div className="w-full flex flex-col gap-2">
              <ErrorText error={resetState.error} />
              <OkText ok={resetState.ok} />
            </div>
          </form>
        </details>
      )}
    </div>
  );
}

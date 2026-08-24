"use client";

// Gestión de categorías: alta, edición inline y baja
import { useActionState } from "react";
import { Save, Trash2 } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type ActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export type CategoryRow = {
  id: string;
  name: string;
  order: number;
  active: boolean;
  productCount: number;
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Alta de categoría */}
      <CreateForm />

      {/* Lista editable */}
      <div className="flex flex-col gap-3">
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay categorías.
          </p>
        )}
        {categories.map((category) => (
          <CategoryRowForm key={category.id} category={category} />
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
    createCategoryAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft"
    >
      {/* En celular el nombre va en fila propia; desde sm comparte línea */}
      <div className="w-full sm:w-auto sm:min-w-48 sm:flex-1">
        <label className="mb-1 block text-sm font-medium">Nueva categoría</label>
        <Input name="name" required placeholder="Ej: Bebidas" />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-sm font-medium">Orden</label>
        <Input name="order" type="number" defaultValue={0} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Agregar"}
      </Button>
      <div className="w-full">
        <ErrorText error={state.error} />
      </div>
    </form>
  );
}

function CategoryRowForm({ category }: { category: CategoryRow }) {
  const [state, formAction, pending] = useActionState(
    updateCategoryAction,
    initialState
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="id" value={category.id} />

        {/* En celular el nombre va en fila propia para no apretar la fila */}
        <div className="w-full sm:w-auto sm:min-w-40 sm:flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Nombre ({category.productCount} productos)
          </label>
          <Input name="name" defaultValue={category.name} required />
        </div>

        <div className="w-20">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Orden
          </label>
          <Input name="order" type="number" defaultValue={category.order} />
        </div>

        <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="active"
            defaultChecked={category.active}
            className="size-4 accent-red-600"
          />
          Visible
        </label>

        <Button type="submit" variant="outline" disabled={pending}>
          <Save className="size-4" />
          {pending ? "..." : "Guardar"}
        </Button>
      </form>

      <div className="mt-2 flex items-center justify-between gap-3">
        <ErrorText error={state.error} />
        {/* Baja: elimina también sus productos */}
        <form
          action={deleteCategoryAction}
          onSubmit={(e) => {
            const msg =
              category.productCount > 0
                ? `"${category.name}" tiene ${category.productCount} productos. Se ELIMINARÁN juntos. ¿Continuar?`
                : `¿Eliminar la categoría "${category.name}"?`;
            if (!confirm(msg)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={category.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="size-3.5" />
            Eliminar categoría
          </button>
        </form>
      </div>
    </div>
  );
}

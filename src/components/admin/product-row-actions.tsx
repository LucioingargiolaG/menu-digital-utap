"use client";

// Acciones por fila: activar/desactivar y eliminar (con confirmación)
import { Trash2 } from "lucide-react";
import {
  deleteProductAction,
  toggleProductAction,
} from "@/app/admin/actions";
import { Switch } from "@/components/ui/switch";

export function ProductRowActions({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {/* Activar/desactivar (no borra nada) */}
      <form action={toggleProductAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" aria-label={active ? "Desactivar" : "Activar"}>
          <Switch checked={active} onCheckedChange={() => {}} />
        </button>
      </form>

      {/* Eliminar con confirmación */}
      <form
        action={deleteProductAction}
        onSubmit={(e) => {
          if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          aria-label={`Eliminar ${name}`}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </form>
    </div>
  );
}

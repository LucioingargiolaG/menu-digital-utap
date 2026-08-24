"use client";

/*
 * Formulario de creación/edición de productos.
 *
 * Usa useActionState con la Server Action saveProductAction:
 * - El propio action valida y guarda; los errores vuelven por `state`.
 * - La imagen viaja dentro del mismo FormData (input type="file"),
 *   sin endpoint de subida aparte.
 *
 * Trucos de estado:
 * - `preview`: muestra la imagen nueva (object URL) o la actual.
 * - `removeImage` viaja como input hidden ("true"/"false") para que el
 *   servidor borre el archivo anterior si corresponde.
 * - `active` vive en un Switch visual + un checkbox hidden que es lo que
 *   realmente se envía al servidor.
 */
import { useActionState, useState } from "react";
import Image from "next/image";
import { saveProductAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const initialState: ActionState = {};

export type ProductFormData = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  order: number;
  active: boolean;
  imageUrl: string | null;
};

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductFormData;
}) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    initialState
  );

  const [preview, setPreview] = useState<string | null>(
    product?.imageUrl ?? null
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [active, setActive] = useState(product?.active ?? true);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Vista previa local instantánea (la subida real la hace el server action)
      setPreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="removeImage" value={String(removeImage)} />

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Ej: Classic Doble"
        />
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          placeholder="Ingredientes del producto..."
        />
      </div>

      {/* Precio + orden */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Precio ($) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.price}
            placeholder="14000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order">Orden</Label>
          <Input
            id="order"
            name="order"
            type="number"
            defaultValue={product?.order ?? 0}
          />
        </div>
      </div>

      {/* Categoría */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoryId">Categoría *</Label>
        <Select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? ""}
        >
          <option value="" disabled>
            Elegí una categoría
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Imagen opcional */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">Imagen (opcional)</Label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onFileChange}
          className="w-full cursor-pointer rounded-xl border border-border bg-surface p-2 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-border"
        />
        {preview && !removeImage && (
          <div className="mt-1 flex items-center gap-3">
            <Image
              src={preview}
              alt="Vista previa"
              width={72}
              height={72}
              unoptimized
              className="size-18 rounded-xl object-cover"
            />
            {product?.imageUrl && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => setRemoveImage(e.target.checked)}
                  className="accent-red-600"
                />
                Quitar imagen actual
              </label>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG o WebP · máx 4 MB. Sin imagen se muestra solo texto.
        </p>
      </div>

      {/* Activo */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-sm font-medium">Visible en el menú</p>
          <p className="text-xs text-muted-foreground">
            Los productos inactivos no se muestran a los clientes.
          </p>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
        {/* El switch nativo manda "on" cuando está activo */}
        <input type="checkbox" name="active" checked={active} hidden readOnly />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}

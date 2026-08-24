"use client";

// Formulario de configuración general: link de pedidos y horarios
import { useActionState, useState } from "react";
import { ExternalLink } from "lucide-react";
import { saveSettingsAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const initialState: ActionState = {};

export type SettingsData = {
  orderUrl: string;
  scheduleEnabled: boolean;
  openTime: string;
  closeTime: string;
  forceClosed: boolean;
};

export function SettingsForm({ settings }: { settings: SettingsData }) {
  const [state, formAction, pending] = useActionState(
    saveSettingsAction,
    initialState
  );

  const [scheduleEnabled, setScheduleEnabled] = useState(
    settings.scheduleEnabled
  );
  const [forceClosed, setForceClosed] = useState(settings.forceClosed);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Link al sistema de pedidos */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-semibold">Sistema de pedidos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El botón &ldquo;Pedir ahora&rdquo; del menú abre este link. Dejalo
          vacío para ocultar el botón.
        </p>
        <div className="mt-3">
          <Label htmlFor="orderUrl">Link del sistema de pedidos</Label>
          <Input
            id="orderUrl"
            name="orderUrl"
            type="url"
            defaultValue={settings.orderUrl}
            placeholder="https://pedidos.tu-sistema.com/utap"
            className="mt-1.5"
          />
        </div>
        {settings.orderUrl && (
          <a
            href={settings.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" />
            Probar link actual
          </a>
        )}
      </section>

      {/* Horarios */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="font-semibold">Disponibilidad del local</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Controla el estado &ldquo;Disponible / Cerrado&rdquo; que ven los
          clientes en el menú.
        </p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Cerrado manualmente</p>
            <p className="text-xs text-muted-foreground">
              Fuerza el estado &ldquo;Cerrado&rdquo; sin importar el horario.
              Útil para feriados.
            </p>
          </div>
          <Switch checked={forceClosed} onCheckedChange={setForceClosed} />
          <input
            type="checkbox"
            name="forceClosed"
            checked={forceClosed}
            hidden
            readOnly
          />
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Horario automático</p>
              <p className="text-xs text-muted-foreground">
                Abre y cierra solo según los horarios de abajo.
              </p>
            </div>
            <Switch
              checked={scheduleEnabled}
              onCheckedChange={setScheduleEnabled}
            />
            <input
              type="checkbox"
              name="scheduleEnabled"
              checked={scheduleEnabled}
              hidden
              readOnly
            />
          </div>

          {scheduleEnabled && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Apertura</Label>
                <Input
                  id="openTime"
                  name="openTime"
                  type="time"
                  defaultValue={settings.openTime}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="closeTime">Cierre</Label>
                <Input
                  id="closeTime"
                  name="closeTime"
                  type="time"
                  defaultValue={settings.closeTime}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  );
}

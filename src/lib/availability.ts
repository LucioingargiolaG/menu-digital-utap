// Cálculo de disponibilidad del local según horarios configurados
export type AvailabilitySettings = {
  scheduleEnabled: boolean;
  openTime: string;
  closeTime: string;
  forceClosed: boolean;
};

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Devuelve si el local está abierto en este momento
export function getAvailability(
  settings: AvailabilitySettings,
  now: Date = new Date()
): { isOpen: boolean } {
  if (settings.forceClosed) return { isOpen: false };
  if (!settings.scheduleEnabled) return { isOpen: true };

  const current = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(settings.openTime);
  const close = toMinutes(settings.closeTime);

  // Si cierra antes o igual que abre, la ventana cruza la medianoche
  const isOpen =
    close > open ? current >= open && current < close : current >= open || current < close;

  return { isOpen };
}

// Etiqueta legible del horario para el header
export function getScheduleLabel(settings: AvailabilitySettings): string {
  if (!settings.scheduleEnabled) return "Abierto todo el día";
  return `Todos los días · ${settings.openTime} a ${settings.closeTime}`;
}

// Spinner centrado (círculo girando) mientras carga el menú (primera visita)
export default function MenuLoading() {
  return (
    <div
      className="flex min-h-svh items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Cargando menú…</p>
      </div>
    </div>
  );
}

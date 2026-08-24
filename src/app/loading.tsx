import { Skeleton } from "@/components/ui/skeleton";

// Skeleton con shimmer mientras carga el menú (primera visita)
export default function MenuLoading() {
  return (
    <div className="flex min-h-svh flex-col" aria-busy="true" aria-live="polite">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-36 pt-4">
        {/* Selector modo */}
        <Skeleton className="h-12 w-full rounded-full" />

        {/* Búsqueda */}
        <Skeleton className="mt-4 h-11 w-full rounded-full" />

        {/* Categorías */}
        <div className="mt-4 flex gap-2 overflow-hidden">
          <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
          <Skeleton className="h-8 w-28 shrink-0 rounded-full" />
          <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
        </div>

        {/* Cards */}
        <div className="mt-7 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft"
            >
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="mt-2 h-3.5 w-4/5" />
                <Skeleton className="mt-3 h-4 w-20" />
              </div>
              <Skeleton className="size-[88px] shrink-0 rounded-xl" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

import { cn } from "@/lib/utils";

// Skeleton con shimmer para estados de carga
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("skeleton-shimmer rounded-xl", className)}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "muted" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-red-100 text-red-700",
};

// Etiqueta pequeña para estados (Disponible, Cerrado, etc.)
export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

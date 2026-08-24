import * as React from "react";
import { cn } from "@/lib/utils";

// Input de texto base
export function Input({
  className,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        // text-base (16px): debajo de ese tamaño iOS hace zoom al enfocar
        "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-foreground",
        "placeholder:text-muted-foreground/70 transition-colors duration-200",
        "focus-visible:border-primary focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

// Textarea base
export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-foreground",
        "placeholder:text-muted-foreground/70 transition-colors duration-200",
        "focus-visible:border-primary focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

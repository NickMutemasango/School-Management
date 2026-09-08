import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        secondary: "border-transparent bg-muted text-foreground",
        outline: "bg-background text-foreground",
        // Payment / enrollment / submission status tones. The dark pairs
        // follow the icon-chip convention used across the portals'
        // dashboards: a deep tinted ground with a light-400 label.
        success:
          "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
        danger:
          "border-transparent bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
        info: "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
        neutral:
          "border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

import { BRAND, WORDMARK_CLASS } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Copyright line closing the content well. Kept text-only so it prints
 * cleanly alongside the directory and invoice tables.
 */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mt-12 border-t border-slate-200 pt-6 pb-2 dark:border-slate-800",
        className
      )}
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span className={cn("text-slate-600 dark:text-slate-300", WORDMARK_CLASS)}>
          {BRAND.name}
        </span>
        <span aria-hidden className="text-slate-300 dark:text-slate-600">
          ·
        </span>
        <span>{BRAND.copyright}</span>
      </p>
    </footer>
  );
}

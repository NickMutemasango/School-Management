import type { ReactNode } from "react";

/** Card wrapper for a group of form fields. */
export function FormSection({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-background rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </header>

      <div className="p-5">{children}</div>

      {footer && (
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          {footer}
        </footer>
      )}
    </section>
  );
}

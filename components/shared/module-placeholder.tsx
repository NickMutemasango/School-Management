import type { LucideIcon } from "lucide-react";

/**
 * Standard page for nav destinations that exist in the sidebar but are out of
 * scope for this build. Keeps every link functional instead of 404-ing.
 */
export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1.5 text-slate-500 dark:text-slate-400">{description}</p>

      <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-20 text-center dark:border-slate-800">
        <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Icon className="size-6" />
        </div>
        <p className="mt-5 font-semibold">Not part of this build</p>
        <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Scope is limited to Student Management and Finance &amp; Accounting.
          This section is scaffolded so the navigation stays complete.
        </p>
      </div>
    </>
  );
}

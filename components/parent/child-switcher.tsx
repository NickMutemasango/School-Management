"use client";

import { usePathname } from "next/navigation";

import { cn, initials, avatarColorFor } from "@/lib/utils";
import { selectChild } from "@/app/parent/actions";
import type { ParentChild } from "@/lib/parent/children";

/** Only rendered when there's more than one linked child - a single child never needs a switcher. */
export function ChildSwitcher({ kids, selectedId }: { kids: ParentChild[]; selectedId: string | null }) {
  const pathname = usePathname();

  return (
    <div className="bg-muted mb-6 flex flex-wrap gap-1.5 rounded-xl p-1.5">
      {kids.map((child) => {
        const active = child.id === selectedId;
        const fullName = `${child.firstName} ${child.lastName}`;
        return (
          <form key={child.id} action={selectChild.bind(null, child.id, pathname)}>
            <button
              type="submit"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                  avatarColorFor(child.id)
                )}
              >
                {initials(fullName)}
              </span>
              {fullName}
            </button>
          </form>
        );
      })}
    </div>
  );
}

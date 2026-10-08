import { GraduationCap } from "lucide-react";

import { initials, avatarColorFor } from "@/lib/utils";
import { selectChild } from "@/app/parent/actions";
import type { ParentChild } from "@/lib/parent/children";

export function ChildPicker({ kids }: { kids: ParentChild[] }) {
  return (
    <div>
      <p className="text-muted-foreground mb-5 text-sm">Choose a child to view their portal.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kids.map((child) => {
          const fullName = `${child.firstName} ${child.lastName}`;
          return (
            <form key={child.id} action={selectChild.bind(null, child.id, "/parent")}>
              <button
                type="submit"
                className="bg-background flex w-full flex-col items-center gap-3 rounded-2xl border border-slate-200 p-6 text-center shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
              >
                <span
                  className={`grid size-14 place-items-center rounded-full text-lg font-bold ${avatarColorFor(child.id)}`}
                >
                  {initials(fullName)}
                </span>
                <div>
                  <p className="font-semibold">{fullName}</p>
                  <p className="text-muted-foreground mt-0.5 flex items-center justify-center gap-1.5 text-xs">
                    <GraduationCap className="size-3.5" />
                    {child.classLevel} &middot; {child.regNumber}
                  </p>
                </div>
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

import { Check, School } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ClassTeacherSubject } from "@/lib/students/classmates";
import { selectClassSubject } from "@/app/student/class/actions";

/** Soft radial glows, one per card, cycling by index - dark ground so white
 * text stays readable regardless of which color lands on a given card. */
const CARD_GRADIENTS = [
  "radial-gradient(130% 100% at 50% -10%, #1f3d33 0%, #14261f 45%, #0a1512 100%)",
  "radial-gradient(130% 100% at 50% -10%, #1f2b45 0%, #141b2d 45%, #0a0e18 100%)",
  "radial-gradient(130% 100% at 50% -10%, #3a2145 0%, #24162d 45%, #120b17 100%)",
  "radial-gradient(130% 100% at 50% -10%, #45311f 0%, #2d1f14 45%, #170f0a 100%)",
  "radial-gradient(130% 100% at 50% -10%, #45212b 0%, #2d151c 45%, #170b0e 100%)",
  "radial-gradient(130% 100% at 50% -10%, #1f3a45 0%, #14252d 45%, #0a1317 100%)",
];

interface SubjectCardsProps {
  teachers: ClassTeacherSubject[];
  selectedId: string | null;
}

/**
 * One large gradient card per subject the student takes - picking one sets
 * the "selected class" cookie (`selectClassSubject`) that scopes
 * Assignments/Class Notes and opens that subject's hub page. Lives on the
 * dashboard, under the stat grid.
 */
export function SubjectCards({ teachers, selectedId }: SubjectCardsProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-bold tracking-tight">Your Subjects</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pick a subject to see its assignments, notes, grades, and policies.
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="bg-background rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={School}
            title="No subjects assigned yet"
            description="An admin hasn't assigned any teachers to your class yet."
          />
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {teachers.map((subject, index) => {
            const isSelected = subject.id === selectedId;
            return (
              <li key={subject.id}>
                <form action={selectClassSubject.bind(null, subject.id)}>
                  <button
                    type="submit"
                    style={{ background: CARD_GRADIENTS[index % CARD_GRADIENTS.length] }}
                    className={cn(
                      "group relative flex min-h-[220px] w-full flex-col justify-between overflow-hidden rounded-3xl p-8 text-left shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl",
                      isSelected && "ring-2 ring-white/70 ring-offset-2 ring-offset-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                        <School className="size-6" aria-hidden />
                      </div>
                      {isSelected && (
                        <Badge className="shrink-0 border-transparent bg-white/15 text-white backdrop-blur-sm">
                          <Check className="size-3" aria-hidden />
                          Viewing
                        </Badge>
                      )}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                        {subject.subject}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-white/70">{subject.teacherName}</p>
                    </div>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

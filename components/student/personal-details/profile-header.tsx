import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

export function ProfileHeader({
  name,
  classLevel,
  regNumber,
}: {
  name: string;
  classLevel: string;
  regNumber: string;
}) {
  const signedIn = name.trim() !== "";

  return (
    <div className="bg-background mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 p-5 shadow-sm dark:border-slate-800">
      <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
        {signedIn ? initials(name) : "?"}
      </div>

      <div className="min-w-0">
        <p className="truncate text-lg font-bold tracking-tight">
          {signedIn ? name : "Student profile"}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {classLevel ? (
            <Badge variant="secondary">{classLevel}</Badge>
          ) : (
            <Badge variant="neutral">No class assigned</Badge>
          )}
          {regNumber ? (
            <Badge variant="neutral">{regNumber}</Badge>
          ) : (
            <Badge variant="neutral">No registration number</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

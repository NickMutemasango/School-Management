import { Building2 } from "lucide-react";

import { DepartmentGrid } from "@/components/admin/department-grid";
import { departments } from "@/lib/data/departments";

export default function AdminDepartmentsPage() {
  const count = departments.length;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-[34px]">
            Administration Portal
          </h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">
            Welcome! You have access to{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {count} departments
            </span>
            .
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-background px-4 py-2.5 text-sm font-medium shadow-sm dark:border-slate-800">
          <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
          {count} Departments Available
        </span>
      </div>

      <DepartmentGrid />
    </>
  );
}

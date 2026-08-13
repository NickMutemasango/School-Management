import type { LucideIcon } from "lucide-react";
import { Briefcase, GraduationCap } from "lucide-react";

export interface Department {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon tile. */
  tone: string;
}

/**
 * The two departments in scope for this build. Everything else from the wider
 * portal (HR, Academic Resources, Communication, Access & Security) is out of
 * scope and deliberately not listed.
 */
export const departments: Department[] = [
  {
    id: "dept_finance",
    name: "Finance & Accounting",
    description: "Manage financial operations, transactions, and accounting",
    href: "/admin/finance",
    icon: Briefcase,
    tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    id: "dept_students",
    name: "Student Management",
    description: "Student records, applications, and registry management",
    href: "/admin/students",
    icon: GraduationCap,
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
];

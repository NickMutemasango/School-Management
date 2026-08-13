import type { LucideIcon } from "lucide-react";
import { studentFullName, studentProfile } from "@/lib/data/student";
import { teacherProfile } from "@/lib/data/teacher";
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  House,
  IdCard,
  LayoutGrid,
  NotebookPen,
  ShieldCheck,
  Upload,
  Users,
  Wallet,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /**
   * Extra path prefixes that should keep this item highlighted. Department
   * module routes live under /admin/students and /admin/finance but are
   * reached from the Departments grid, so they light up "Departments".
   */
  activePrefixes?: string[];
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const adminNav: NavSection[] = [
  {
    label: "Main Menu",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: House },
      {
        title: "Departments",
        href: "/admin",
        icon: LayoutGrid,
        activePrefixes: ["/admin/students", "/admin/finance"],
      },
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { title: "Reports", href: "/admin/reports", icon: FileText },
    ],
  },
];

/** Placeholder navigation - the teacher portal is built out in a later step. */
export const teacherNav: NavSection[] = [
  {
    label: "Main Menu",
    items: [{ title: "Dashboard", href: "/teacher", icon: House }],
  },
  {
    label: "Teaching",
    items: [
      {
        title: "Class Notes",
        href: "/teacher/notes",
        icon: Upload,
        activePrefixes: ["/teacher/notes"],
      },
      {
        title: "End of Term Reports",
        href: "/teacher/reports",
        icon: FileText,
        activePrefixes: ["/teacher/reports"],
      },
      { title: "Timetable", href: "/teacher/schedule", icon: CalendarDays },
    ],
  },
];

export const studentNav: NavSection[] = [
  {
    label: "Main Menu",
    items: [
      { title: "Dashboard", href: "/student", icon: House },
      {
        title: "Personal Details",
        href: "/student/personal-details",
        icon: IdCard,
      },
    ],
  },
  {
    label: "My Learning",
    items: [
      {
        title: "Class Notes",
        href: "/student/notes",
        icon: BookOpen,
        activePrefixes: ["/student/notes"],
      },
      { title: "Results", href: "/student/results", icon: FileText },
      { title: "Fees", href: "/student/fees", icon: Wallet },
    ],
  },
];

export type PortalKey = "admin" | "teacher" | "student";

export interface PortalBrand {
  /** Wordmark shown beside the logo in the sidebar header. */
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

/**
 * Nav sections are looked up by key inside the client sidebar rather than
 * passed down as props - Lucide icons are functions and cannot cross the
 * server/client component boundary.
 */
export interface CurrentUser {
  name: string;
  email: string;
  role: string;
}

export const navByPortal: Record<
  PortalKey,
  { brand: PortalBrand; sections: NavSection[]; user: CurrentUser }
> = {
  admin: {
    brand: { title: "School Admin", subtitle: "Super Admin", icon: Building2 },
    sections: adminNav,
    user: {
      name: "Nick Genius",
      email: "nick.genius@school.admin",
      role: "Super Admin",
    },
  },
  teacher: {
    brand: { title: "School Admin", subtitle: "Teacher", icon: GraduationCap },
    sections: teacherNav,
    user: {
      name: teacherProfile.name,
      email: teacherProfile.email,
      role: teacherProfile.role,
    },
  },
  student: {
    brand: { title: "School Admin", subtitle: "Student", icon: ShieldCheck },
    sections: studentNav,
    user: {
      name: studentFullName,
      email: studentProfile.email,
      // The student's class stands in for a role, e.g. "FORM 4".
      role: studentProfile.classLevel,
    },
  },
};

/**
 * Signed-in user shown in the sidebar footer and header avatar.
 * Placeholder values until an auth provider is wired up - prefer
 * `navByPortal[portal].user` so each portal shows its own identity.
 */
export const currentUser: CurrentUser = navByPortal.admin.user;

/** Unread notification count on the header bell. */
export const notificationCount = 3;

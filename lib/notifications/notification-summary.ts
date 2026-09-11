import { createClient } from "@/lib/supabase/server";
import type { PortalKey } from "@/lib/navigation";

export interface NotificationItem {
  id: string;
  message: string;
  href: string;
}

export interface NotificationSummary {
  count: number;
  items: NotificationItem[];
  /** Where the "View all" link (and the bell itself, when there's nothing inline) points. */
  viewAllHref: string;
}

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ITEMS = 6;

/**
 * Live-computed, not persisted - there's no notifications table, so nothing
 * is markable "read". Items are just what currently needs attention: for
 * admins, pending staff approvals + classes with no teacher assigned
 * (mirrors /admin/dashboard); for teachers, class/subject assignments made
 * in the last 7 days.
 */
export async function getNotificationSummary(
  portal: PortalKey,
  userId: string
): Promise<NotificationSummary> {
  const supabase = await createClient();

  if (portal === "admin") {
    const [{ data: pendingStaff }, { data: classesData }, { data: assignmentsData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("status", "pending")
        .in("role", ["admin", "teacher"])
        .order("created_at", { ascending: false }),
      supabase.from("classes").select("id"),
      supabase.from("class_teacher_subjects").select("class_id"),
    ]);

    const pending = pendingStaff ?? [];
    const assignedClassIds = new Set((assignmentsData ?? []).map((a) => a.class_id));
    const classesWithoutTeacher = (classesData ?? []).filter(
      (c) => !assignedClassIds.has(c.id)
    ).length;

    const items: NotificationItem[] = pending.map((p) => ({
      id: p.id,
      message: `${p.full_name || p.email} is awaiting approval`,
      href: "/admin/users",
    }));

    if (classesWithoutTeacher > 0) {
      items.push({
        id: "classes-without-teacher",
        message: `${classesWithoutTeacher} ${classesWithoutTeacher === 1 ? "class needs" : "classes need"} a teacher assigned`,
        href: "/admin/classes",
      });
    }

    return {
      count: pending.length + classesWithoutTeacher,
      items: items.slice(0, MAX_ITEMS),
      viewAllHref: "/admin/dashboard",
    };
  }

  if (portal === "teacher") {
    const since = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
    // Same untyped-embed caveat as app/admin/classes/page.tsx: PostgREST
    // returns a single object for this many-to-one FK, but the client
    // without a generated schema infers an array.
    const { data } = await supabase
      .from("class_teacher_subjects")
      .select("id, subject, classes(level, section)")
      .eq("teacher_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    const rows = (data ?? []) as unknown as Array<{
      id: string;
      subject: string;
      classes: { level: string; section: string } | null;
    }>;

    const items: NotificationItem[] = rows.map((row) => ({
      id: row.id,
      message: row.classes
        ? `You were assigned to teach ${row.subject} in ${row.classes.level} ${row.classes.section}`
        : `You were assigned to teach ${row.subject}`,
      href: "/teacher",
    }));

    return { count: items.length, items: items.slice(0, MAX_ITEMS), viewAllHref: "/teacher" };
  }

  return { count: 0, items: [], viewAllHref: "/student" };
}

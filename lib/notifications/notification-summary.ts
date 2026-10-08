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
 * Items are still live-computed, not stored as rows - what needs attention
 * for admins (pending staff + unassigned classes, mirrors /admin/dashboard),
 * teachers (recent class/subject assignments), and students (recently
 * published results) is recomputed from the underlying tables every render.
 * notification_reads (migration 0022) only tracks which of those computed
 * keys this user has already dismissed, so a read item stays dismissed
 * instead of reappearing.
 */
export async function getNotificationSummary(
  portal: PortalKey,
  userId: string
): Promise<NotificationSummary> {
  const supabase = await createClient();

  const { data: readRows } = await supabase
    .from("notification_reads")
    .select("notification_key")
    .eq("user_id", userId);
  const readKeys = new Set((readRows ?? []).map((r) => r.notification_key));

  function unread(items: NotificationItem[]): NotificationItem[] {
    return items.filter((item) => !readKeys.has(item.id));
  }

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

    const visible = unread(items);
    return {
      count: visible.length,
      items: visible.slice(0, MAX_ITEMS),
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

    const visible = unread(items);
    return { count: visible.length, items: visible.slice(0, MAX_ITEMS), viewAllHref: "/teacher" };
  }

  // Student: recently published subject results.
  const since = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
  const { data } = await supabase
    .from("subject_results")
    .select("id, term, updated_at, class_teacher_subjects(subject)")
    .eq("student_id", userId)
    .gte("updated_at", since)
    .order("updated_at", { ascending: false });

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    term: string;
    class_teacher_subjects: { subject: string } | null;
  }>;

  const items: NotificationItem[] = rows.map((row) => ({
    id: row.id,
    message: row.class_teacher_subjects
      ? `Your ${row.class_teacher_subjects.subject} result for ${row.term} was published`
      : `Your result for ${row.term} was published`,
    href: "/student/results",
  }));

  const visible = unread(items);
  return { count: visible.length, items: visible.slice(0, MAX_ITEMS), viewAllHref: "/student/results" };
}

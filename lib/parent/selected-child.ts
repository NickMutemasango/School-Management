import { cookies } from "next/headers";
import type { ParentChild } from "@/lib/parent/children";

export const SELECTED_CHILD_COOKIE = "selected_child";

/**
 * Which linked child the parent last picked - a plain preference cookie,
 * same shape and reasoning as lib/students/selected-class.ts's
 * SELECTED_CLASS_COOKIE. It only ever narrows an already RLS-scoped query
 * (a tampered id just resolves to a child this parent isn't linked to,
 * which getSelectedChild filters back out), so it doesn't need to be
 * signed or httpOnly.
 */
export async function getSelectedChildId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SELECTED_CHILD_COOKIE)?.value ?? null;
}

/** The selected child if still valid for this parent, else the only child if there's just one, else null. */
export function resolveSelectedChild(
  children: ParentChild[],
  selectedId: string | null
): ParentChild | null {
  if (selectedId) {
    const match = children.find((c) => c.id === selectedId);
    if (match) return match;
  }
  return children.length === 1 ? children[0] : null;
}

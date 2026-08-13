/**
 * Class definitions - the registry the timetable resolves class ids against.
 *
 * Deliberately dependency-free so light consumers can map an id to a display
 * name without pulling in heavier modules. Empty until a backend supplies the
 * teacher's class allocations.
 */

export interface ClassDefinition {
  id: string;
  name: string;
  subject: string;
  level: string;
  room: string;
  /** Percentage of the term's scheme of work covered. */
  syllabusProgress: number;
  /** Tailwind classes for the class avatar tile. */
  tone: string;
}

export const classDefinitions: ClassDefinition[] = [];

/** Display name for a class id, e.g. "cls_4a_math" -> "Form 4A". */
export const classNameById: Record<string, string> = Object.fromEntries(
  classDefinitions.map((c) => [c.id, c.name])
);

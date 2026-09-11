"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Loader2, Plus, Trash2, UserPlus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_LEVELS } from "@/lib/data/class-levels";
import { SUBJECTS } from "@/lib/data/notes";
import {
  assignStudentToClass,
  assignTeacher,
  createClass,
  deleteClass,
  removeAssignment,
  removeStudentFromClass,
  type CreateClassState,
} from "@/app/admin/classes/actions";

export interface ClassAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
}

export interface ClassGroup {
  id: string;
  level: string;
  section: string;
  assignments: ClassAssignment[];
  students: StudentOption[];
}

export interface TeacherOption {
  id: string;
  name: string;
}

export interface StudentOption {
  id: string;
  name: string;
  regNumber: string;
  /** Enrolled class level - only students at the same level as a class can join it. */
  level: string;
}

interface ClassesTableProps {
  classes: ClassGroup[];
  teachers: TeacherOption[];
  students: StudentOption[];
}

export function ClassesTable({ classes, teachers, students }: ClassesTableProps) {
  const groupedByLevel = React.useMemo(() => {
    const groups = new Map<string, ClassGroup[]>();
    for (const cls of classes) {
      const list = groups.get(cls.level) ?? [];
      list.push(cls);
      groups.set(cls.level, list);
    }
    return groups;
  }, [classes]);

  return (
    <div className="space-y-8">
      <CreateClassCard />

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No classes yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Create a class above to start assigning teachers.
            </p>
          </CardContent>
        </Card>
      ) : (
        Array.from(groupedByLevel.entries()).map(([level, group]) => (
          <Card key={level}>
            <CardHeader className="border-b py-5">
              <CardTitle>{level}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {group.map((cls) => (
                <ClassRow key={cls.id} cls={cls} teachers={teachers} students={students} />
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

const createClassInitialState: CreateClassState = { error: null };

function CreateClassCard() {
  const [state, formAction, isPending] = useActionState(createClass, createClassInitialState);

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <CardTitle>Add Class</CardTitle>
        <CardDescription>Create a new level and section, e.g. "Grade 5" · "A".</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="grid gap-2">
            <Label htmlFor="level">Level</Label>
            <Select name="level" required>
              <SelectTrigger id="level" className="w-44">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="section">Section</Label>
            <Input id="section" name="section" placeholder="A" required className="w-24" />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add Class
          </Button>

          {state.error && (
            <p className="flex items-center gap-1 text-sm font-medium text-destructive">
              <AlertCircle className="size-3.5 shrink-0" />
              {state.error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

interface ClassRowProps {
  cls: ClassGroup;
  teachers: TeacherOption[];
  students: StudentOption[];
}

function ClassRow({ cls, teachers, students }: ClassRowProps) {
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">
          {cls.level} · {cls.section}
        </p>

        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Delete this class?</span>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => runAction(() => deleteClass(cls.id))}
            >
              Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {cls.assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{assignment.teacherName}</span>
              <Badge variant="secondary">{assignment.subject}</Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              title="Removing this also clears it from the timetable"
              onClick={() => runAction(() => removeAssignment(assignment.id))}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        {cls.assignments.length === 0 && (
          <p className="text-muted-foreground text-sm">No teachers assigned yet.</p>
        )}
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <AssignTeacherForm classId={cls.id} teachers={teachers} />
      <StudentMembership
        classId={cls.id}
        level={cls.level}
        assigned={cls.students}
        students={students}
      />
    </div>
  );
}

interface StudentMembershipProps {
  classId: string;
  level: string;
  assigned: StudentOption[];
  students: StudentOption[];
}

/** Lets an admin place enrolled students into this class section. */
function StudentMembership({ classId, level, assigned, students }: StudentMembershipProps) {
  const [studentId, setStudentId] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const assignedIds = new Set(assigned.map((student) => student.id));
  const choices = students.filter(
    (student) => student.level === level && !assignedIds.has(student.id)
  );

  function addStudent() {
    if (!studentId) return;
    startTransition(async () => {
      try {
        await assignStudentToClass(classId, studentId);
        setStudentId("");
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function removeStudent(id: string) {
    startTransition(async () => {
      try {
        await removeStudentFromClass(id);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="mt-4 border-t pt-3">
      <p className="text-sm font-medium">Students ({assigned.length})</p>
      <p className="text-muted-foreground mt-1 text-xs">
        Students receive all subjects assigned to this class.
      </p>

      <div className="mt-2 space-y-1.5">
        {assigned.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
          >
            <span className="text-sm">
              {student.name} <span className="text-muted-foreground">· {student.regNumber}</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => removeStudent(student.id)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        {assigned.length === 0 && (
          <p className="text-muted-foreground text-sm">No students in this class yet.</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="h-9 w-64" disabled={isPending || choices.length === 0}>
            <SelectValue placeholder={choices.length ? "Add enrolled student" : "No students available"} />
          </SelectTrigger>
          <SelectContent>
            {choices.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} · {student.regNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" variant="outline" disabled={isPending || !studentId} onClick={addStudent}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Add Student
        </Button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function AssignTeacherForm({ classId, teachers }: { classId: string; teachers: TeacherOption[] }) {
  const [teacherId, setTeacherId] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function handleAssign() {
    if (!teacherId || !subject) return;
    startTransition(async () => {
      try {
        await assignTeacher(classId, teacherId, subject);
        setError(null);
        setTeacherId("");
        setSubject("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3">
      <Select value={teacherId} onValueChange={setTeacherId}>
        <SelectTrigger className="h-9 w-44" disabled={isPending}>
          <SelectValue placeholder="Select teacher" />
        </SelectTrigger>
        <SelectContent>
          {teachers.map((teacher) => (
            <SelectItem key={teacher.id} value={teacher.id}>
              {teacher.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={subject} onValueChange={setSubject}>
        <SelectTrigger className="h-9 w-44" disabled={isPending}>
          <SelectValue placeholder="Select subject" />
        </SelectTrigger>
        <SelectContent>
          {SUBJECTS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button size="sm" variant="outline" disabled={isPending || !teacherId || !subject} onClick={handleAssign}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Assign
      </Button>

      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import {
  CalendarDays,
  Home,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  enrollmentStatusLabel,
  enrollmentStatusVariant,
  type Student,
} from "@/lib/data/students";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";

interface StudentProfileDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileDialog({
  student,
  open,
  onOpenChange,
}: StudentProfileDialogProps) {
  if (!student) return null;

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4 pr-8">
            <div
              className={cn(
                "grid size-16 shrink-0 place-items-center rounded-2xl text-xl font-bold",
                student.avatarColor
              )}
            >
              {initials(fullName)}
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{fullName}</DialogTitle>
              <DialogDescription className="mt-1">
                {student.regNumber} &middot; {student.classLevel}
              </DialogDescription>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Badge variant={enrollmentStatusVariant[student.status]}>
                  {enrollmentStatusLabel[student.status]}
                </Badge>
                <Badge variant="secondary">{student.gender}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Quick metrics */}
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            icon={Wallet}
            label="Fee Balance"
            value={formatCurrency(student.feeBalance)}
            tone={student.feeBalance > 0 ? "text-rose-600" : "text-emerald-600"}
          />
          <MetricTile
            icon={TrendingUp}
            label="Attendance"
            value={`${student.attendanceRate}%`}
            tone={student.attendanceRate >= 85 ? "text-emerald-600" : "text-amber-600"}
          />
          <MetricTile
            icon={ShieldCheck}
            label="Status"
            value={enrollmentStatusLabel[student.status]}
          />
        </div>

        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Student Details
            </h3>
            <dl className="space-y-3">
              <DetailRow
                icon={CalendarDays}
                label="Date of Birth"
                value={formatDate(student.dateOfBirth)}
              />
              <DetailRow
                icon={CalendarDays}
                label="Enrolled On"
                value={formatDate(student.enrolledOn)}
              />
              <DetailRow icon={Home} label="Address" value={student.address} />
            </dl>
          </section>

          <section>
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Guardian
            </h3>
            <dl className="space-y-3">
              <DetailRow
                icon={ShieldCheck}
                label="Name"
                value={student.guardianName}
              />
              <DetailRow icon={Phone} label="Phone" value={student.guardianPhone} />
              <DetailRow icon={Mail} label="Email" value={student.guardianEmail} />
            </dl>
          </section>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="accent">Edit Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className={cn("mt-2 text-lg font-bold tracking-tight", tone)}>{value}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="text-sm font-medium break-words">{value}</dd>
      </div>
    </div>
  );
}

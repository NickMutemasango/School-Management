"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2, RotateCcw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { approveStaff, denyStaff, reinstateStaff } from "@/app/admin/users/actions";
import { formatDate } from "@/lib/utils";

export interface StaffProfile {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "teacher" | "student";
  status: "pending" | "active" | "suspended";
  createdAt: string;
}

const roleLabel: Record<StaffProfile["role"], string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

const statusVariant: Record<StaffProfile["status"], "success" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  suspended: "danger",
};

interface UsersTableProps {
  pending: StaffProfile[];
  staff: StaffProfile[];
}

export function UsersTable({ pending, staff }: UsersTableProps) {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b py-5">
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            New staff sign-ups wait here until an admin approves them.
          </CardDescription>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((profile) => (
              <PendingRow key={profile.id} profile={profile} />
            ))}

            {pending.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-12 text-center">
                  <p className="font-medium">No accounts waiting</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    New staff Google sign-ups will show up here.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b py-5">
          <CardTitle>All Staff</CardTitle>
          <CardDescription>Everyone with admin or teacher access.</CardDescription>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((profile) => (
              <StaffRow key={profile.id} profile={profile} />
            ))}

            {staff.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-12 text-center">
                  <p className="font-medium">No staff yet</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function PendingRow({ profile }: { profile: StaffProfile }) {
  const [role, setRole] = React.useState<"teacher" | "admin">(
    profile.role === "admin" ? "admin" : "teacher"
  );
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
    <TableRow>
      <TableCell className="pl-6">
        <p className="font-medium">{profile.fullName || "(no name provided)"}</p>
        <p className="text-muted-foreground text-xs">{profile.email}</p>
      </TableCell>

      <TableCell className="text-muted-foreground">{formatDate(profile.createdAt)}</TableCell>

      <TableCell>
        <Select value={role} onValueChange={(v) => setRole(v as "teacher" | "admin")}>
          <SelectTrigger className="h-9 w-32" disabled={isPending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className="pr-6">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => runAction(() => denyStaff(profile.id))}
          >
            <X className="size-4" />
            Deny
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => runAction(() => approveStaff(profile.id, role))}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Approve
          </Button>
        </div>
        {error && (
          <p className="mt-1.5 flex items-center justify-end gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}

function StaffRow({ profile }: { profile: StaffProfile }) {
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
    <TableRow>
      <TableCell className="pl-6">
        <p className="font-medium">{profile.fullName || "(no name provided)"}</p>
        <p className="text-muted-foreground text-xs">{profile.email}</p>
      </TableCell>

      <TableCell>
        <Badge variant="secondary">{roleLabel[profile.role]}</Badge>
      </TableCell>

      <TableCell>
        <Badge variant={statusVariant[profile.status]}>
          {profile.status === "active" ? "Active" : "Suspended"}
        </Badge>
      </TableCell>

      <TableCell className="pr-6 text-right">
        {profile.status === "active" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => runAction(() => denyStaff(profile.id))}
          >
            <X className="size-4" />
            Suspend
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => runAction(() => reinstateStaff(profile.id))}
          >
            <RotateCcw className="size-4" />
            Reinstate
          </Button>
        )}
        {error && (
          <p className="mt-1.5 flex items-center justify-end gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}

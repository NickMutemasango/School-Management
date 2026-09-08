"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Copy, Loader2, Save, Upload, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateSelectField } from "@/components/shared/date-select-field";
import { CLASS_LEVELS } from "@/lib/data/students";
import { enrollStudent, type EnrollState } from "@/app/admin/students/enroll/actions";

const initialState: EnrollState = { error: null, success: null };

/**
 * Creates a real student login (Supabase Auth account + `students` row) on
 * submit. The Fees section below isn't wired up yet - there's no invoices
 * table to assign a billing profile against.
 */
export function EnrollmentForm() {
  const [state, formAction, isPending] = useActionState(enrollStudent, initialState);

  if (state.success) {
    return <EnrollmentSuccess {...state.success} />;
  }

  return (
    <form action={formAction}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection
            title="Student Information"
            description="Personal details as they appear on the birth certificate."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="firstName"
                name="firstName"
                label="First Name"
                placeholder="Enter first name"
                required
              />
              <Field
                id="lastName"
                name="lastName"
                label="Surname"
                placeholder="Enter surname"
                required
              />

              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender">
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DateSelectField
                id="dob"
                name="dob"
                label="Date of Birth"
                required
                minYear={new Date().getFullYear() - 25}
              />

              <div className="grid gap-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Select name="classLevel" required>
                  <SelectTrigger id="classLevel">
                    <SelectValue placeholder="Select class" />
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

              <DateSelectField
                id="enrolledOn"
                name="enrolledOn"
                label="Enrollment Date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                minYear={new Date().getFullYear() - 1}
                maxYear={new Date().getFullYear() + 1}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Home Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Street, suburb, city"
                className="min-h-20"
              />
            </div>
          </FormSection>

          <FormSection
            title="Guardian / Next of Kin"
            description="Primary contact for fees, results, and emergencies."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="guardianName"
                name="guardianName"
                label="Guardian Full Name"
                placeholder="Enter guardian's full name"
                required
              />
              <div className="grid gap-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select name="relationship">
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="guardian">Legal Guardian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field
                id="guardianPhone"
                name="guardianPhone"
                label="Phone Number"
                type="tel"
                placeholder="+263 7X XXX XXXX"
                required
              />
              <Field
                id="guardianEmail"
                name="guardianEmail"
                label="Email Address"
                type="email"
                placeholder="name@example.com"
              />
            </div>
          </FormSection>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          <FormSection
            title="Documents"
            description="Attach supporting paperwork."
          >
            <label className="hover:border-ring hover:bg-muted/50 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition-colors">
              <Upload className="text-muted-foreground size-6" />
              <span className="text-sm font-medium">Upload documents</span>
              <span className="text-muted-foreground text-xs">
                Birth certificate, transfer letter, previous report
              </span>
              <input type="file" multiple className="sr-only" />
            </label>
          </FormSection>

          <FormSection
            title="Fees"
            description="Not wired up yet - billing lands with the Finance module."
          >
            <div className="grid gap-2">
              <Label htmlFor="feeProfile">Fee Profile</Label>
              <Select disabled>
                <SelectTrigger id="feeProfile">
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="bursary">Bursary (50%)</SelectItem>
                  <SelectItem value="staff">Staff Child</SelectItem>
                  <SelectItem value="scholarship">Full Scholarship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Field
              id="deposit"
              label="Initial Deposit (USD)"
              type="number"
              placeholder="0.00"
              disabled
            />
          </FormSection>
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-6 flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
        >
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Separator className="my-8" />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/students">Cancel</Link>
        </Button>
        <Button type="button" variant="secondary" disabled>
          <Save className="size-4" />
          Save as draft
        </Button>
        <Button type="submit" variant="accent" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Enroll Student
        </Button>
      </div>
    </form>
  );
}

function EnrollmentSuccess({
  regNumber,
  tempPassword,
  fullName,
}: {
  regNumber: string;
  tempPassword: string;
  fullName: string;
}) {
  const [copied, setCopied] = React.useState(false);

  function copyCredentials() {
    navigator.clipboard.writeText(
      `Registration Number: ${regNumber}\nTemporary Password: ${tempPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="items-center gap-0 p-12 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{fullName} is enrolled</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Share these sign-in details with the student or guardian - the password
        won&rsquo;t be shown again.
      </p>

      <div className="mt-6 w-full max-w-xs space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-muted-foreground text-xs">Registration Number</p>
          <p className="font-mono text-sm font-semibold">{regNumber}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Temporary Password</p>
          <p className="font-mono text-sm font-semibold">{tempPassword}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={copyCredentials}>
          <Copy className="size-4" />
          {copied ? "Copied" : "Copy credentials"}
        </Button>
        <Button variant="outline" asChild>
          <a href="/admin/students/enroll">Enroll another</a>
        </Button>
        <Button variant="accent" asChild>
          <Link href="/admin/students">Back to directory</Link>
        </Button>
      </div>
    </Card>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 p-6">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      <Separator className="my-5" />
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function Field({
  id,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}

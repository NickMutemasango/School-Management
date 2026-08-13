"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Save, Upload, UserPlus } from "lucide-react";

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
import { CLASS_LEVELS } from "@/lib/data/students";

/**
 * Enrollment form UI only - submitting shows a local confirmation state.
 * Wire `onSubmit` to a real mutation when the backend lands.
 */
export function EnrollmentForm() {
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="items-center gap-0 p-12 text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-6 text-xl font-bold tracking-tight">Application captured</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          The enrollment details have been recorded. Once a backend is connected,
          this will create the student record and issue a registration number.
        </p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Enroll another
          </Button>
          <Button variant="accent" asChild>
            <Link href="/admin/students">Back to directory</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection
            title="Student Information"
            description="Personal details as they appear on the birth certificate."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="firstName"
                label="First Name"
                placeholder="Enter first name"
                required
              />
              <Field
                id="lastName"
                label="Surname"
                placeholder="Enter surname"
                required
              />

              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Field id="dob" label="Date of Birth" type="date" required />

              <div className="grid gap-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Select>
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

              <Field
                id="enrolledOn"
                label="Enrollment Date"
                type="date"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Home Address</Label>
              <Textarea
                id="address"
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
                label="Guardian Full Name"
                placeholder="Enter guardian's full name"
                required
              />
              <div className="grid gap-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select>
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
                label="Phone Number"
                type="tel"
                placeholder="+263 7X XXX XXXX"
                required
              />
              <Field
                id="guardianEmail"
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
            description="Assign the billing profile for this student."
          >
            <div className="grid gap-2">
              <Label htmlFor="feeProfile">Fee Profile</Label>
              <Select>
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
            />

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context for the registry..."
              />
            </div>
          </FormSection>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/students">Cancel</Link>
        </Button>
        <Button type="button" variant="secondary">
          <Save className="size-4" />
          Save as draft
        </Button>
        <Button type="submit" variant="accent">
          <UserPlus className="size-4" />
          Enroll Student
        </Button>
      </div>
    </form>
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

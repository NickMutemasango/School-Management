"use client";

import * as React from "react";
import { AlertCircle, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FormSection } from "@/components/shared/form-section";
import { SaveButton } from "@/components/shared/save-button";
import type { StudentProfile } from "@/lib/data/student";

/** The subset of the profile a student may edit themselves. */
type EditableProfile = Pick<
  StudentProfile,
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "dateOfBirth"
  | "gender"
  | "address"
  | "guardianName"
  | "guardianPhone"
  | "guardianEmail"
>;

type FieldErrors = Partial<Record<keyof EditableProfile, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+()\d][\d\s()-]{6,19}$/;

function validate(values: EditableProfile): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Surname is required.";

  if (values.email && !EMAIL_PATTERN.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.phone && !PHONE_PATTERN.test(values.phone.trim()))
    errors.phone = "Enter a valid phone number.";

  if (!values.guardianName.trim())
    errors.guardianName = "Guardian name is required.";
  if (values.guardianPhone && !PHONE_PATTERN.test(values.guardianPhone.trim()))
    errors.guardianPhone = "Enter a valid phone number.";
  if (values.guardianEmail && !EMAIL_PATTERN.test(values.guardianEmail.trim()))
    errors.guardianEmail = "Enter a valid email address.";

  return errors;
}

function toEditable(profile: StudentProfile): EditableProfile {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    address: profile.address,
    guardianName: profile.guardianName,
    guardianPhone: profile.guardianPhone,
    guardianEmail: profile.guardianEmail,
  };
}

export function PersonalDetailsForm({ profile }: { profile: StudentProfile }) {
  const initial = React.useMemo(() => toEditable(profile), [profile]);

  const [form, setForm] = React.useState<EditableProfile>(initial);
  const [saved, setSaved] = React.useState<EditableProfile>(initial);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitted, setSubmitted] = React.useState(false);

  const isDirty = (Object.keys(form) as (keyof EditableProfile)[]).some(
    (k) => form[k] !== saved[k]
  );

  function update(key: keyof EditableProfile, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    // Re-validate live only after the first save attempt, so fields don't
    // turn red while the student is still typing.
    if (submitted) setErrors(validate(next));
  }

  function handleSave() {
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaved(form);
  }

  function handleCancel() {
    setForm(saved);
    setErrors({});
    setSubmitted(false);
  }

  const hasErrors = Object.keys(errors).length > 0;

  const footer = (
    <>
      {hasErrors && (
        <p
          role="alert"
          className="mr-auto flex items-center gap-1.5 text-sm font-medium text-red-600"
        >
          <AlertCircle className="size-4 shrink-0" />
          Fix the highlighted fields before saving.
        </p>
      )}
      <button
        type="button"
        onClick={handleCancel}
        disabled={!isDirty}
        className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
      >
        Cancel
      </button>
      <SaveButton isDirty={isDirty} onSave={handleSave} />
    </>
  );

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <FormSection
        title="Personal Information"
        description="Your own contact details. Keep these current so the school can reach you."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First Name"
            value={form.firstName}
            error={errors.firstName}
            onChange={(v) => update("firstName", v)}
            required
          />
          <Field
            id="lastName"
            label="Surname"
            value={form.lastName}
            error={errors.lastName}
            onChange={(v) => update("lastName", v)}
            required
          />
          <Field
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={form.email}
            error={errors.email}
            onChange={(v) => update("email", v)}
          />
          <Field
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="+263 7X XXX XXXX"
            value={form.phone}
            error={errors.phone}
            onChange={(v) => update("phone", v)}
          />
          <Field
            id="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(v) => update("dateOfBirth", v)}
          />

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="bg-background h-11 rounded-lg border border-slate-200 px-3 text-sm shadow-sm outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Label htmlFor="address">Home Address</Label>
          <textarea
            id="address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street, suburb, city"
            className="bg-background min-h-20 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
          />
        </div>
      </FormSection>

      <FormSection
        title="Guardian / Next of Kin"
        description="Primary contact for fees, results, and emergencies."
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="guardianName"
            label="Guardian Full Name"
            value={form.guardianName}
            error={errors.guardianName}
            onChange={(v) => update("guardianName", v)}
            required
            className="sm:col-span-2"
          />
          <Field
            id="guardianPhone"
            label="Guardian Phone"
            type="tel"
            placeholder="+263 7X XXX XXXX"
            value={form.guardianPhone}
            error={errors.guardianPhone}
            onChange={(v) => update("guardianPhone", v)}
          />
          <Field
            id="guardianEmail"
            label="Guardian Email"
            type="email"
            placeholder="name@example.com"
            value={form.guardianEmail}
            error={errors.guardianEmail}
            onChange={(v) => update("guardianEmail", v)}
          />
        </div>
      </FormSection>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-red-500">
            *
          </span>
        )}
      </Label>

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "bg-background h-11 w-full rounded-lg border px-4 text-sm shadow-sm outline-none transition-shadow placeholder:text-slate-400",
          error
            ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-4 focus-visible:ring-red-500/10 dark:border-red-800"
            : "border-slate-200 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-slate-800"
        )}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-sm text-red-600"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Registry-controlled fields, shown but not editable here. */
export function RegistryDetails({ profile }: { profile: StudentProfile }) {
  const rows = [
    { label: "Registration Number", value: profile.regNumber },
    { label: "Class", value: profile.classLevel },
    { label: "Enrolled On", value: profile.enrolledOn },
  ];

  return (
    <FormSection
      title="Registry Information"
      description="Maintained by the school registry. Contact the registrar to request a change."
    >
      <dl className="grid gap-5 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Lock className="size-3" aria-hidden />
              {row.label}
            </dt>
            <dd className="mt-1.5 text-sm font-medium">
              {row.value || (
                <span className="text-slate-400">&mdash;</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </FormSection>
  );
}

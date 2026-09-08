"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function parseISODate(value: string | undefined) {
  const [y, m, d] = (value ?? "").split("-");
  if (!y || !m || !d) return { day: "", month: "", year: "" };
  return { day: String(Number(d)), month: String(Number(m)), year: y };
}

function toISODate(day: string, month: string, year: string) {
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

interface DateSelectFieldProps {
  id: string;
  label: string;
  /** Renders a hidden input under this name, for native <form> / FormData submission. */
  name?: string;
  /** Controlled ISO value ("YYYY-MM-DD"). Omit for uncontrolled/native-form use. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  /** Oldest selectable year. Defaults to 100 years ago (suits birthdates). */
  minYear?: number;
  /** Newest selectable year. Defaults to the current year - pass currentYear + N for due dates. */
  maxYear?: number;
}

/** Three dropdowns instead of a native date input - much faster than paging
 * a calendar back to a birth year or forward to a due date, especially on
 * mobile. Caps the day options to the selected month/year automatically. */
export function DateSelectField({
  id,
  label,
  name,
  value,
  defaultValue,
  onChange,
  required,
  error,
  minYear,
  maxYear,
}: DateSelectFieldProps) {
  const currentYear = new Date().getFullYear();
  const oldestYear = minYear ?? currentYear - 100;
  const newestYear = maxYear ?? currentYear;

  const [parts, setParts] = React.useState(() => parseISODate(value ?? defaultValue));

  // Stay in sync if a controlled value changes from outside (e.g. data
  // arriving after an initial empty render).
  React.useEffect(() => {
    if (value !== undefined) setParts(parseISODate(value));
  }, [value]);

  const maxDay =
    parts.month && parts.year ? daysInMonth(Number(parts.month), Number(parts.year)) : 31;
  const dayOptions = Array.from({ length: maxDay }, (_, i) => String(i + 1));
  const yearOptions = Array.from(
    { length: newestYear - oldestYear + 1 },
    (_, i) => String(newestYear - i)
  );

  function commit(next: { day?: string; month?: string; year?: string }) {
    const day = next.day ?? parts.day;
    const month = next.month ?? parts.month;
    const year = next.year ?? parts.year;
    const cappedDay =
      month && year && Number(day) > daysInMonth(Number(month), Number(year))
        ? String(daysInMonth(Number(month), Number(year)))
        : day;

    const nextParts = { day: cappedDay, month, year };
    setParts(nextParts);
    onChange?.(toISODate(nextParts.day, nextParts.month, nextParts.year));
  }

  const triggerClass = cn("h-11", error && "border-red-400 focus-visible:border-red-500");

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${id}-day`}>
        {label}
        {required && (
          <span aria-hidden className="text-red-500">
            *
          </span>
        )}
      </Label>

      <div className="grid grid-cols-3 gap-2">
        <Select value={parts.day} onValueChange={(v) => commit({ day: v })}>
          <SelectTrigger id={`${id}-day`} aria-label="Day" className={triggerClass}>
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {dayOptions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={parts.month} onValueChange={(v) => commit({ month: v })}>
          <SelectTrigger aria-label="Month" className={triggerClass}>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={parts.year} onValueChange={(v) => commit({ year: v })}>
          <SelectTrigger aria-label="Year" className={triggerClass}>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {name && (
        <input type="hidden" name={name} value={toISODate(parts.day, parts.month, parts.year)} />
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

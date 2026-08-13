"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

interface TeacherGreetingProps {
  name: string;
  department: string;
}

/**
 * Time-of-day greeting. The greeting and date resolve on the client so the
 * server render (which uses the server's clock/timezone) can't mismatch.
 */
export function TeacherGreeting({ name, department }: TeacherGreetingProps) {
  const [greeting, setGreeting] = React.useState("Welcome back");
  const [today, setToday] = React.useState("");

  React.useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    setGreeting(
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    );
    setToday(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  const firstName = name.trim().split(" ")[0];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {firstName ? `${greeting}, ${firstName}` : greeting}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {today}
          {today && department ? " · " : ""}
          {department ? `${department} Department` : ""}
        </p>
      </div>

      <Link
        href="/teacher/schedule"
        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none"
      >
        <CalendarDays className="size-4" />
        View Timetable
      </Link>
    </div>
  );
}

"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";

interface StudentGreetingProps {
  name: string;
  classLevel: string;
  regNumber: string;
}

/**
 * Time-of-day greeting. The greeting and date resolve on the client so the
 * server render (which uses the server's clock/timezone) can't mismatch.
 */
export function StudentGreeting({
  name,
  classLevel,
  regNumber,
}: StudentGreetingProps) {
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
        </p>
      </div>

      {(classLevel || regNumber) && (
        <div className="flex shrink-0 flex-wrap gap-2 self-start">
          {classLevel && <Badge variant="secondary">{classLevel}</Badge>}
          {regNumber && <Badge variant="neutral">{regNumber}</Badge>}
        </div>
      )}
    </div>
  );
}

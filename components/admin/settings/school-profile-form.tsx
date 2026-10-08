"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { updateSchoolProfile, type SettingsActionState } from "@/app/admin/settings/actions";
import type { SchoolSettings } from "@/lib/admin/school-settings";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const initialState: SettingsActionState = { error: null };

export function SchoolProfileForm({ settings }: { settings: SchoolSettings }) {
  const [state, formAction, isPending] = useActionState(updateSchoolProfile, initialState);
  const [startMonth, setStartMonth] = React.useState(String(settings.academicYearStartMonth));

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <CardTitle>School Profile</CardTitle>
        <CardDescription>Contact details and academic year configuration.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={settings.address} placeholder="123 School Road, Harare" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                placeholder="office@yourschool.org"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} placeholder="+263 ..." />
            </div>
          </div>

          <div className="grid gap-2 sm:w-64">
            <Label htmlFor="academicYearStartMonthTrigger">Academic Year Starts</Label>
            <input type="hidden" name="academicYearStartMonth" value={startMonth} />
            <Select value={startMonth} onValueChange={setStartMonth}>
              <SelectTrigger id="academicYearStartMonthTrigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, i) => (
                  <SelectItem key={month} value={String(i + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.error && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {state.error}
            </p>
          )}

          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

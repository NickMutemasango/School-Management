import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlaceholderPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Modules planned for this portal, listed as upcoming. */
  upcoming: string[];
}

export function PlaceholderPanel({
  icon: Icon,
  title,
  description,
  upcoming,
}: PlaceholderPanelProps) {
  return (
    <Card className="items-center gap-0 p-10 text-center sm:p-14">
      <div className="bg-muted text-muted-foreground grid size-16 place-items-center rounded-2xl">
        <Icon className="size-8" />
      </div>

      <Badge variant="accent" className="mt-5">
        Coming next
      </Badge>

      <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">{description}</p>

      <ul className="mt-8 grid w-full max-w-md gap-2 text-left">
        {upcoming.map((item) => (
          <li
            key={item}
            className="bg-background flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
          >
            <span className="bg-muted-foreground/30 size-1.5 shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

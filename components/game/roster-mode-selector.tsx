"use client";

import { CheckCircle2, History, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RosterMode } from "@/lib/game/types";

const MODES = [
  { value: "standard" as const, label: "Standard", description: "Latest TFT set", icon: Shield },
  { value: "wild" as const, label: "Wild", description: "Every TFT set", icon: History },
];

export function RosterModeSelector({
  mode,
  latestSetLabel,
  standardCount,
  wildCount,
  completedByRoster,
  onModeChange,
}: {
  mode: RosterMode;
  latestSetLabel: string;
  standardCount: number;
  wildCount: number;
  completedByRoster: Record<RosterMode, boolean>;
  onModeChange: (mode: RosterMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border bg-card/70 p-1.5" role="group" aria-label="Daily roster mode">
      {MODES.map(({ value, label, description, icon: Icon }) => {
        const selected = mode === value;
        const count = value === "standard" ? standardCount : wildCount;
        const detail = value === "standard" ? latestSetLabel : `Sets 1–${latestSetLabel.replace("Set ", "")}`;
        const unitLabel = value === "standard" ? "champions" : "versions";
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => onModeChange(value)}
            className={cn(
              "relative min-h-20 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:px-4",
              selected ? "border-primary/55 bg-primary/12 text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/45 hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-semibold"><Icon className={cn("size-4", selected && "text-primary")} aria-hidden="true" />{label}{completedByRoster[value] && <span className="ml-auto inline-flex"><CheckCircle2 className="size-4 text-success" aria-hidden="true" /><span className="sr-only">Completed</span></span>}</span>
            <span className="mt-1 block text-xs">{description}</span>
            <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{detail} · {count.toLocaleString()} {unitLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

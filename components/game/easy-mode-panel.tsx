"use client";

import { LockKeyhole, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeductionSummary } from "@/lib/game/easy";
import type { GameMode } from "@/lib/game/types";

function compactList(values: readonly string[], limit = 4) {
  if (values.length <= limit) return values.join(", ");
  return `${values.slice(0, limit).join(", ")} +${values.length - limit}`;
}

function numberBand({ min, max }: { min: number; max: number }) {
  return min === max ? min.toLocaleString() : `${min.toLocaleString()}–${max.toLocaleString()}`;
}

export function EasyModePanel({
  mode,
  locked,
  hasGuesses,
  possibleCount,
  totalCount,
  summary,
  recovery,
  onModeChange,
}: {
  mode: GameMode;
  locked: boolean;
  hasGuesses: boolean;
  possibleCount: number;
  totalCount: number;
  summary: DeductionSummary | null;
  recovery: boolean;
  onModeChange: (mode: GameMode) => void;
}) {
  const enabled = mode === "easy";
  const eliminated = Math.max(0, totalCount - possibleCount);
  const facts = summary ? [
    ["Sets", compactList(summary.setLabels)],
    ["Costs", summary.costs.map((cost) => `${cost}g`).join(", ")],
    ["Health", numberBand(summary.health)],
    ["Attack damage", numberBand(summary.attackDamage)],
    ["Range", summary.ranges.join(", ")],
    ["Traits", summary.guaranteedTraits.length ? `Always ${compactList(summary.guaranteedTraits)}` : `${summary.traitCombinationCount} combinations`],
  ] : [];

  return (
    <div className="mt-3 rounded-xl border bg-card/55 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" aria-hidden="true" /><p className="text-sm font-semibold">Easy mode</p></div>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Hides champions that conflict with your clues.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Easy mode"
          disabled={locked}
          onClick={() => onModeChange(enabled ? "standard" : "easy")}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
            enabled ? "border-primary/70 bg-primary" : "border-border bg-muted",
          )}
        >
          <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform", enabled ? "translate-x-5" : "translate-x-0.5")} />
        </button>
      </div>

      {locked && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" aria-hidden="true" />Mode is locked after your first guess.</p>}

      {enabled && (
        <div className="mt-3 border-t pt-3">
          <p className="font-mono text-xs text-primary" aria-live="polite">
            {possibleCount.toLocaleString()} {possibleCount === 1 ? "possibility" : "possibilities"} remaining
            {hasGuesses && ` · ${eliminated.toLocaleString()} eliminated`}
          </p>
          {recovery && <p className="mt-2 text-xs text-destructive">The clue filter could not be applied safely, so all unguessed champions remain available.</p>}
          {!hasGuesses && <p className="mt-2 text-xs text-muted-foreground">Make a guess to start narrowing the field.</p>}
          {hasGuesses && facts.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {facts.map(([label, value]) => <div key={label} className="min-w-0 rounded-lg border bg-background/45 p-2.5"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 truncate text-xs font-medium" title={value}>{value}</dd></div>)}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

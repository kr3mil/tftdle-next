"use client";

import { useState } from "react";
import { BarChart3, CircleHelp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { AssistStats, GameStats } from "@/lib/game/storage";
import { streaks } from "@/lib/game/storage";
import type { AssistMode, RosterMode } from "@/lib/game/types";

export function HowToPlayDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="ghost" size="icon-lg" aria-label="How to play"><CircleHelp className="size-5" /></Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>How to play</DialogTitle><DialogDescription>Complete one or both daily TFT champion puzzles.</DialogDescription></DialogHeader>
        <div className="space-y-5 text-sm leading-6 text-muted-foreground">
          <p>Choose Standard for champions from the latest TFT set or Wild for champion versions from every set. Each mode has its own daily answer, guesses, streak, and statistics.</p>
          <p>Search for a champion and use each clue to narrow the field. You have unlimited guesses, and everyone receives the same two puzzles until 00:00 UTC.</p>
          <Separator />
          <ul className="space-y-3">
            <li><strong className="text-foreground">Green</strong> means an exact match.</li>
            <li><strong className="text-foreground">Orange</strong> means at least one trait overlaps, but the complete trait set differs.</li>
            <li><strong className="text-foreground">Up or down arrows</strong> show whether the answer’s Set, Cost, Health, Attack Damage, or Range is higher or lower. Set is omitted in Standard because every champion is from the same roster.</li>
          </ul>
          <p className="rounded-lg border border-primary/25 bg-primary/5 p-3"><strong className="text-foreground">Easy mode</strong> removes champions that could not produce your clues. It can be chosen independently for Standard and Wild before that puzzle’s first guess.</p>
          <p className="rounded-lg border bg-muted/40 p-3"><ShieldCheck className="mr-2 inline size-4 text-primary" />Progress and statistics stay only in this browser.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StatisticsDialog({ stats, today }: { stats: GameStats; today: string }) {
  const [rosterMode, setRosterMode] = useState<RosterMode>("standard");
  const [assistMode, setAssistMode] = useState<AssistMode>("normal");
  const rosterStats = stats[rosterMode];
  const streak = streaks(rosterStats.completedDates, today);
  const values = [
    ["Played", rosterStats.startedDates.length],
    ["Completed", rosterStats.completedDates.length],
    ["Current streak", streak.current],
    ["Max streak", streak.maximum],
  ];
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="ghost" size="icon-lg" aria-label="View statistics"><BarChart3 className="size-5" /></Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Statistics</DialogTitle><DialogDescription>Independent Standard and Wild progress on this device.</DialogDescription></DialogHeader>
        <div className="grid grid-cols-2 rounded-lg border bg-muted/25 p-1" role="group" aria-label="Roster statistics">
          {(["standard", "wild"] as const).map((value) => <Button key={value} type="button" size="sm" variant={rosterMode === value ? "secondary" : "ghost"} aria-pressed={rosterMode === value} onClick={() => setRosterMode(value)}>{value === "standard" ? "Standard" : "Wild"}</Button>)}
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">{values.map(([label, value]) => <div key={label} className="rounded-lg border bg-muted/35 p-3 text-center"><dd className="font-mono text-xl font-semibold text-primary">{value}</dd><dt className="mt-1 text-[11px] text-muted-foreground">{label}</dt></div>)}</dl>
        <div className="grid grid-cols-2 rounded-lg border bg-muted/25 p-1" role="group" aria-label="Assistance statistics">
          {(["normal", "easy"] as const).map((value) => <Button key={value} type="button" size="sm" variant={assistMode === value ? "secondary" : "ghost"} aria-pressed={assistMode === value} onClick={() => setAssistMode(value)}>{value === "normal" ? "Normal" : "Easy"}</Button>)}
        </div>
        <AssistStatistics assistMode={assistMode} stats={rosterStats.byAssist[assistMode]} />
      </DialogContent>
    </Dialog>
  );
}

function AssistStatistics({ assistMode, stats }: { assistMode: AssistMode; stats: AssistStats }) {
  const completed = stats.completedDates.length;
  const average = completed ? (stats.totalGuesses / completed).toFixed(1) : "—";
  const values = [["Played", stats.startedDates.length], ["Completed", completed], ["Average", average], ["Best", stats.bestGuessCount ?? "—"]];
  const maximumBucket = Math.max(1, ...Object.values(stats.distribution));
  return <div><dl className="mb-5 grid grid-cols-4 gap-2">{values.map(([label, value]) => <div key={label} className="text-center"><dd className="font-mono text-base font-semibold">{value}</dd><dt className="text-[10px] text-muted-foreground">{label}</dt></div>)}</dl><h3 className="mb-3 text-sm font-semibold">{assistMode === "normal" ? "Normal" : "Easy"} guess distribution</h3><div className="space-y-1.5">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map((bucket) => { const count = stats.distribution[bucket] ?? 0; return <div key={bucket} className="grid grid-cols-[2rem_1fr] items-center gap-2 text-xs"><span className="text-right font-mono text-muted-foreground">{bucket}</span><span className="min-w-8 rounded-sm bg-primary/25 px-2 py-1 text-right font-mono text-primary" style={{ width: `${Math.max(12, count / maximumBucket * 100)}%` }}>{count}</span></div>; })}</div></div>;
}

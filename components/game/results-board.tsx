import Image from "next/image";
import { ArrowDown, ArrowUp, Check, CircleX, Split } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { compareChampion, matchDescription } from "@/lib/game/comparison";
import type { Champion, ClueKey, MatchKind } from "@/lib/game/types";

const CLUES: ReadonlyArray<{ key: ClueKey; label: string }> = [
  { key: "set", label: "Set" }, { key: "traits", label: "Traits" }, { key: "cost", label: "Cost" },
  { key: "health", label: "Health" }, { key: "attackDamage", label: "AD" }, { key: "range", label: "Range" },
];

function MatchIcon({ kind }: { kind: MatchKind }) {
  if (kind === "exact") return <Check className="size-4" aria-hidden="true" />;
  if (kind === "partial") return <Split className="size-4" aria-hidden="true" />;
  if (kind === "higher") return <ArrowUp className="size-4" aria-hidden="true" />;
  if (kind === "lower") return <ArrowDown className="size-4" aria-hidden="true" />;
  return <CircleX className="size-4" aria-hidden="true" />;
}

function clueValue(champion: Champion, key: ClueKey) {
  if (key === "set") return champion.setLabel.replace("Set ", "");
  if (key === "traits") return champion.traits.map((trait) => trait.name).join(", ");
  if (key === "cost") return `${champion.cost}g`;
  if (key === "health") return champion.health.toLocaleString();
  if (key === "attackDamage") return champion.attackDamage.toLocaleString();
  return String(champion.range);
}

function ClueCell({ champion, clue, kind, mobile = false }: { champion: Champion; clue: { key: ClueKey; label: string }; kind: MatchKind; mobile?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex min-h-16 items-center justify-center gap-1.5 rounded-lg border px-2 text-center text-sm font-semibold",
          kind === "exact" && "border-success/60 bg-success/25 text-emerald-100",
          kind === "partial" && "border-partial/60 bg-partial/25 text-amber-100",
          (kind === "higher" || kind === "lower") && "border-miss/55 bg-miss/25 text-red-100",
          kind === "miss" && "border-miss/55 bg-miss/25 text-red-100",
          mobile && "min-h-20 flex-col"
        )} aria-label={`${clue.label}: ${clueValue(champion, clue.key)}. ${matchDescription(kind)}`}>
          {mobile && <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">{clue.label}</span>}
          <MatchIcon kind={kind} />
          <span className={cn(clue.key === "traits" && "line-clamp-3 text-xs")}>{clueValue(champion, clue.key)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{matchDescription(kind)}</TooltipContent>
    </Tooltip>
  );
}

export function ResultsBoard({ guesses, answer, showSet = true }: { guesses: readonly Champion[]; answer: Champion; showSet?: boolean }) {
  const clues = showSet ? CLUES : CLUES.filter((clue) => clue.key !== "set");
  if (!guesses.length) return (
    <section className="rounded-xl border border-dashed bg-card/35 px-6 py-12 text-center" aria-label="No guesses yet">
      <p className="text-sm font-medium text-foreground">Your clues will appear here</p>
      <p className="mt-1 text-sm text-muted-foreground">Choose any champion version to begin.</p>
    </section>
  );

  return (
    <section aria-labelledby="guesses-heading">
      <h2 id="guesses-heading" className="sr-only">Guesses</h2>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-separate border-spacing-x-1.5 border-spacing-y-2 text-sm">
          <thead><tr><th className="pb-1 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">Champion</th>{clues.map((clue) => <th key={clue.key} className="pb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">{clue.label}</th>)}</tr></thead>
          <tbody>{guesses.map((champion) => {
            const comparison = compareChampion(champion, answer);
            return <tr key={champion.id}>
              <th scope="row" className="min-w-40 rounded-lg border bg-card p-2 text-left">
                <span className="flex items-center gap-3"><Image src={champion.image} alt={`${champion.name} portrait`} width={52} height={52} className="size-13 rounded-md object-cover" /><span><span className="block font-semibold">{champion.name}</span><span className="text-xs font-normal text-muted-foreground">{champion.setLabel}</span></span></span>
              </th>
              {clues.map((clue) => <td key={clue.key} className="min-w-20"><ClueCell champion={champion} clue={clue} kind={comparison[clue.key]} /></td>)}
            </tr>;
          })}</tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">{guesses.map((champion) => {
        const comparison = compareChampion(champion, answer);
        return <article key={champion.id} className="rounded-xl border bg-card/80 p-3">
          <header className="mb-3 flex items-center gap-3"><Image src={champion.image} alt={`${champion.name} portrait`} width={48} height={48} className="size-12 rounded-lg object-cover" /><div><h3 className="font-semibold">{champion.name}</h3><p className="text-xs text-muted-foreground">{champion.setLabel}</p></div></header>
          <div className={cn("grid gap-2", showSet ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3")}>{clues.map((clue) => <ClueCell key={clue.key} champion={champion} clue={clue} kind={comparison[clue.key]} mobile />)}</div>
        </article>;
      })}</div>
    </section>
  );
}

export const clueLegend = [
  { kind: "exact" as const, label: "Exact" }, { kind: "partial" as const, label: "Partial traits" },
  { kind: "higher" as const, label: "Answer higher" }, { kind: "lower" as const, label: "Answer lower" },
];

export function ClueLegend() {
  return <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Clue legend">{clueLegend.map(({ kind, label }) => <span key={kind} className="inline-flex items-center gap-1.5"><span className={cn("grid size-5 place-items-center rounded", kind === "exact" ? "bg-success/40 text-emerald-100" : kind === "partial" ? "bg-partial/40 text-amber-100" : "bg-miss/40 text-red-100")}><MatchIcon kind={kind} /></span>{label}</span>)}</div>;
}

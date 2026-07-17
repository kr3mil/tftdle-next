import { compareChampion } from "./comparison";
import type { AssistMode, Champion, MatchKind, RosterMode } from "./types";

const SYMBOL: Record<MatchKind, string> = { exact: "🟩", partial: "🟧", higher: "⬆️", lower: "⬇️", miss: "🟥" };

export function buildShareText(puzzle: number, guesses: readonly Champion[], answer: Champion, rosterMode: RosterMode, assistMode: AssistMode = "normal") {
  const rows = guesses.map((guess) => {
    const comparison = compareChampion(guess, answer);
    return [comparison.set, comparison.traits, comparison.cost, comparison.health, comparison.attackDamage, comparison.range]
      .map((kind) => SYMBOL[kind]).join("");
  });
  const assistLabel = assistMode === "easy" ? " · Easy" : "";
  const rosterLabel = rosterMode === "standard" ? "Standard" : "Wild";
  return [`TFTdle ${rosterLabel} #${puzzle}${assistLabel} · ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}`, "", ...rows, "", "https://www.tftdle.com"].join("\n");
}

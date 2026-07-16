import { compareChampion } from "./comparison";
import type { Champion, GameMode, MatchKind } from "./types";

const SYMBOL: Record<MatchKind, string> = { exact: "🟩", partial: "🟧", higher: "⬆️", lower: "⬇️", miss: "🟥" };

export function buildShareText(puzzle: number, guesses: readonly Champion[], answer: Champion, mode: GameMode = "standard") {
  const rows = guesses.map((guess) => {
    const comparison = compareChampion(guess, answer);
    return [comparison.set, comparison.traits, comparison.cost, comparison.health, comparison.attackDamage, comparison.range]
      .map((kind) => SYMBOL[kind]).join("");
  });
  const modeLabel = mode === "easy" ? " · Easy" : "";
  return [`TFTdle #${puzzle}${modeLabel} · ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}`, "", ...rows, "", "https://tftdle.com"].join("\n");
}

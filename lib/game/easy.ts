import { compareChampion } from "./comparison";
import type { Champion, ClueKey, Comparison } from "./types";

const CLUE_KEYS: readonly ClueKey[] = ["set", "traits", "cost", "health", "attackDamage", "range"];

function sameComparison(left: Comparison, right: Comparison) {
  return CLUE_KEYS.every((key) => left[key] === right[key]);
}

export function possibleChampions(champions: readonly Champion[], guesses: readonly Champion[], answer: Champion) {
  if (!guesses.length) return champions;
  const observed = guesses.map((guess) => ({ guess, comparison: compareChampion(guess, answer) }));
  return champions.filter((candidate) => observed.every(({ guess, comparison }) => sameComparison(compareChampion(guess, candidate), comparison)));
}

export type DeductionSummary = Readonly<{
  setLabels: readonly string[];
  costs: readonly number[];
  health: Readonly<{ min: number; max: number }>;
  attackDamage: Readonly<{ min: number; max: number }>;
  ranges: readonly number[];
  guaranteedTraits: readonly string[];
  traitCombinationCount: number;
}>;

export function summarizePossibilities(champions: readonly Champion[]): DeductionSummary | null {
  if (!champions.length) return null;
  const uniqueSorted = (values: readonly number[]) => [...new Set(values)].sort((left, right) => left - right);
  const setLabels = [...new Map([...champions].sort((left, right) => left.setOrder - right.setOrder).map((champion) => [champion.setId, champion.setLabel])).values()];
  const traitSets = champions.map((champion) => new Set(champion.traits.map((trait) => trait.name)));
  const guaranteedTraits = [...traitSets[0]!].filter((trait) => traitSets.every((traits) => traits.has(trait))).sort();
  const traitCombinationCount = new Set(champions.map((champion) => champion.traits.map((trait) => trait.name.toLocaleLowerCase()).sort().join("|"))).size;
  const health = champions.map((champion) => champion.health);
  const attackDamage = champions.map((champion) => champion.attackDamage);

  return {
    setLabels,
    costs: uniqueSorted(champions.map((champion) => champion.cost)),
    health: { min: Math.min(...health), max: Math.max(...health) },
    attackDamage: { min: Math.min(...attackDamage), max: Math.max(...attackDamage) },
    ranges: uniqueSorted(champions.map((champion) => champion.range)),
    guaranteedTraits,
    traitCombinationCount,
  };
}

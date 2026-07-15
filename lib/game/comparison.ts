import type { Champion, Comparison, MatchKind } from "./types";

function numericMatch(guess: number, answer: number): MatchKind {
  if (guess === answer) return "exact";
  return guess < answer ? "higher" : "lower";
}

function traitMatch(guess: Champion, answer: Champion): MatchKind {
  const guessed = new Set(guess.traits.map((trait) => trait.name.toLocaleLowerCase()));
  const expected = new Set(answer.traits.map((trait) => trait.name.toLocaleLowerCase()));
  const exact = guessed.size === expected.size && [...guessed].every((trait) => expected.has(trait));
  if (exact) return "exact";
  return [...guessed].some((trait) => expected.has(trait)) ? "partial" : "miss";
}

export function compareChampion(guess: Champion, answer: Champion): Comparison {
  return {
    set: numericMatch(guess.setOrder, answer.setOrder),
    traits: traitMatch(guess, answer),
    cost: numericMatch(guess.cost, answer.cost),
    health: numericMatch(guess.health, answer.health),
    attackDamage: numericMatch(guess.attackDamage, answer.attackDamage),
    range: numericMatch(guess.range, answer.range),
  };
}

export function matchDescription(kind: MatchKind) {
  return ({ exact: "Exact match", partial: "Partial trait match", higher: "Answer is higher", lower: "Answer is lower", miss: "No match" } as const)[kind];
}

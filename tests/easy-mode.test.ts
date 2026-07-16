import { describe, expect, it } from "vitest";
import { possibleChampions, summarizePossibilities } from "@/lib/game/easy";
import { champion } from "./fixtures";

describe("Easy mode deduction", () => {
  it("keeps only champions that reproduce every observed clue", () => {
    const answer = champion({ id: "answer", cost: 4 });
    const guess = champion({ id: "guess", cost: 2 });
    const candidates = [
      answer,
      champion({ id: "still-possible", cost: 3 }),
      champion({ id: "wrong-direction", cost: 1 }),
      champion({ id: "wrong-exact", cost: 2 }),
      champion({ id: "wrong-health", cost: 3, health: 999 }),
    ];
    expect(possibleChampions(candidates, [guess], answer).map((candidate) => candidate.id)).toEqual(["answer", "still-possible"]);
  });

  it("handles exact, partial and missing trait feedback through the comparison engine", () => {
    const mage = { id: "mage", name: "Mage", icon: "/icon.svg" };
    const scholar = { id: "scholar", name: "Scholar", icon: "/icon.svg" };
    const bruiser = { id: "bruiser", name: "Bruiser", icon: "/icon.svg" };
    const answer = champion({ id: "answer", traits: [mage, scholar] });
    const guess = champion({ id: "guess", traits: [mage, bruiser] });
    const partial = champion({ id: "partial", traits: [bruiser, scholar] });
    const miss = champion({ id: "miss", traits: [{ id: "sniper", name: "Sniper", icon: "/icon.svg" }] });
    const exactGuess = champion({ id: "exact-guess", traits: [mage, bruiser] });
    expect(possibleChampions([answer, partial, miss, exactGuess], [guess], answer).map((candidate) => candidate.id)).toEqual(["answer", "partial"]);
  });

  it("summarizes remaining numeric domains and trait combinations", () => {
    const mage = { id: "mage", name: "Mage", icon: "/icon.svg" };
    const candidates = [
      champion({ setId: "1", setLabel: "Set 1", setOrder: 1, cost: 2, health: 500, attackDamage: 40, range: 2, traits: [mage] }),
      champion({ id: "second", setId: "2", setLabel: "Set 2", setOrder: 2, cost: 4, health: 900, attackDamage: 70, range: 4, traits: [mage, { id: "scholar", name: "Scholar", icon: "/icon.svg" }] }),
    ];
    expect(summarizePossibilities(candidates)).toEqual({
      setLabels: ["Set 1", "Set 2"], costs: [2, 4], health: { min: 500, max: 900 },
      attackDamage: { min: 40, max: 70 }, ranges: [2, 4], guaranteedTraits: ["Mage"], traitCombinationCount: 2,
    });
    expect(summarizePossibilities([])).toBeNull();
  });
});

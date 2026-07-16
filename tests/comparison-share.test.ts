import { describe, expect, it } from "vitest";
import { compareChampion } from "@/lib/game/comparison";
import { buildShareText } from "@/lib/game/share";
import { champion } from "./fixtures";

describe("champion comparison", () => {
  const answer = champion({ id: "answer", setOrder: 5, traits: [{ id: "a", name: "Arcanist", icon: "/icon.svg" }, { id: "b", name: "Scholar", icon: "/icon.svg" }], cost: 4, health: 900, attackDamage: 70, range: 3 });

  it("distinguishes exact, partial and directional clues", () => {
    const guess = champion({ setOrder: 4, traits: [{ id: "a", name: "Arcanist", icon: "/icon.svg" }], cost: 5, health: 900, attackDamage: 60, range: 1 });
    expect(compareChampion(guess, answer)).toEqual({ set: "higher", traits: "partial", cost: "lower", health: "exact", attackDamage: "higher", range: "higher" });
  });
  it("requires the complete trait set for an exact match", () => {
    expect(compareChampion(answer, answer).traits).toBe("exact");
    expect(compareChampion(champion({ traits: [] }), answer).traits).toBe("miss");
  });
  it("builds sharing from the same comparison engine", () => {
    const text = buildShareText(42, [answer], answer);
    expect(text).toContain("TFTdle #42 · 1 guess");
    expect(text).toContain("🟩🟩🟩🟩🟩🟩");
    expect(buildShareText(42, [answer], answer, "easy")).toContain("TFTdle #42 · Easy · 1 guess");
  });
});

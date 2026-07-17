import { describe, expect, it } from "vitest";
import { daysBetweenUtc, formatCountdown, puzzleNumber } from "@/lib/game/date";
import { answerForDate, championsForRoster, shuffledChampionIds, snapshotForDate } from "@/lib/game/selection";
import { champion, snapshot } from "./fixtures";

describe("UTC puzzle dates", () => {
  it("keeps the original zero-based epoch", () => {
    expect(puzzleNumber("2022-11-14")).toBe(0);
    expect(puzzleNumber("2024-02-29")).toBe(daysBetweenUtc("2022-11-14", "2024-02-29"));
  });
  it("formats the reset countdown", () => expect(formatCountdown(3_661_000)).toBe("01:01:01"));
});

describe("daily selection", () => {
  const champions = Array.from({ length: 12 }, (_, index) => champion({ id: `1:c${index}`, name: `Champion ${index}` }));
  const active = snapshot(champions);
  const pending = { ...snapshot(champions.slice().reverse()), id: "pending", checksum: "b".repeat(64), effectiveFromUtc: "2026-07-16" };
  const manifest = { version: 2 as const, active, pending };

  it("is deterministic and does not repeat within a cycle", () => {
    expect(shuffledChampionIds(active, 0)).toEqual(shuffledChampionIds(active, 0));
    expect(new Set(shuffledChampionIds(active, 0))).toHaveLength(champions.length);
    expect(answerForDate(manifest, "2026-07-15").id).toBe(answerForDate(manifest, "2026-07-15", "wild").id);
  });
  it("limits Standard to the highest roster order with its own unique cycle", () => {
    const mixed = snapshot([
      ...champions.slice(0, 6),
      ...champions.slice(6).map((unit, index) => ({ ...unit, id: `2:c${index}`, setId: "2", setLabel: "Set 2", setOrder: 2 })),
    ]);
    expect(championsForRoster(mixed, "standard").every((unit) => unit.setOrder === 2)).toBe(true);
    expect(championsForRoster(mixed, "wild")).toHaveLength(12);
    expect(new Set(shuffledChampionIds(mixed, 0, "standard"))).toHaveLength(6);
    expect(answerForDate({ version: 2, active: mixed, pending: null }, "2026-07-15", "standard").setId).toBe("2");
  });
  it("activates a pending catalog at its UTC boundary", () => {
    expect(snapshotForDate(manifest, "2026-07-15").id).toBe("test");
    expect(snapshotForDate(manifest, "2026-07-16").id).toBe("pending");
    expect(answerForDate(manifest, "2026-07-16")).toBeDefined();
  });
});

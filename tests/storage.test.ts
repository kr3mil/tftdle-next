import { describe, expect, it } from "vitest";
import { emptyStats, loadStoredGame, newGame, recordGuess, saveStoredGame, STORAGE_KEY, streaks } from "@/lib/game/storage";
import { champion } from "./fixtures";

describe("local persistence", () => {
  it("prevents duplicate guesses and records one completion", () => {
    const first = recordGuess(newGame("2026-07-15", "answer"), "wrong", false);
    expect(recordGuess(first, "wrong", false)).toEqual(first);
    const completed = recordGuess(first, "answer", true);
    expect(completed.daily.completed).toBe(true);
    expect(completed.stats.totalGuesses).toBe(2);
    expect(recordGuess(completed, "other", false)).toEqual(completed);
  });
  it("keeps aggregate stats through a UTC rollover", () => {
    const storage = window.localStorage;
    storage.clear();
    const game = { ...newGame("2026-07-14", "old", { ...emptyStats(), completedDates: ["2026-07-14"] }) };
    saveStoredGame(storage, game);
    const loaded = loadStoredGame(storage, "2026-07-15", "new", [champion()]);
    expect(loaded.game.daily.date).toBe("2026-07-15");
    expect(loaded.game.stats.completedDates).toEqual(["2026-07-14"]);
  });
  it("recovers corrupted v2 data", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json");
    expect(loadStoredGame(window.localStorage, "2026-07-15", "answer", [champion()]).recovered).toBe(true);
  });
  it("calculates current and maximum completion streaks", () => {
    expect(streaks(["2026-07-10", "2026-07-11", "2026-07-14"], "2026-07-15")).toEqual({ current: 1, maximum: 2 });
  });
});

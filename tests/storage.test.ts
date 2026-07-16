import { describe, expect, it } from "vitest";
import { emptyStats, loadStoredGame, newGame, recordGuess, saveStoredGame, setGameMode, STORAGE_KEY, streaks, V2_STORAGE_KEY } from "@/lib/game/storage";
import { champion } from "./fixtures";

describe("local persistence", () => {
  it("prevents duplicate guesses and records one completion", () => {
    const first = recordGuess(newGame("2026-07-15", "answer"), "wrong", false);
    expect(recordGuess(first, "wrong", false)).toEqual(first);
    const completed = recordGuess(first, "answer", true);
    expect(completed.daily.completed).toBe(true);
    expect(completed.stats.byMode.standard.totalGuesses).toBe(2);
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
  it("locks the selected mode after the first guess and separates mode statistics", () => {
    const easy = setGameMode(newGame("2026-07-15", "answer"), "easy");
    expect(easy.settings.defaultMode).toBe("easy");
    const started = recordGuess(easy, "wrong", false);
    expect(setGameMode(started, "standard")).toEqual(started);
    const completed = recordGuess(started, "answer", true);
    expect(completed.stats.completedDates).toEqual(["2026-07-15"]);
    expect(completed.stats.byMode.easy.totalGuesses).toBe(2);
    expect(completed.stats.byMode.standard.totalGuesses).toBe(0);
  });
  it("migrates v2 history into standard statistics without deleting the old key", () => {
    const legacy = { version: 2, daily: { date: "2026-07-15", answerId: "answer", guesses: ["wrong"], completed: false }, stats: { startedDates: ["2026-07-15"], completedDates: [], totalGuesses: 6, bestGuessCount: 2, distribution: { "2": 3 } } };
    window.localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(legacy));
    const loaded = loadStoredGame(window.localStorage, "2026-07-15", "answer", [champion()]);
    expect(loaded.game.daily.mode).toBe("standard");
    expect(loaded.game.stats.byMode.standard.totalGuesses).toBe(6);
    expect(window.localStorage.getItem(V2_STORAGE_KEY)).toBe(JSON.stringify(legacy));
  });
});

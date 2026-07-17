import { beforeEach, describe, expect, it } from "vitest";
import { emptyStats, loadStoredGame, newGame, recordGuess, saveStoredGame, setAssistMode, STORAGE_KEY, streaks, V2_STORAGE_KEY, V3_STORAGE_KEY } from "@/lib/game/storage";
import { champion } from "./fixtures";

const answers = { standard: "standard-answer", wild: "wild-answer" };

describe("local persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps Standard and Wild guesses, completions, and statistics independent", () => {
    const first = recordGuess(newGame("2026-07-15", answers), "standard", "wrong", false);
    expect(recordGuess(first, "standard", "wrong", false)).toEqual(first);
    const completed = recordGuess(first, "standard", answers.standard, true);
    expect(completed.dailyByRoster.standard.completed).toBe(true);
    expect(completed.dailyByRoster.wild.guesses).toEqual([]);
    expect(completed.statsByRoster.standard.byAssist.normal.totalGuesses).toBe(2);
    expect(completed.statsByRoster.wild.byAssist.normal.totalGuesses).toBe(0);
    expect(recordGuess(completed, "standard", "other", false)).toEqual(completed);
  });

  it("keeps both aggregate histories through a UTC rollover", () => {
    const stats = emptyStats();
    stats.standard.completedDates = ["2026-07-14"];
    stats.wild.completedDates = ["2026-07-13"];
    saveStoredGame(window.localStorage, newGame("2026-07-14", { standard: "old-standard", wild: "old-wild" }, stats));
    const loaded = loadStoredGame(window.localStorage, "2026-07-15", answers, [champion()]);
    expect(loaded.game.dailyByRoster.standard.date).toBe("2026-07-15");
    expect(loaded.game.dailyByRoster.wild.date).toBe("2026-07-15");
    expect(loaded.game.statsByRoster.standard.completedDates).toEqual(["2026-07-14"]);
    expect(loaded.game.statsByRoster.wild.completedDates).toEqual(["2026-07-13"]);
  });

  it("recovers corrupted v4 data", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json");
    expect(loadStoredGame(window.localStorage, "2026-07-15", answers, [champion()]).recovered).toBe(true);
  });

  it("calculates current and maximum completion streaks", () => {
    expect(streaks(["2026-07-10", "2026-07-11", "2026-07-14"], "2026-07-15")).toEqual({ current: 1, maximum: 2 });
  });

  it("locks Easy independently after each roster's first guess", () => {
    let game = setAssistMode(newGame("2026-07-15", answers), "wild", "easy");
    game = recordGuess(game, "wild", "wrong", false);
    expect(setAssistMode(game, "wild", "normal")).toEqual(game);
    const standardEasy = setAssistMode(game, "standard", "easy");
    expect(standardEasy.dailyByRoster.standard.assistMode).toBe("easy");
    expect(standardEasy.dailyByRoster.wild.assistMode).toBe("easy");
    const completed = recordGuess(game, "wild", answers.wild, true);
    expect(completed.statsByRoster.wild.byAssist.easy.totalGuesses).toBe(2);
    expect(completed.statsByRoster.standard.byAssist.easy.totalGuesses).toBe(0);
  });

  it("migrates v3 all-set progress into Wild without deleting the old key", () => {
    const legacy = {
      version: 3,
      daily: { date: "2026-07-15", answerId: answers.wild, guesses: ["wrong"], completed: false, mode: "easy" },
      stats: {
        startedDates: ["2026-07-15"], completedDates: [],
        byMode: {
          standard: { startedDates: [], completedDates: [], totalGuesses: 6, bestGuessCount: 2, distribution: { "2": 3 } },
          easy: { startedDates: ["2026-07-15"], completedDates: [], totalGuesses: 1, bestGuessCount: null, distribution: {} },
        },
      },
      settings: { defaultMode: "easy" },
    };
    window.localStorage.setItem(V3_STORAGE_KEY, JSON.stringify(legacy));
    const loaded = loadStoredGame(window.localStorage, "2026-07-15", answers, [champion()]);
    expect(loaded.game.dailyByRoster.standard.guesses).toEqual([]);
    expect(loaded.game.dailyByRoster.wild.guesses).toEqual(["wrong"]);
    expect(loaded.game.dailyByRoster.wild.assistMode).toBe("easy");
    expect(loaded.game.statsByRoster.wild.byAssist.normal.totalGuesses).toBe(6);
    expect(loaded.game.statsByRoster.standard.startedDates).toEqual([]);
    expect(window.localStorage.getItem(V3_STORAGE_KEY)).toBe(JSON.stringify(legacy));
  });

  it("migrates v2 history into Wild Normal statistics", () => {
    const legacy = { version: 2, daily: { date: "2026-07-15", answerId: answers.wild, guesses: ["wrong"], completed: false }, stats: { startedDates: ["2026-07-15"], completedDates: [], totalGuesses: 6, bestGuessCount: 2, distribution: { "2": 3 } } };
    window.localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(legacy));
    const loaded = loadStoredGame(window.localStorage, "2026-07-15", answers, [champion()]);
    expect(loaded.game.dailyByRoster.wild.guesses).toEqual(["wrong"]);
    expect(loaded.game.statsByRoster.wild.byAssist.normal.totalGuesses).toBe(6);
    expect(loaded.game.statsByRoster.standard.startedDates).toEqual([]);
  });
});

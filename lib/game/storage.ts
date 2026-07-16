import { z } from "zod";
import type { Champion, GameMode } from "./types";
import { daysBetweenUtc } from "./date";

export const STORAGE_KEY = "tftdle:v3";
export const V2_STORAGE_KEY = "tftdle:v2";

const gameModeSchema = z.enum(["standard", "easy"]);
const dailySchema = z.object({
  date: z.string(),
  answerId: z.string(),
  guesses: z.array(z.string()),
  completed: z.boolean(),
  mode: gameModeSchema,
});
const modeStatsSchema = z.object({
  startedDates: z.array(z.string()),
  completedDates: z.array(z.string()),
  totalGuesses: z.number().nonnegative(),
  bestGuessCount: z.number().positive().nullable(),
  distribution: z.record(z.string(), z.number().nonnegative()),
});
const statsSchema = z.object({
  startedDates: z.array(z.string()),
  completedDates: z.array(z.string()),
  byMode: z.object({ standard: modeStatsSchema, easy: modeStatsSchema }),
});
const settingsSchema = z.object({ defaultMode: gameModeSchema });

export const persistedGameSchema = z.object({ version: z.literal(3), daily: dailySchema, stats: statsSchema, settings: settingsSchema });
export type PersistedGame = z.infer<typeof persistedGameSchema>;
export type GameStats = PersistedGame["stats"];
export type ModeStats = GameStats["byMode"][GameMode];

const v2StatsSchema = z.object({
  startedDates: z.array(z.string()), completedDates: z.array(z.string()), totalGuesses: z.number().nonnegative(),
  bestGuessCount: z.number().positive().nullable(), distribution: z.record(z.string(), z.number().nonnegative()),
});
const v2GameSchema = z.object({
  version: z.literal(2),
  daily: z.object({ date: z.string(), answerId: z.string(), guesses: z.array(z.string()), completed: z.boolean() }),
  stats: v2StatsSchema,
});

export function emptyModeStats(): ModeStats {
  return { startedDates: [], completedDates: [], totalGuesses: 0, bestGuessCount: null, distribution: {} };
}

export function emptyStats(): GameStats {
  return { startedDates: [], completedDates: [], byMode: { standard: emptyModeStats(), easy: emptyModeStats() } };
}

export function newGame(
  date: string,
  answerId: string,
  stats: GameStats = emptyStats(),
  settings: PersistedGame["settings"] = { defaultMode: "standard" },
): PersistedGame {
  return { version: 3, daily: { date, answerId, guesses: [], completed: false, mode: settings.defaultMode }, stats, settings };
}

function unique(values: readonly string[]) { return [...new Set(values)]; }

export function setGameMode(game: PersistedGame, mode: GameMode): PersistedGame {
  if (game.daily.completed || game.daily.guesses.length > 0) return game;
  return { ...game, daily: { ...game.daily, mode }, settings: { defaultMode: mode } };
}

export function recordGuess(game: PersistedGame, championId: string, isCorrect: boolean): PersistedGame {
  if (game.daily.completed || game.daily.guesses.includes(championId)) return game;
  const guesses = [...game.daily.guesses, championId];
  const mode = game.daily.mode;
  const modeStats = game.stats.byMode[mode];
  const firstGuess = game.daily.guesses.length === 0;
  const startedDates = firstGuess ? unique([...game.stats.startedDates, game.daily.date]) : game.stats.startedDates;
  const modeStartedDates = firstGuess ? unique([...modeStats.startedDates, game.daily.date]) : modeStats.startedDates;
  const startedModeStats = { ...modeStats, startedDates: modeStartedDates };
  if (!isCorrect) return {
    ...game,
    daily: { ...game.daily, guesses },
    stats: { ...game.stats, startedDates, byMode: { ...game.stats.byMode, [mode]: startedModeStats } },
  };
  const bucket = guesses.length >= 10 ? "10+" : String(guesses.length);
  const completedModeStats: ModeStats = {
    ...startedModeStats,
    completedDates: unique([...modeStats.completedDates, game.daily.date]),
    totalGuesses: modeStats.totalGuesses + guesses.length,
    bestGuessCount: modeStats.bestGuessCount === null ? guesses.length : Math.min(modeStats.bestGuessCount, guesses.length),
    distribution: { ...modeStats.distribution, [bucket]: (modeStats.distribution[bucket] ?? 0) + 1 },
  };
  return {
    ...game,
    daily: { ...game.daily, guesses, completed: true },
    stats: {
      ...game.stats,
      startedDates,
      completedDates: unique([...game.stats.completedDates, game.daily.date]),
      byMode: { ...game.stats.byMode, [mode]: completedModeStats },
    },
  };
}

export function streaks(completedDates: readonly string[], today: string) {
  const sorted = [...new Set(completedDates)].sort();
  let maximum = sorted.length ? 1 : 0;
  let run = sorted.length ? 1 : 0;
  for (let index = 1; index < sorted.length; index += 1) {
    run = daysBetweenUtc(sorted[index - 1]!, sorted[index]!) === 1 ? run + 1 : 1;
    maximum = Math.max(maximum, run);
  }
  const last = sorted.at(-1);
  const current = last && daysBetweenUtc(last, today) <= 1 ? run : 0;
  return { current, maximum };
}

function migrateV2(game: z.infer<typeof v2GameSchema>): PersistedGame {
  const standard: ModeStats = { ...game.stats };
  return {
    version: 3,
    daily: { ...game.daily, mode: "standard" },
    stats: { startedDates: game.stats.startedDates, completedDates: game.stats.completedDates, byMode: { standard, easy: emptyModeStats() } },
    settings: { defaultMode: "standard" },
  };
}

function currentOrFresh(game: PersistedGame, date: string, answerId: string) {
  return game.daily.date === date && game.daily.answerId === answerId ? game : newGame(date, answerId, game.stats, game.settings);
}

export function loadStoredGame(storage: Storage, date: string, answerId: string, champions: readonly Champion[]) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw) {
    try { return { game: currentOrFresh(persistedGameSchema.parse(JSON.parse(raw)), date, answerId), recovered: false }; }
    catch { storage.removeItem(STORAGE_KEY); }
  }

  const v2Raw = storage.getItem(V2_STORAGE_KEY);
  if (v2Raw) {
    try { return { game: currentOrFresh(migrateV2(v2GameSchema.parse(JSON.parse(v2Raw))), date, answerId), recovered: false }; }
    catch { /* Continue to the locale-key migration. */ }
  }

  const legacyKey = `${new Date(`${date}T12:00:00`).toLocaleDateString()}/guesses`;
  const legacy = storage.getItem(legacyKey);
  if (legacy) {
    try {
      const values = z.array(z.object({ name: z.string(), set: z.string() })).parse(JSON.parse(legacy));
      const mapped = values.reverse().map((entry) => champions.find((champion) => champion.name === entry.name && champion.setId === entry.set.replace("-", "."))?.id).filter((id): id is string => Boolean(id));
      return { game: { ...newGame(date, answerId), daily: { date, answerId, guesses: unique(mapped), completed: mapped.includes(answerId), mode: "standard" as const } }, recovered: false };
    } catch { /* Leave legacy data untouched. */ }
  }
  return { game: newGame(date, answerId), recovered: Boolean(raw) };
}

export function saveStoredGame(storage: Storage, game: PersistedGame) {
  storage.setItem(STORAGE_KEY, JSON.stringify(game));
}

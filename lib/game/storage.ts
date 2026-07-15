import { z } from "zod";
import type { Champion } from "./types";
import { daysBetweenUtc } from "./date";

export const STORAGE_KEY = "tftdle:v2";

const dailySchema = z.object({
  date: z.string(),
  answerId: z.string(),
  guesses: z.array(z.string()),
  completed: z.boolean(),
});

const statsSchema = z.object({
  startedDates: z.array(z.string()),
  completedDates: z.array(z.string()),
  totalGuesses: z.number().nonnegative(),
  bestGuessCount: z.number().positive().nullable(),
  distribution: z.record(z.string(), z.number().nonnegative()),
});

export const persistedGameSchema = z.object({ version: z.literal(2), daily: dailySchema, stats: statsSchema });
export type PersistedGame = z.infer<typeof persistedGameSchema>;
export type GameStats = PersistedGame["stats"];

export function emptyStats(): GameStats {
  return { startedDates: [], completedDates: [], totalGuesses: 0, bestGuessCount: null, distribution: {} };
}

export function newGame(date: string, answerId: string, stats: GameStats = emptyStats()): PersistedGame {
  return { version: 2, daily: { date, answerId, guesses: [], completed: false }, stats };
}

function unique(values: readonly string[]) { return [...new Set(values)]; }

export function recordGuess(game: PersistedGame, championId: string, isCorrect: boolean): PersistedGame {
  if (game.daily.completed || game.daily.guesses.includes(championId)) return game;
  const guesses = [...game.daily.guesses, championId];
  const firstGuess = game.daily.guesses.length === 0;
  const startedDates = firstGuess ? unique([...game.stats.startedDates, game.daily.date]) : game.stats.startedDates;
  if (!isCorrect) return { ...game, daily: { ...game.daily, guesses }, stats: { ...game.stats, startedDates } };
  const bucket = guesses.length >= 10 ? "10+" : String(guesses.length);
  return {
    ...game,
    daily: { ...game.daily, guesses, completed: true },
    stats: {
      ...game.stats,
      startedDates,
      completedDates: unique([...game.stats.completedDates, game.daily.date]),
      totalGuesses: game.stats.totalGuesses + guesses.length,
      bestGuessCount: game.stats.bestGuessCount === null ? guesses.length : Math.min(game.stats.bestGuessCount, guesses.length),
      distribution: { ...game.stats.distribution, [bucket]: (game.stats.distribution[bucket] ?? 0) + 1 },
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

export function loadStoredGame(storage: Storage, date: string, answerId: string, champions: readonly Champion[]) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = persistedGameSchema.parse(JSON.parse(raw));
      if (parsed.daily.date === date && parsed.daily.answerId === answerId) return { game: parsed, recovered: false };
      return { game: newGame(date, answerId, parsed.stats), recovered: false };
    } catch { storage.removeItem(STORAGE_KEY); }
  }

  const legacyKey = `${new Date(`${date}T12:00:00`).toLocaleDateString()}/guesses`;
  const legacy = storage.getItem(legacyKey);
  if (legacy) {
    try {
      const values = z.array(z.object({ name: z.string(), set: z.string() })).parse(JSON.parse(legacy));
      const mapped = values.reverse().map((entry) => champions.find((champion) => champion.name === entry.name && champion.setId === entry.set.replace("-", "."))?.id).filter((id): id is string => Boolean(id));
      return { game: { ...newGame(date, answerId), daily: { date, answerId, guesses: unique(mapped), completed: mapped.includes(answerId) } }, recovered: false };
    } catch { /* Leave legacy data untouched. */ }
  }
  return { game: newGame(date, answerId), recovered: Boolean(raw) };
}

export function saveStoredGame(storage: Storage, game: PersistedGame) {
  storage.setItem(STORAGE_KEY, JSON.stringify(game));
}

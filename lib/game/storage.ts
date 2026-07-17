import { z } from "zod";
import type { AssistMode, Champion, RosterMode } from "./types";
import { daysBetweenUtc } from "./date";

export const STORAGE_KEY = "tftdle:v4";
export const V3_STORAGE_KEY = "tftdle:v3";
export const V2_STORAGE_KEY = "tftdle:v2";

const assistModeSchema = z.enum(["normal", "easy"]);
const dailySchema = z.object({
  date: z.string(),
  answerId: z.string(),
  guesses: z.array(z.string()),
  completed: z.boolean(),
  assistMode: assistModeSchema,
});
const assistStatsSchema = z.object({
  startedDates: z.array(z.string()),
  completedDates: z.array(z.string()),
  totalGuesses: z.number().nonnegative(),
  bestGuessCount: z.number().positive().nullable(),
  distribution: z.record(z.string(), z.number().nonnegative()),
});
const rosterStatsSchema = z.object({
  startedDates: z.array(z.string()),
  completedDates: z.array(z.string()),
  byAssist: z.object({ normal: assistStatsSchema, easy: assistStatsSchema }),
});
const settingsSchema = z.object({ defaultAssistMode: assistModeSchema });

export const persistedGameSchema = z.object({
  version: z.literal(4),
  dailyByRoster: z.object({ standard: dailySchema, wild: dailySchema }),
  statsByRoster: z.object({ standard: rosterStatsSchema, wild: rosterStatsSchema }),
  settings: settingsSchema,
});
export type PersistedGame = z.infer<typeof persistedGameSchema>;
export type DailyGame = PersistedGame["dailyByRoster"][RosterMode];
export type GameStats = PersistedGame["statsByRoster"];
export type RosterStats = GameStats[RosterMode];
export type AssistStats = RosterStats["byAssist"][AssistMode];

const v3ModeSchema = z.enum(["standard", "easy"]);
const v3ModeStatsSchema = assistStatsSchema;
const v3GameSchema = z.object({
  version: z.literal(3),
  daily: z.object({ date: z.string(), answerId: z.string(), guesses: z.array(z.string()), completed: z.boolean(), mode: v3ModeSchema }),
  stats: z.object({
    startedDates: z.array(z.string()),
    completedDates: z.array(z.string()),
    byMode: z.object({ standard: v3ModeStatsSchema, easy: v3ModeStatsSchema }),
  }),
  settings: z.object({ defaultMode: v3ModeSchema }),
});

const v2StatsSchema = assistStatsSchema;
const v2GameSchema = z.object({
  version: z.literal(2),
  daily: z.object({ date: z.string(), answerId: z.string(), guesses: z.array(z.string()), completed: z.boolean() }),
  stats: v2StatsSchema,
});

export function emptyAssistStats(): AssistStats {
  return { startedDates: [], completedDates: [], totalGuesses: 0, bestGuessCount: null, distribution: {} };
}

export function emptyRosterStats(): RosterStats {
  return { startedDates: [], completedDates: [], byAssist: { normal: emptyAssistStats(), easy: emptyAssistStats() } };
}

export function emptyStats(): GameStats {
  return { standard: emptyRosterStats(), wild: emptyRosterStats() };
}

function newDaily(date: string, answerId: string, assistMode: AssistMode): DailyGame {
  return { date, answerId, guesses: [], completed: false, assistMode };
}

export function newGame(
  date: string,
  answerIds: Record<RosterMode, string>,
  statsByRoster: GameStats = emptyStats(),
  settings: PersistedGame["settings"] = { defaultAssistMode: "normal" },
): PersistedGame {
  return {
    version: 4,
    dailyByRoster: {
      standard: newDaily(date, answerIds.standard, settings.defaultAssistMode),
      wild: newDaily(date, answerIds.wild, settings.defaultAssistMode),
    },
    statsByRoster,
    settings,
  };
}

function unique(values: readonly string[]) { return [...new Set(values)]; }

export function setAssistMode(game: PersistedGame, rosterMode: RosterMode, assistMode: AssistMode): PersistedGame {
  const daily = game.dailyByRoster[rosterMode];
  if (daily.completed || daily.guesses.length > 0) return game;
  return {
    ...game,
    dailyByRoster: { ...game.dailyByRoster, [rosterMode]: { ...daily, assistMode } },
    settings: { defaultAssistMode: assistMode },
  };
}

export function recordGuess(game: PersistedGame, rosterMode: RosterMode, championId: string, isCorrect: boolean): PersistedGame {
  const daily = game.dailyByRoster[rosterMode];
  if (daily.completed || daily.guesses.includes(championId)) return game;
  const guesses = [...daily.guesses, championId];
  const rosterStats = game.statsByRoster[rosterMode];
  const assistStats = rosterStats.byAssist[daily.assistMode];
  const firstGuess = daily.guesses.length === 0;
  const startedDates = firstGuess ? unique([...rosterStats.startedDates, daily.date]) : rosterStats.startedDates;
  const assistStartedDates = firstGuess ? unique([...assistStats.startedDates, daily.date]) : assistStats.startedDates;
  const startedAssistStats = { ...assistStats, startedDates: assistStartedDates };
  const startedRosterStats: RosterStats = {
    ...rosterStats,
    startedDates,
    byAssist: { ...rosterStats.byAssist, [daily.assistMode]: startedAssistStats },
  };
  if (!isCorrect) return {
    ...game,
    dailyByRoster: { ...game.dailyByRoster, [rosterMode]: { ...daily, guesses } },
    statsByRoster: { ...game.statsByRoster, [rosterMode]: startedRosterStats },
  };
  const bucket = guesses.length >= 10 ? "10+" : String(guesses.length);
  const completedAssistStats: AssistStats = {
    ...startedAssistStats,
    completedDates: unique([...assistStats.completedDates, daily.date]),
    totalGuesses: assistStats.totalGuesses + guesses.length,
    bestGuessCount: assistStats.bestGuessCount === null ? guesses.length : Math.min(assistStats.bestGuessCount, guesses.length),
    distribution: { ...assistStats.distribution, [bucket]: (assistStats.distribution[bucket] ?? 0) + 1 },
  };
  return {
    ...game,
    dailyByRoster: { ...game.dailyByRoster, [rosterMode]: { ...daily, guesses, completed: true } },
    statsByRoster: {
      ...game.statsByRoster,
      [rosterMode]: {
        ...startedRosterStats,
        completedDates: unique([...rosterStats.completedDates, daily.date]),
        byAssist: { ...rosterStats.byAssist, [daily.assistMode]: completedAssistStats },
      },
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

function currentDaily(daily: DailyGame, date: string, answerId: string, defaultAssistMode: AssistMode) {
  return daily.date === date && daily.answerId === answerId ? daily : newDaily(date, answerId, defaultAssistMode);
}

function currentOrFresh(game: PersistedGame, date: string, answerIds: Record<RosterMode, string>): PersistedGame {
  return {
    ...game,
    dailyByRoster: {
      standard: currentDaily(game.dailyByRoster.standard, date, answerIds.standard, game.settings.defaultAssistMode),
      wild: currentDaily(game.dailyByRoster.wild, date, answerIds.wild, game.settings.defaultAssistMode),
    },
  };
}

function migrateV3(game: z.infer<typeof v3GameSchema>, date: string, answerIds: Record<RosterMode, string>): PersistedGame {
  const defaultAssistMode = game.settings.defaultMode === "easy" ? "easy" : "normal";
  const migrated = newGame(date, answerIds, {
    standard: emptyRosterStats(),
    wild: {
      startedDates: game.stats.startedDates,
      completedDates: game.stats.completedDates,
      byAssist: { normal: game.stats.byMode.standard, easy: game.stats.byMode.easy },
    },
  }, { defaultAssistMode });
  const legacyDaily: DailyGame = { ...game.daily, assistMode: game.daily.mode === "easy" ? "easy" : "normal" };
  return { ...migrated, dailyByRoster: { ...migrated.dailyByRoster, wild: currentDaily(legacyDaily, date, answerIds.wild, defaultAssistMode) } };
}

function migrateV2(game: z.infer<typeof v2GameSchema>, date: string, answerIds: Record<RosterMode, string>): PersistedGame {
  const migrated = newGame(date, answerIds, {
    standard: emptyRosterStats(),
    wild: { startedDates: game.stats.startedDates, completedDates: game.stats.completedDates, byAssist: { normal: game.stats, easy: emptyAssistStats() } },
  });
  const legacyDaily: DailyGame = { ...game.daily, assistMode: "normal" };
  return { ...migrated, dailyByRoster: { ...migrated.dailyByRoster, wild: currentDaily(legacyDaily, date, answerIds.wild, "normal") } };
}

export function loadStoredGame(storage: Storage, date: string, answerIds: Record<RosterMode, string>, champions: readonly Champion[]) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw) {
    try { return { game: currentOrFresh(persistedGameSchema.parse(JSON.parse(raw)), date, answerIds), recovered: false }; }
    catch { storage.removeItem(STORAGE_KEY); }
  }

  const v3Raw = storage.getItem(V3_STORAGE_KEY);
  if (v3Raw) {
    try { return { game: migrateV3(v3GameSchema.parse(JSON.parse(v3Raw)), date, answerIds), recovered: Boolean(raw) }; }
    catch { /* Continue to older migrations. */ }
  }

  const v2Raw = storage.getItem(V2_STORAGE_KEY);
  if (v2Raw) {
    try { return { game: migrateV2(v2GameSchema.parse(JSON.parse(v2Raw)), date, answerIds), recovered: Boolean(raw) }; }
    catch { /* Continue to the locale-key migration. */ }
  }

  const legacyKey = `${new Date(`${date}T12:00:00`).toLocaleDateString()}/guesses`;
  const legacy = storage.getItem(legacyKey);
  if (legacy) {
    try {
      const values = z.array(z.object({ name: z.string(), set: z.string() })).parse(JSON.parse(legacy));
      const mapped = values.reverse().map((entry) => champions.find((champion) => champion.name === entry.name && champion.setId === entry.set.replace("-", "."))?.id).filter((id): id is string => Boolean(id));
      const game = newGame(date, answerIds);
      return { game: { ...game, dailyByRoster: { ...game.dailyByRoster, wild: { ...game.dailyByRoster.wild, guesses: unique(mapped), completed: mapped.includes(answerIds.wild) } } }, recovered: Boolean(raw) };
    } catch { /* Leave legacy data untouched. */ }
  }
  return { game: newGame(date, answerIds), recovered: Boolean(raw) };
}

export function saveStoredGame(storage: Storage, game: PersistedGame) {
  storage.setItem(STORAGE_KEY, JSON.stringify(game));
}

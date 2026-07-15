const PUZZLE_EPOCH_UTC = Date.UTC(2022, 10, 14);
const DAY_MS = 86_400_000;

export function utcDateKey(date: Date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function utcDayNumber(dateKey: string) {
  const timestamp = Date.parse(`${dateKey}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) throw new Error(`Invalid UTC date: ${dateKey}`);
  return Math.floor((timestamp - PUZZLE_EPOCH_UTC) / DAY_MS);
}

export function puzzleNumber(dateKey: string) {
  return utcDayNumber(dateKey);
}

export function daysBetweenUtc(first: string, second: string) {
  return Math.round((Date.parse(`${second}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / DAY_MS);
}

export function millisecondsUntilNextUtc(date: Date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1) - date.getTime();
}

export function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

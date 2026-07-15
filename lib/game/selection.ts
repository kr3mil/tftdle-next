import type { CatalogManifest, CatalogSnapshot, Champion } from "./types";
import { daysBetweenUtc } from "./date";

function xmur3(value: string) {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = hash << 13 | hash >>> 19;
  }
  return () => {
    hash = Math.imul(hash ^ hash >>> 16, 2246822507);
    hash = Math.imul(hash ^ hash >>> 13, 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function mulberry32(seed: number) {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function snapshotForDate(manifest: CatalogManifest, dateKey: string): CatalogSnapshot {
  return manifest.pending && dateKey >= manifest.pending.effectiveFromUtc ? manifest.pending : manifest.active;
}

export function shuffledChampionIds(snapshot: CatalogSnapshot, cycle: number) {
  const ids = snapshot.champions.map((champion) => champion.id).sort();
  const random = mulberry32(xmur3(`${snapshot.checksum}:${snapshot.selectionSalt}:${cycle}`)());
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex]!, ids[index]!];
  }
  return ids;
}

export function answerForDate(manifest: CatalogManifest, dateKey: string): Champion {
  const snapshot = snapshotForDate(manifest, dateKey);
  const dayOffset = Math.max(0, daysBetweenUtc(snapshot.effectiveFromUtc, dateKey));
  const cycle = Math.floor(dayOffset / snapshot.champions.length);
  const index = dayOffset % snapshot.champions.length;
  const answerId = shuffledChampionIds(snapshot, cycle)[index];
  const answer = snapshot.champions.find((champion) => champion.id === answerId);
  if (!answer) throw new Error(`No answer for ${dateKey}`);
  return answer;
}

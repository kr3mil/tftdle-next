import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { catalogManifestSchema } from "../lib/data/schema";
import type { CatalogManifest, CatalogSnapshot, Champion, Trait } from "../lib/game/types";
import { answerForDate } from "../lib/game/selection";
import { CURRENT_ROSTER, HISTORICAL_ROSTERS, type RosterSource } from "./tft-sources";
import { EXCLUDED_API_NAMES, EXCLUDED_NAME_PATTERN, NAME_OVERRIDES } from "./tft-overrides";

type RawTrait = { apiName?: string; name?: string; icon?: string };
type RawChampion = {
  apiName?: string;
  name?: string;
  cost?: number;
  icon?: string;
  traits?: string[];
  stats?: { hp?: number; damage?: number; range?: number };
};
type RawSet = { champions?: RawChampion[]; traits?: RawTrait[] };
type RawCatalog = { sets?: Record<string, RawSet>; setData?: Array<RawSet & { mutator?: string }> };

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "data", "catalog.json");
const ASSETS = path.join(ROOT, "public", "generated");
const isPending = process.argv.includes("--pending");
const skipAssets = process.argv.includes("--skip-assets");

function slug(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function assetUrl(patch: string, assetPath: string) {
  const converted = assetPath.replace(/^ASSETS\//i, "game/assets/").replace(/\.(tex|dds)$/i, ".png").toLowerCase();
  return `https://raw.communitydragon.org/${patch}/${converted}`;
}

async function exists(file: string) {
  try { await access(file); return true; } catch { return false; }
}

async function downloadImage(url: string, target: string, fallback?: string) {
  if (await exists(target)) return;
  await mkdir(path.dirname(target), { recursive: true });
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    const input = Buffer.from(await response.arrayBuffer());
    await sharp(input).resize(128, 128, { fit: "cover" }).webp({ quality: 84 }).toFile(target);
  } catch (error) {
    if (fallback && await exists(fallback)) {
      await sharp(fallback).resize(128, 128, { fit: "cover" }).webp({ quality: 84 }).toFile(target);
      return;
    }
    console.warn(`Asset fallback used: ${error instanceof Error ? error.message : String(error)}`);
    await sharp({ create: { width: 128, height: 128, channels: 4, background: "#172231" } })
      .webp({ quality: 80 }).toFile(target);
  }
}

function selectSet(raw: RawCatalog, source: RosterSource): RawSet {
  if (source.mutator) {
    const selected = raw.setData?.find((entry) => entry.mutator === source.mutator);
    if (selected?.champions?.length) return selected;
  }
  const selected = raw.sets?.[source.setKey];
  if (!selected?.champions?.length) throw new Error(`No playable roster for ${source.setLabel} (${source.patch})`);
  return selected;
}

async function mapRoster(source: RosterSource): Promise<Champion[]> {
  const response = await fetch(`https://raw.communitydragon.org/${source.patch}/cdragon/tft/en_us.json`);
  if (!response.ok) throw new Error(`Failed ${source.patch}: ${response.status}`);
  const raw = await response.json() as RawCatalog;
  const roster = selectSet(raw, source);
  const traitByName = new Map((roster.traits ?? []).map((trait) => [trait.name, trait]));
  const champions: Champion[] = [];

  for (const unit of roster.champions ?? []) {
    const name = unit.name?.trim();
    const stats = unit.stats;
    if (!name || !unit.traits?.length || !stats?.hp || !stats.damage || stats.range == null || !unit.cost || unit.cost < 1) continue;
    if ((unit.apiName && EXCLUDED_API_NAMES.has(unit.apiName)) || EXCLUDED_NAME_PATTERN.test(name)) continue;

    const baseId = slug(unit.apiName || name);
    const id = `${source.setId}:${baseId}`;
    const championTarget = path.join(ASSETS, "champions", `${slug(source.setId)}-${baseId}.webp`);
    const legacyIcon = path.join(ROOT, "public", "icons", source.setId.replace(".", "-"), `${slug(name)}.png`);
    if (!skipAssets && unit.icon) await downloadImage(assetUrl(source.patch, unit.icon), championTarget, legacyIcon);

    const traits: Trait[] = [];
    for (const traitName of unit.traits) {
      const rawTrait = traitByName.get(traitName);
      const traitId = `${source.setId}:${slug(rawTrait?.apiName || traitName)}`;
      const traitTarget = path.join(ASSETS, "traits", `${slug(source.setId)}-${slug(rawTrait?.apiName || traitName)}.webp`);
      if (!skipAssets && rawTrait?.icon) await downloadImage(assetUrl(source.patch, rawTrait.icon), traitTarget);
      traits.push({ id: traitId, name: traitName, icon: `/generated/traits/${path.basename(traitTarget)}` });
    }

    champions.push({
      id,
      name: NAME_OVERRIDES[unit.apiName ?? ""] ?? name,
      setId: source.setId,
      setLabel: source.setLabel,
      setOrder: source.setOrder,
      traits,
      cost: unit.cost,
      health: Math.round(stats.hp),
      attackDamage: Math.round(stats.damage),
      range: stats.range,
      image: `/generated/champions/${path.basename(championTarget)}`,
      sourcePatch: source.patch,
    });
  }
  if (champions.length < 40 || champions.length > 140) throw new Error(`${source.setLabel} produced ${champions.length} playable units`);
  console.log(`${source.setLabel}: ${champions.length} champions from ${source.patch}`);
  return champions;
}

function nextUtcDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function makeSnapshot(champions: Champion[], effectiveFromUtc: string): CatalogSnapshot {
  const sorted = champions.sort((a, b) => a.setOrder - b.setOrder || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const checksum = createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
  return { id: `catalog-${checksum.slice(0, 12)}`, checksum, effectiveFromUtc, selectionSalt: checksum.slice(12, 28), champions: sorted };
}

function dateOffset(dateKey: string, offset: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function avoidRecentAnswer(snapshot: CatalogSnapshot, active: CatalogSnapshot) {
  const rosterModes = ["standard", "wild"] as const;
  const recentByRoster = Object.fromEntries(rosterModes.map((rosterMode) => [
    rosterMode,
    new Set(Array.from({ length: 30 }, (_, index) => answerForDate({ version: 2, active, pending: null }, dateOffset(snapshot.effectiveFromUtc, -(index + 1)), rosterMode).id)),
  ])) as Record<(typeof rosterModes)[number], Set<string>>;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = { ...snapshot, selectionSalt: `${snapshot.selectionSalt}-${attempt}` };
    const isSafe = rosterModes.every((rosterMode) => !recentByRoster[rosterMode].has(answerForDate({ version: 2, active, pending: candidate }, snapshot.effectiveFromUtc, rosterMode).id));
    if (isSafe) return candidate;
  }
  throw new Error("Could not select a pending-catalog salt without a recent Standard or Wild answer repeat");
}

async function main() {
  const champions = (await Promise.all([...HISTORICAL_ROSTERS, CURRENT_ROSTER].map(mapRoster))).flat();
  const ids = new Set<string>();
  for (const champion of champions) {
    if (ids.has(champion.id)) throw new Error(`Duplicate champion ID: ${champion.id}`);
    ids.add(champion.id);
  }
  const snapshot = makeSnapshot(champions, isPending ? (process.env.EFFECTIVE_FROM_UTC ?? nextUtcDate()) : "2022-11-14");
  let manifest: CatalogManifest = { version: 2, active: snapshot, pending: null };
  if (isPending && await exists(OUTPUT)) {
    const previous = catalogManifestSchema.parse(JSON.parse(await readFile(OUTPUT, "utf8"))) as CatalogManifest;
    const today = new Date().toISOString().slice(0, 10);
    const active = previous.pending && previous.pending.effectiveFromUtc <= today ? previous.pending : previous.active;
    manifest = { version: 2, active, pending: snapshot.checksum === active.checksum ? null : avoidRecentAnswer(snapshot, active) };
  }
  catalogManifestSchema.parse(manifest);
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${champions.length} champions (${snapshot.checksum.slice(0, 12)})`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

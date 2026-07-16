export type Trait = Readonly<{
  id: string;
  name: string;
  icon: string;
}>;

export type Champion = Readonly<{
  id: string;
  name: string;
  setId: string;
  setLabel: string;
  setOrder: number;
  traits: readonly Trait[];
  cost: number;
  health: number;
  attackDamage: number;
  range: number;
  image: string;
  sourcePatch: string;
}>;

export type CatalogSnapshot = Readonly<{
  id: string;
  checksum: string;
  effectiveFromUtc: string;
  selectionSalt: string;
  champions: readonly Champion[];
}>;

export type CatalogManifest = Readonly<{
  version: 2;
  active: CatalogSnapshot;
  pending: CatalogSnapshot | null;
}>;

export type MatchKind = "exact" | "partial" | "higher" | "lower" | "miss";
export type ClueKey = "set" | "traits" | "cost" | "health" | "attackDamage" | "range";
export type Comparison = Readonly<Record<ClueKey, MatchKind>>;
export type GameMode = "standard" | "easy";

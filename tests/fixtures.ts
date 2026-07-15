import type { CatalogSnapshot, Champion } from "@/lib/game/types";

export function champion(overrides: Partial<Champion> = {}): Champion {
  return {
    id: "1:ahri", name: "Ahri", setId: "1", setLabel: "Set 1", setOrder: 1,
    traits: [{ id: "1:wild", name: "Wild", icon: "/icon.svg" }], cost: 2, health: 450,
    attackDamage: 50, range: 4, image: "/icon.svg", sourcePatch: "9.21", ...overrides,
  };
}

export function snapshot(champions: Champion[]): CatalogSnapshot {
  return { id: "test", checksum: "a".repeat(64), effectiveFromUtc: "2022-11-14", selectionSalt: "test-salt", champions };
}

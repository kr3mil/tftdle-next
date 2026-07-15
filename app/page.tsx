import catalog from "@/data/catalog.json";
import { TftdleGame } from "@/components/game/tftdle-game";
import type { CatalogManifest } from "@/lib/game/types";

export default function HomePage() {
  return <TftdleGame manifest={catalog as CatalogManifest} />;
}

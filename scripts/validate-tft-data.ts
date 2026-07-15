import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { catalogManifestSchema } from "../lib/data/schema";

async function main() {
  const file = path.join(process.cwd(), "data", "catalog.json");
  const manifest = catalogManifestSchema.parse(JSON.parse(await readFile(file, "utf8")));

  for (const snapshot of [manifest.active, manifest.pending].filter((value) => value !== null)) {
    const checksum = createHash("sha256").update(JSON.stringify(snapshot.champions)).digest("hex");
    if (checksum !== snapshot.checksum) throw new Error(`Checksum mismatch for ${snapshot.id}`);
    const ids = new Set<string>();
    for (const champion of snapshot.champions) {
      if (ids.has(champion.id)) throw new Error(`Duplicate champion ID: ${champion.id}`);
      ids.add(champion.id);
      await access(path.join(process.cwd(), "public", champion.image));
      for (const trait of champion.traits) await access(path.join(process.cwd(), "public", trait.icon));
    }
    const sets = new Set(snapshot.champions.map((champion) => champion.setId));
    if (sets.size !== 24) throw new Error(`Expected 24 roster stages, found ${sets.size}`);
    console.log(`${snapshot.id}: ${snapshot.champions.length} champions across ${sets.size} roster stages`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

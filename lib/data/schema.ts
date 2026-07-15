import { z } from "zod";

export const traitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().startsWith("/"),
});

export const championSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  setId: z.string().min(1),
  setLabel: z.string().min(1),
  setOrder: z.number().positive(),
  traits: z.array(traitSchema).min(1),
  cost: z.number().positive(),
  health: z.number().positive(),
  attackDamage: z.number().positive(),
  range: z.number().nonnegative(),
  image: z.string().startsWith("/"),
  sourcePatch: z.string().min(1),
});

export const snapshotSchema = z.object({
  id: z.string().min(1),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  effectiveFromUtc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  selectionSalt: z.string().min(1),
  champions: z.array(championSchema).min(40),
});

export const catalogManifestSchema = z.object({
  version: z.literal(2),
  active: snapshotSchema,
  pending: snapshotSchema.nullable(),
});

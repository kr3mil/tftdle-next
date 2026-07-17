# TFTdle

TFTdle is a local-first daily Teamfight Tactics champion guessing game. Every player receives the same two UTC puzzles: Standard uses the latest TFT set, while Wild spans every historical and current standard roster.

## Game rules

Choose a roster mode, then use the clues to narrow down its independent daily answer:

- Standard is selected by default and includes only champions from the highest `setOrder` in the active catalog. Its redundant Set clue is hidden.
- Wild preserves the original all-set game, with every set-specific champion version in play.
- Both puzzles can be completed each day and maintain independent guesses, streaks, and statistics.

- Set, Cost, Health, Attack Damage, and Range show an exact match or whether the answer is higher or lower.
- Traits are exact only when the complete normalized trait set matches; any overlap is partial.
- Guesses are unlimited. Completing consecutive UTC puzzles builds a streak.
- Optional Easy mode removes champion versions that cannot reproduce all clues seen so far and summarizes the remaining possibilities. It is selected and locked independently for each roster before that puzzle's first guess.
- Progress and statistics stay in the browser. There are no accounts, APIs, or database.

The puzzle epoch remains 14 November 2022, so existing puzzle numbering continues.

## Architecture

- Next.js 16 App Router with a statically rendered Server Component shell.
- A focused Client Component island owns browser storage, the countdown, search, and game interaction.
- Tailwind CSS 4, Geist, and owned shadcn/ui primitives provide the design system.
- The generated catalog is validated with Zod and committed with locally cached champion and trait artwork.
- Vitest and Testing Library cover domain and component behavior; Playwright covers complete browser flows.

## Development

Node 24 and npm 11 are required.

```bash
npm ci
npm run dev
```

Quality commands:

```bash
npm run check       # data, ESLint, TypeScript, unit and component tests
npm run build       # production Next.js build
npm run test:e2e    # Playwright desktop and mobile flows
```

## TFT data updates

`scripts/sync-tft-data.ts` reads fixed CommunityDragon snapshots for historical roster stages and `latest` for the current standard set. It excludes non-standard modes and non-playable entities, normalizes values, downloads local web assets, and writes `data/catalog.json`. Standard automatically follows the highest roster order; Wild uses the full snapshot. Pending snapshot salts are checked against recent answers for both modes.

Run an initial active snapshot:

```bash
npm run data:sync
```

Generate a reviewable pending snapshot that activates on the next UTC day:

```bash
npm run data:sync -- --pending
```

The weekly `Update TFT data` workflow runs the pending update, validation, tests, and build before opening a pull request. It never auto-merges. When Riot launches a set, move the outgoing current source into the fixed historical roster list and update `CURRENT_ROSTER`.

Source-specific anomalies belong in `scripts/tft-overrides.ts`; do not hide broad filtering rules there.

## Persistence and troubleshooting

The current schema is stored under `tftdle:v4`. It stores separate Standard and Wild daily state and statistics, with Normal/Easy breakdowns inside each roster. Existing v3 all-set progress migrates into Wild, while Standard starts fresh; v2 and earlier locale-key games also migrate into Wild/Normal. Old keys are left untouched. Invalid current data is removed safely and both current-day games are reset without losing valid aggregate history.

If generation fails, check the source patch and mutator in `scripts/tft-sources.ts`. CommunityDragon occasionally renames mutators when a set transitions between stages.

## Deployment

The application is designed for Vercel preview and production deployments. Before promoting a release:

1. Run `npm run check`, `npm run build`, and the Chromium Playwright project.
2. Confirm the answer is identical with browser time zones set to UTC-8 and UTC+10.
3. Verify `tftdle.com` DNS, HTTPS, canonical metadata, `robots.txt`, sitemap, and the social preview.
4. Confirm there are no high or critical production audit findings.

## Legal

TFTdle is an independent fan project and is not endorsed by Riot Games. Teamfight Tactics and all related assets are trademarks of Riot Games, Inc. Products serving players should be registered and maintained in Riot's Developer Portal.

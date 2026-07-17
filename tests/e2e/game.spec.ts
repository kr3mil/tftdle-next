import { expect, test, type Page } from "@playwright/test";
import catalog from "../../data/catalog.json";
import { answerForDate, championsForRoster, snapshotForDate } from "../../lib/game/selection";
import { utcDateKey } from "../../lib/game/date";
import { possibleChampions } from "../../lib/game/easy";
import type { CatalogManifest, Champion, RosterMode } from "../../lib/game/types";

const manifest = catalog as CatalogManifest;

async function chooseChampion(page: Page, champion: Champion) {
  await page.getByRole("combobox", { name: "Choose a champion" }).click();
  await page.getByRole("combobox", { name: "Search champions" }).fill(`${champion.name} ${champion.setLabel}`);
  await page.locator("[cmdk-item]").filter({ hasText: champion.name }).filter({ hasText: champion.setLabel }).first().click();
}

async function selectRoster(page: Page, rosterMode: RosterMode) {
  await page.getByRole("button", { name: new RegExp(`^${rosterMode === "standard" ? "Standard" : "Wild"}`, "i") }).click();
}

test("completes and persists independent Standard and Wild puzzles", async ({ page }) => {
  const date = utcDateKey();
  const standardAnswer = answerForDate(manifest, date, "standard");
  const wildAnswer = answerForDate(manifest, date, "wild");
  await page.goto("/");

  await expect(page.getByRole("button", { name: /^Standard/i })).toHaveAttribute("aria-pressed", "true");
  await chooseChampion(page, standardAnswer);
  await expect(page.getByRole("status", { name: "Puzzle complete" })).toBeFocused();
  await expect(page.getByText(`You found ${standardAnswer.name}`)).toBeVisible();

  await selectRoster(page, "wild");
  await expect(page.getByRole("combobox", { name: "Choose a champion" })).toBeEnabled();
  await chooseChampion(page, wildAnswer);
  await expect(page.getByText(`You found ${wildAnswer.name}`)).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: /^Standard/i })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(`You found ${standardAnswer.name}`)).toBeVisible();
  await selectRoster(page, "wild");
  await expect(page.getByText(`You found ${wildAnswer.name}`)).toBeVisible();
});

test("recovers corrupted storage and remains usable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("tftdle:v4", "broken"));
  await page.goto("/");
  await expect(page.getByText(/saved data was damaged/i)).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Choose a champion" })).toBeEnabled();
});

test("keeps the champion picker within the viewport", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Choose a champion" }).click();

  const popover = page.locator('[data-slot="popover-content"]');
  const list = page.locator('[data-slot="command-list"]');
  await expect(popover).toBeVisible();
  const firstOption = page.locator("[cmdk-item]").first();
  await firstOption.hover();
  await expect(firstOption).toHaveAttribute("data-selected", "true");
  const selectedColors = await firstOption.evaluate((element) => ({
    item: getComputedStyle(element).color,
    metadata: getComputedStyle(element.querySelector('[data-slot="champion-metadata"]')!).color,
  }));
  expect(selectedColors.metadata).toBe(selectedColors.item);

  const box = await popover.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect.poll(() => list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
});

test("narrows Standard independently with Easy mode and hides the Set clue", async ({ page }) => {
  const date = utcDateKey();
  const snapshot = snapshotForDate(manifest, date);
  const pool = championsForRoster(snapshot, "standard");
  const answer = answerForDate(manifest, date, "standard");
  const wrong = pool.find((champion) => champion.id !== answer.id)!;
  const expected = possibleChampions(pool, [wrong], answer);

  await page.goto("/");
  const easyToggle = page.getByRole("switch", { name: "Easy mode" });
  await easyToggle.click();
  await chooseChampion(page, wrong);

  await expect(easyToggle).toBeDisabled();
  await expect(page.getByText(`${expected.length.toLocaleString()} possibilities remaining · ${(pool.length - expected.length).toLocaleString()} eliminated`)).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Set" })).toHaveCount(0);

  await selectRoster(page, "wild");
  const wildToggle = page.getByRole("switch", { name: "Easy mode" });
  await expect(wildToggle).toBeEnabled();
  await expect(wildToggle).toHaveAttribute("aria-checked", "false");
  const wildAnswer = answerForDate(manifest, date, "wild");
  const wildWrong = snapshot.champions.find((champion) => champion.id !== wildAnswer.id)!;
  await chooseChampion(page, wildWrong);
  await expect.poll(() => page.getByText("Set", { exact: true }).count()).toBeGreaterThan(0);

  await selectRoster(page, "standard");
  await chooseChampion(page, answer);
  await expect(page.getByText("Puzzle solved")).toBeVisible();
  await expect(page.getByText(/1 possibility remaining/i)).toHaveCount(0);
});

test("migrates the existing all-set daily into Wild", async ({ page }) => {
  const date = utcDateKey();
  const wildAnswer = answerForDate(manifest, date, "wild");
  const emptyModeStats = { startedDates: [], completedDates: [], totalGuesses: 0, bestGuessCount: null, distribution: {} };
  await page.addInitScript(({ currentDate, answerId, stats }) => {
    localStorage.setItem("tftdle:v3", JSON.stringify({
      version: 3,
      daily: { date: currentDate, answerId, guesses: [answerId], completed: true, mode: "standard" },
      stats: { startedDates: [currentDate], completedDates: [currentDate], byMode: { standard: { ...stats, startedDates: [currentDate], completedDates: [currentDate], totalGuesses: 1, bestGuessCount: 1, distribution: { "1": 1 } }, easy: stats } },
      settings: { defaultMode: "standard" },
    }));
  }, { currentDate: date, answerId: wildAnswer.id, stats: emptyModeStats });

  await page.goto("/");
  await expect(page.getByRole("button", { name: /^Standard/i })).toHaveAttribute("aria-pressed", "true");
  await selectRoster(page, "wild");
  await expect(page.getByText(`You found ${wildAnswer.name}`)).toBeVisible();
});

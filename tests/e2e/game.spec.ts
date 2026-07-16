import { expect, test } from "@playwright/test";
import catalog from "../../data/catalog.json";
import { answerForDate } from "../../lib/game/selection";
import { snapshotForDate } from "../../lib/game/selection";
import { utcDateKey } from "../../lib/game/date";
import { possibleChampions } from "../../lib/game/easy";
import type { CatalogManifest } from "../../lib/game/types";

test("completes and persists the daily puzzle", async ({ page }) => {
  const answer = answerForDate(catalog as CatalogManifest, utcDateKey());
  await page.goto("/");
  await page.getByRole("combobox", { name: "Choose a champion" }).click();
  await page.getByRole("combobox", { name: "Search champions" }).fill(`${answer.name} ${answer.setLabel}`);
  await page.locator("[cmdk-item]").filter({ hasText: answer.name }).filter({ hasText: answer.setLabel }).first().click();
  await expect(page.getByText(`You found ${answer.name}`)).toBeVisible();
  await page.reload();
  await expect(page.getByText(`You found ${answer.name}`)).toBeVisible();
});

test("recovers corrupted storage and remains usable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("tftdle:v3", "broken"));
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

  const box = await popover.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await expect.poll(() => list.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
});

test("narrows and persists an Easy-mode daily puzzle", async ({ page }) => {
  const manifest = catalog as CatalogManifest;
  const date = utcDateKey();
  const snapshot = snapshotForDate(manifest, date);
  const answer = answerForDate(manifest, date);
  const wrong = snapshot.champions.find((champion) => champion.id !== answer.id)!;
  const expected = possibleChampions(snapshot.champions, [wrong], answer);

  await page.goto("/");
  const easyToggle = page.getByRole("switch", { name: "Easy mode" });
  await easyToggle.click();
  await expect(easyToggle).toHaveAttribute("aria-checked", "true");

  await page.getByRole("combobox", { name: "Choose a champion" }).click();
  await page.getByRole("combobox", { name: "Search champions" }).fill(`${wrong.name} ${wrong.setLabel}`);
  await page.locator("[cmdk-item]").filter({ hasText: wrong.name }).filter({ hasText: wrong.setLabel }).first().click();

  await expect(easyToggle).toBeDisabled();
  await expect(page.getByText(`${expected.length.toLocaleString()} possibilities remaining · ${(snapshot.champions.length - expected.length).toLocaleString()} eliminated`)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("switch", { name: "Easy mode" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch", { name: "Easy mode" })).toBeDisabled();

  await page.getByRole("combobox", { name: "Choose a champion" }).click();
  await page.getByRole("combobox", { name: "Search champions" }).fill(`${answer.name} ${answer.setLabel}`);
  await page.locator("[cmdk-item]").filter({ hasText: answer.name }).filter({ hasText: answer.setLabel }).first().click();
  await expect(page.getByText(`You found ${answer.name}`)).toBeVisible();
  await expect(page.locator('[data-slot="badge"]').filter({ hasText: "Easy mode" })).toBeVisible();
});

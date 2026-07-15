import { expect, test } from "@playwright/test";
import catalog from "../../data/catalog.json";
import { answerForDate } from "../../lib/game/selection";
import { utcDateKey } from "../../lib/game/date";
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
  await page.addInitScript(() => localStorage.setItem("tftdle:v2", "broken"));
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

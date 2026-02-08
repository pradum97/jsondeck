import { test, expect } from "@playwright/test";

test("editor loads", async ({ page }) => {
  await page.goto("/editor");
  await expect(page.getByText("JSON Editor")).toBeVisible();
});

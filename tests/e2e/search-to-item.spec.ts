import { expect, test } from "@playwright/test";

test("search for an item from the homepage and land on its detail page", async ({
  page,
}) => {
  await page.goto("/");

  // "T4_BAG" as a query matches by item id and reliably ranks the base,
  // non-enchanted item first (ahead of its "@1".."@4" enchant variants).
  await page.getByPlaceholder(/rechercher un objet/i).fill("T4_BAG");

  const result = page.getByRole("listitem").first().getByRole("button");
  await result.waitFor({ state: "visible" });
  await result.click();

  await expect(page).toHaveURL(/\/items\/T4_BAG$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Adept's Bag"
  );
  await expect(page.getByText("Prix actuels")).toBeVisible();
});

test("price check page lets a user add an item and see a price table", async ({
  page,
}) => {
  await page.goto("/prices");

  await page.getByPlaceholder(/ajouter un objet/i).fill("T4_BAG");

  const result = page.getByRole("listitem").first().getByRole("button");
  await result.waitFor({ state: "visible" });
  await result.click();

  await expect(page.getByText("Adept's Bag", { exact: false })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});

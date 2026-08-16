import { expect, test } from "@playwright/test";

test("toggling a favorite on an item page shows it on the homepage", async ({
  page,
}) => {
  await page.goto("/items/T4_BAG");

  const favoriteButton = page.getByRole("button", {
    name: /ajouter aux favoris/i,
  });
  await favoriteButton.click();
  await expect(page.getByRole("button", { name: /favori/i })).toBeVisible();

  await page.goto("/");

  const favoritesSection = page.locator("h2", { hasText: "Favoris" }).locator("..");
  await expect(favoritesSection.getByText("Adept's Bag")).toBeVisible();

  await favoritesSection
    .getByRole("button", { name: /retirer adept's bag des favoris/i })
    .click();
  await expect(
    favoritesSection.getByText("Aucun favori pour l'instant")
  ).toBeVisible();
});

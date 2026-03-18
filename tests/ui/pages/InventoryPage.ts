import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class InventoryPage extends BasePage {
  readonly productCards: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  private getCard(productName: string): Locator {
    return this.productCards.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', {
        hasText: productName,
      }),
    });
  }

  async verifyOnInventory(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.headerTitle).toHaveText("Products");
  }

  async addItemByName(productName: string): Promise<void> {
    await this.getCard(productName).locator("button", { hasText: "Add to cart" }).click();
  }

  async removeItemByName(productName: string): Promise<void> {
    await this.getCard(productName).locator("button", { hasText: "Remove" }).click();
  }

  async addMultipleItems(names: string[]): Promise<void> {
    for (const name of names) {
      await this.addItemByName(name);
    }
  }

  async selectSortOption(value: string): Promise<void> {
    await this.sortDropdown.selectOption(value);
  }

  async collectProductNames(): Promise<string[]> {
    return this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  async getProductDescription(productName: string): Promise<string> {
    return ((await this.getCard(productName).locator('[data-test="inventory-item-desc"]').textContent()) ?? "").trim();
  }

  async getProductPrice(productName: string): Promise<number> {
    const text = (await this.getCard(productName).locator('[data-test="inventory-item-price"]').textContent()) ?? "";
    return parseFloat(text.replace("$", ""));
  }

  async collectProductPrices(): Promise<number[]> {
    const raw = await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return raw.map((p) => parseFloat(p.replace("$", "")));
  }

  async clickProductLink(productName: string): Promise<void> {
    await this.page
      .locator('[data-test="inventory-item-name"]', { hasText: productName })
      .click();
  }

  async verifyAddToCartButtonVisible(productName: string): Promise<void> {
    await expect(this.getCard(productName).locator("button", { hasText: "Add to cart" })).toBeVisible();
  }

  async verifyRemoveButtonVisible(productName: string): Promise<void> {
    await expect(this.getCard(productName).locator("button", { hasText: "Remove" })).toBeVisible();
  }

  async verifyAllProductsShowAddToCart(): Promise<void> {
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      await expect(
        this.productCards.nth(i).locator("button", { hasText: "Add to cart" })
      ).toBeVisible();
    }
  }

  async getProductImageSrc(productName: string): Promise<string | null> {
    return this.getCard(productName).locator("img").getAttribute("src");
  }
}

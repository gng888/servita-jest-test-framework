import { type Page, type Locator, expect } from "@playwright/test";

export class ProductDetailPage {
  readonly itemName: Locator;
  readonly itemDescription: Locator;
  readonly itemPrice: Locator;
  readonly itemImage: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backButton: Locator;

  constructor(private readonly page: Page) {
    this.itemName = page.locator('[data-test="inventory-item-name"]');
    this.itemDescription = page.locator('[data-test="inventory-item-desc"]');
    this.itemPrice = page.locator('[data-test="inventory-item-price"]');
    this.itemImage = page.locator(".inventory_details_img");
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.removeButton = page.locator('[data-test="remove"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async verifyProductDetails(name: string): Promise<void> {
    await expect(this.itemName).toHaveText(name);
    await expect(this.itemDescription).not.toBeEmpty();
    await expect(this.itemPrice).toBeVisible();
    await expect(this.itemImage).toBeVisible();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}

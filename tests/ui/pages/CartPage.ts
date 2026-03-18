import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator(
      '[data-test="continue-shopping"]'
    );
  }

  async verifyOnCart(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.headerTitle).toHaveText("Your Cart");
  }

  async verifyItemCount(expected: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(expected);
  }

  async verifyItemPresent(productName: string): Promise<void> {
    const name = this.page.locator('[data-test="inventory-item-name"]', {
      hasText: productName,
    });
    await expect(name).toBeVisible();
  }

  async verifyAllItemsPresent(names: string[]): Promise<void> {
    for (const n of names) {
      await this.verifyItemPresent(n);
    }
  }

  async verifyAllItemPrices(expected: { name: string; price: number }[]): Promise<void> {
    await Promise.all(
      expected.map(async ({ name, price }) => {
        const card = this.cartItems.filter({
          has: this.page.locator('[data-test="inventory-item-name"]', { hasText: name }),
        });
        const text = (await card.locator('[data-test="inventory-item-price"]').textContent()) ?? "";
        expect(parseFloat(text.replace("$", ""))).toBe(price);
      })
    );
  }

  async verifyAllItemDescriptions(expected: { name: string; desc: string }[]): Promise<void> {
    await Promise.all(
      expected.map(async ({ name, desc }) => {
        const card = this.cartItems.filter({
          has: this.page.locator('[data-test="inventory-item-name"]', { hasText: name }),
        });
        const text = (await card.locator('[data-test="inventory-item-desc"]').textContent()) ?? "";
        expect(text.trim()).toBe(desc);
      })
    );
  }

  async verifyAllItemsHaveRemoveButton(): Promise<void> {
    const count = await this.cartItems.count();
    for (let i = 0; i < count; i++) {
      await expect(
        this.cartItems.nth(i).locator("button", { hasText: "Remove" })
      ).toBeVisible();
    }
  }

  async removeItem(productName: string): Promise<void> {
    const card = this.cartItems.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', {
        hasText: productName,
      }),
    });
    await card.locator("button", { hasText: "Remove" }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async returnToShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async collectItemNames(): Promise<string[]> {
    const nameLocators = this.cartItems.locator('[data-test="inventory-item-name"]');
    return nameLocators.allTextContents();
  }

  async getFirstCartItemDetails(): Promise<{
    name: string;
    price: string;
    desc: string;
  }> {
    const first = this.cartItems.first();
    const name = (await first.locator('[data-test="inventory-item-name"]').textContent()) ?? "";
    const price = (await first.locator('[data-test="inventory-item-price"]').textContent()) ?? "";
    const descEl = first.locator('[data-test="inventory-item-desc"]');
    const desc = (await descEl.textContent()) ?? "";
    return { name: name.trim(), price: price.trim(), desc: desc.trim() };
  }
}

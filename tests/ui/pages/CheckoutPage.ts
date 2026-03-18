import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CheckoutPage extends BasePage {
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly postalCodeField: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorBanner: Locator;
  readonly summaryItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly completeBody: Locator;
  readonly backToProductsButton: Locator;
  readonly completeImage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameField = page.locator('[data-test="firstName"]');
    this.lastNameField = page.locator('[data-test="lastName"]');
    this.postalCodeField = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorBanner = page.locator('[data-test="error"]');
    this.summaryItems = page.locator('[data-test="inventory-item"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeBody = page.locator('[data-test="complete-text"]');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    this.completeImage = page.locator('[data-test="pony-express"]');
  }

  async verifyCheckoutYourInformationHeading(): Promise<void> {
    await expect(this.headerTitle).toHaveText("Checkout: Your Information");
  }

  // Accepts a ShippingInfo object generateShipping() can be passed directly
  // or a specific literal { first: "", last: "Doe", zip: "12345" } for validation tests.
  async enterShippingInfo(shipping: {
    first: string;
    last: string;
    zip: string;
  }): Promise<void> {
    await this.firstNameField.fill(shipping.first);
    await this.lastNameField.fill(shipping.last);
    await this.postalCodeField.fill(shipping.zip);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async verifyOverviewVisible(): Promise<void> {
    await expect(this.headerTitle).toHaveText("Checkout: Overview");
  }

  async verifyItemCount(expected: number): Promise<void> {
    await expect(this.summaryItems).toHaveCount(expected);
  }

  async verifyItemPresent(productName: string): Promise<void> {
    const name = this.page.locator('[data-test="inventory-item-name"]', {
      hasText: productName,
    });
    await expect(name).toBeVisible();
  }

  async verifyAllItemsPresent(productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.verifyItemPresent(name);
    }
  }

  async verifyAllItemPrices(expected: { name: string; price: number }[]): Promise<void> {
    await Promise.all(expected.map(({ name, price }) => this.verifyItemPrice(name, price)));
  }

  async verifyAllItemDescriptions(expected: { name: string; desc: string }[]): Promise<void> {
    await Promise.all(
      expected.map(async ({ name, desc }) => {
        const card = this.summaryItems.filter({
          has: this.page.locator('[data-test="inventory-item-name"]', { hasText: name }),
        });
        const text = (await card.locator('[data-test="inventory-item-desc"]').textContent()) ?? "";
        expect(text.trim()).toBe(desc);
      })
    );
  }

  async verifyItemPrice(productName: string, expectedPrice: number): Promise<void> {
    const card = this.summaryItems.filter({
      has: this.page.locator('[data-test="inventory-item-name"]', {
        hasText: productName,
      }),
    });
    const priceText = (await card.locator('[data-test="inventory-item-price"]').textContent()) ?? "";
    const price = parseFloat(priceText.replace("$", ""));
    expect(price).toBe(expectedPrice);
  }

  async verifyTotalsVisible(): Promise<void> {
    await expect(this.subtotalLabel).toBeVisible();
    await expect(this.taxLabel).toBeVisible();
    await expect(this.totalLabel).toBeVisible();
  }

  // Label format is e.g. "Item total: $29.99", "Tax: $2.40", "Total: $32.39"
  async getTotals(): Promise<{ subtotal: number; tax: number; total: number }> {
    const parse = (text: string) => parseFloat(text.replace(/[^0-9.]/g, ""));
    const subtotal = parse((await this.subtotalLabel.textContent()) ?? "");
    const tax = parse((await this.taxLabel.textContent()) ?? "");
    const total = parse((await this.totalLabel.textContent()) ?? "");
    return { subtotal, tax, total };
  }

  async completeOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async verifyOrderSuccess(): Promise<void> {
    await expect(this.headerTitle).toHaveText("Checkout: Complete!");
    await expect(this.completeHeader).toHaveText(
      "Thank you for your order!"
    );
    await expect(this.completeBody).toBeVisible();
  }

  async verifyErrorContains(text: string): Promise<void> {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toContainText(text);
  }

  async goBackToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}

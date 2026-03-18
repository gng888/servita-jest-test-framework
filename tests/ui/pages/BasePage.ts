import { type Page, type Locator, expect } from "@playwright/test";

// Shared elements visible on every authenticated SauceDemo page:
// page header, cart icon/badge, burger menu, and footer.
export abstract class BasePage {
  readonly headerTitle: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly burgerButton: Locator;
  readonly footerText: Locator;
  readonly twitterLink: Locator;
  readonly facebookLink: Locator;
  readonly linkedinLink: Locator;
  readonly footerRobot: Locator;

  constructor(protected readonly page: Page) {
    this.headerTitle = page.locator('[data-test="title"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerButton = page.locator("#react-burger-menu-btn");
    this.footerText = page.locator('[data-test="footer-copy"]');
    this.twitterLink = page.locator('[data-test="social-twitter"]');
    this.facebookLink = page.locator('[data-test="social-facebook"]');
    this.linkedinLink = page.locator('[data-test="social-linkedin"]');
    this.footerRobot = page.locator("footer img");
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async verifyCartCount(expected: number): Promise<void> {
    await expect(this.cartBadge).toHaveText(String(expected));
  }

  async verifyCartBadgeHidden(): Promise<void> {
    await expect(this.cartBadge).not.toBeVisible();
  }

  async openBurgerMenu(): Promise<void> {
    await this.burgerButton.click();
  }
}

import { type Page, type Locator, expect } from "@playwright/test";

export class SidebarMenu {
  readonly menuWrap: Locator;
  readonly closeButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetLink: Locator;

  constructor(private readonly page: Page) {
    this.menuWrap = page.locator(".bm-menu-wrap");
    this.closeButton = page.locator("#react-burger-cross-btn");
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetLink = page.locator('[data-test="reset-sidebar-link"]');
  }

  async verifyOpen(): Promise<void> {
    await expect(this.menuWrap).toHaveAttribute("aria-hidden", "false");
  }

  async verifyClosed(): Promise<void> {
    await expect(this.menuWrap).toHaveAttribute("aria-hidden", "true");
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async clickAllItems(): Promise<void> {
    await this.allItemsLink.click();
  }

  async clickAbout(): Promise<void> {
    await this.aboutLink.click();
  }

  async clickLogout(): Promise<void> {
    await this.logoutLink.click();
  }

  async clickResetAppState(): Promise<void> {
    await this.resetLink.click();
  }

  async verifyLinksVisible(): Promise<void> {
    await expect(this.allItemsLink).toBeVisible();
    await expect(this.aboutLink).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
    await expect(this.resetLink).toBeVisible();
  }
}

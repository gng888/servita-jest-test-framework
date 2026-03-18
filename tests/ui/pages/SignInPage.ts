import { type Page, type Locator, expect } from "@playwright/test";

export class SignInPage {
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;
  readonly errorCloseButton: Locator;
  readonly loginLogo: Locator;
  readonly credentialsList: Locator;

  constructor(private readonly page: Page) {
    this.usernameField = page.locator('[data-test="username"]');
    this.passwordField = page.locator('[data-test="password"]');
    this.submitButton = page.locator('[data-test="login-button"]');
    this.errorBanner = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
    this.loginLogo = page.locator(".login_logo");
    this.credentialsList = page.locator("#login_credentials");
  }

  async open(): Promise<void> {
    await this.page.goto("/");
  }

  async authenticate(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async verifyVisible(): Promise<void> {
    await expect(this.usernameField).toBeVisible();
    await expect(this.passwordField).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async verifyNotVisible(): Promise<void> {
    await expect(this.submitButton).not.toBeVisible();
  }

  async verifyErrorContains(text: string): Promise<void> {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toContainText(text);
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }
}

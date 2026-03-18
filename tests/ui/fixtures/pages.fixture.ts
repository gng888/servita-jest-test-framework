import { test as base, expect } from "@playwright/test";
import { SignInPage } from "../pages/SignInPage";
import { InventoryPage } from "../pages/InventoryPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { SidebarMenu } from "../pages/SidebarMenu";

// Fixture: each spec gets these page objects automatically – no manual new SignInPage(page), can be used across specs.
type Pages = {
  signIn: SignInPage;
  inventory: InventoryPage;
  cart: CartPage;
  checkout: CheckoutPage;
  sidebar: SidebarMenu;
};

export const test = base.extend<Pages>({
  signIn: async ({ page }, use) => {
    await use(new SignInPage(page));
  },
  inventory: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  sidebar: async ({ page }, use) => {
    await use(new SidebarMenu(page));
  },
});

export { expect };

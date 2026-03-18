import { test, expect } from "../fixtures/pages.fixture";
import { getLoginUser } from "../fixtures/test-data/users";

// Tag: @auth – run with npm run test:ui:auth
test.describe("Auth journey @auth", () => {
  test.describe("Validate success login", () => {
    test.beforeEach(async ({ signIn }) => {
      await signIn.open();
      const user = getLoginUser("standard");
      await signIn.authenticate(user.username, user.password);
    });

    test("should allow login successfully", async ({ signIn }) => {
      await signIn.verifyNotVisible();
    });

    test("should land on Products page after login", async ({ inventory }) => {
      await inventory.verifyOnInventory();
    });

    test("should allow user to log out successfully", async ({
      inventory,
      sidebar,
      signIn,
    }) => {
      await inventory.verifyOnInventory();
      await inventory.openBurgerMenu();
      await sidebar.clickLogout();
      await signIn.verifyVisible();
    });
  });

  test.describe("Validate invalid login", () => {
    test.beforeEach(async ({ signIn }) => {
      await signIn.open();
    });

    test("should reject locked-out user with error message", async ({
      signIn,
    }) => {
      const user = getLoginUser("locked");
      await signIn.authenticate(user.username, user.password);
      await signIn.verifyErrorContains(
        "Sorry, this user has been locked out"
      );
    });

    test("should reject invalid credentials", async ({ signIn }) => {
      await signIn.authenticate("unknown_user", "wrong_password");
      await signIn.verifyErrorContains(
        "Username and password do not match any user in this service"
      );
    });

    test("should not allow access to inventory without authentication", async ({
      page,
    }) => {
      await page.goto("/inventory.html");
      const errorEl = page.locator('[data-test="error"]');
      await expect(errorEl).toBeVisible();
      await expect(errorEl).toContainText(
        "You can only access '/inventory.html' when you are logged in"
      );
    });
  });
});

import { test, expect } from "../fixtures/pages.fixture";
import { getLoginUser } from "../fixtures/test-data/users";

// Negative testing – each describe block logs in with a known-broken account
// and asserts what correct behaviour looks like. All tests are expected to FAIL
test.describe("Negative testing – problematic users @negativetests", () => {

  // Using problem_user credentials – this account has several broken features:
  // sorting does nothing to the listings, all product images render the same wrong image,
  // and the last name field silently discards input so checkout always errors.
  test.describe("Problematic User", () => {
    test.beforeEach(async ({ signIn }) => {
      await signIn.open();
      const user = getLoginUser("problem");
      await signIn.authenticate(user.username, user.password);
    });

    // Sort Z-A is selected but the product list never changes order
    test("should sort products Z-A when Z-A is selected", async ({
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      await inventory.selectSortOption("za");
      const names = await inventory.collectProductNames();
      const reversed = [...names].sort((a, b) => b.localeCompare(a));
      expect(names).toEqual(reversed);
    });

    // Price low→high sort is selected but prices stay in their original order
    test("should sort products by price low to high when selected", async ({
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      await inventory.selectSortOption("lohi");
      const prices = await inventory.collectProductPrices();
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    // Price high→low sort is selected but prices stay in their original order
    test("should sort products by price high to low when selected", async ({
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      await inventory.selectSortOption("hilo");
      const prices = await inventory.collectProductPrices();
      const sorted = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sorted);
    });

    // Every product card renders the exact same image – none are unique
    test("should display a unique image for each product", async ({
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      const backpackSrc = await inventory.getProductImageSrc("Sauce Labs Backpack");
      const boltSrc = await inventory.getProductImageSrc("Sauce Labs Bolt T-Shirt");
      expect(backpackSrc).not.toBe(boltSrc);
    });

    // The last name field silently drops whatever is typed – clicking Continue
    // always throws "Last Name is required" and checkout is permanently blocked
    test("should proceed to checkout overview after filling all shipping fields", async ({
      inventory,
      cart,
      checkout,
    }) => {
      await inventory.addItemByName("Sauce Labs Backpack");
      await inventory.goToCart();
      await cart.proceedToCheckout();
      await checkout.verifyCheckoutYourInformationHeading();
      await checkout.enterShippingInfo({ first: "John", last: "Smith", zip: "12345" });
      await checkout.clickContinue();
      await checkout.verifyOverviewVisible();
    });
  });

  // Using performance_glitch_user credentials – login and navigation have an
  // intentional delay injected, making the app feel broken under normal use.
  test.describe("Performance Glitch User", () => {

    // Login completes eventually but takes several seconds longer than it should
    test("should complete login within an acceptable time", async ({
      signIn,
      inventory,
    }) => {
      await signIn.open();
      const user = getLoginUser("glitch");
      const start = Date.now();
      await signIn.authenticate(user.username, user.password);
      await inventory.verifyOnInventory();
      const elapsed = Date.now() - start;
      // Anything over 1s would be unacceptable in a real app – glitch user far exceeds this
      expect(elapsed).toBeLessThan(1000);
    });
  });

  // Using error_user credentials – certain UI interactions fire but have no effect,
  // like clicking Add/Remove on the inventory page which leaves the cart unchanged.
  test.describe("Error User", () => {
    test.beforeEach(async ({ signIn }) => {
      await signIn.open();
      const user = getLoginUser("error");
      await signIn.authenticate(user.username, user.password);
    });

    // Remove is clicked on the inventory page but the cart badge stays at 1
    test("should clear the cart badge after removing the item from inventory", async ({
      inventory,
    }) => {
      await inventory.addItemByName("Sauce Labs Backpack");
      await inventory.verifyCartCount(1);
      await inventory.removeItemByName("Sauce Labs Backpack");
      await inventory.verifyCartBadgeHidden();
    });

    // error_user's cart doesnt add cart proeprly, the adding feature is broken.
    // All 6 items are added, then the cart names are compared against the inventory names –
    // any mismatch exposes the bug and cart has not added them properly.
    test("should show the correct product and quantity in the cart after adding all items", async ({
      inventory,
      cart,
    }) => {
      const allItems = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
        "Sauce Labs Fleece Jacket",
        "Sauce Labs Onesie",
        "Test.allTheThings() T-Shirt (Red)",
      ];
      await inventory.addMultipleItems(allItems);
      // Badge should reflect all 6 items were added
      await inventory.verifyCartCount(6);
      await inventory.goToCart();
      const cartNames = await cart.collectItemNames();
      expect(cartNames.sort()).toEqual([...allItems].sort());
    });
  });

  // Using visual_user credentials – product images are swapped or incorrect,
  // so the same product looks different depending on which account is logged in.
  // Components on the page seems to also be all de-arranged, non functional accessibility scan can validate this further.
  test.describe("Visual User", () => {

    // The Sauce Labs Backpack shows a different image for visual_user vs standard_user
    test("should display the same product images as standard_user", async ({
      signIn,
      inventory,
      page,
    }) => {
      // First capture the correct image as standard_user
      await signIn.open();
      await signIn.authenticate(
        getLoginUser("standard").username,
        getLoginUser("standard").password
      );
      const standardSrc = await inventory.getProductImageSrc("Sauce Labs Backpack");

      // Log in as visual_user and grab the same product's image
      await page.goto("/");
      await signIn.authenticate(
        getLoginUser("visual").username,
        getLoginUser("visual").password
      );
      const visualSrc = await inventory.getProductImageSrc("Sauce Labs Backpack");

      expect(visualSrc).toBe(standardSrc);
    });
  });
});

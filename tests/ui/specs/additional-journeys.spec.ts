import { test, expect } from "../fixtures/pages.fixture";
import { getLoginUser } from "../fixtures/test-data/users";
import { generateShipping } from "../fixtures/test-data/shipping";
import { ProductDetailPage } from "../pages/ProductDetailPage";

test.describe("Additional journeys", () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn.open();
    const user = getLoginUser("standard");
    await signIn.authenticate(user.username, user.password);
  });

  test.describe("Sorting products", () => {
    test("should change product order when sorting A-Z and low-to-high", async ({
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      await inventory.selectSortOption("az");
      const namesAz = await inventory.collectProductNames();
      // Expected ordering (A–Z); [...namesAz] copies so we don't mutate. localeCompare = alphabetical.
      const sortedAz = [...namesAz].sort((a, b) => a.localeCompare(b));
      expect(namesAz).toEqual(sortedAz);

      // Low–high: collect displayed prices and assert they match ascending order
      await inventory.selectSortOption("lohi");
      const prices = await inventory.collectProductPrices();
      // Expected ordering (ascending); [...prices] copies so we don't mutate. a - b = low to high.
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });
  });

  test.describe("Burger menu", () => {
    test("should open and close menu and allow logout to sign-in", async ({
      inventory,
      sidebar,
      signIn,
    }) => {
      await inventory.openBurgerMenu();
      await sidebar.verifyOpen();
      await sidebar.close();
      await sidebar.verifyClosed();

      await inventory.openBurgerMenu();
      await sidebar.clickLogout();
      await signIn.verifyVisible();
    });

    test("should navigate from cart back to inventory via All Items", async ({
      inventory,
      cart,
      sidebar,
    }) => {
      await inventory.addItemByName("Sauce Labs Backpack");
      await inventory.goToCart();
      await cart.verifyOnCart();

      await inventory.openBurgerMenu();
      await sidebar.clickAllItems();
      await inventory.verifyOnInventory();
    });

    test("should clear cart badge via Reset App State", async ({
      inventory,
      sidebar,
    }) => {
      await inventory.addItemByName("Sauce Labs Backpack");
      await inventory.addItemByName("Sauce Labs Bike Light");
      await inventory.verifyCartCount(2);

      await inventory.openBurgerMenu();
      await sidebar.clickResetAppState();
      await sidebar.close();
      await inventory.verifyCartBadgeHidden();
    });

    test("should have About link redirecting to saucelabs.com", async ({
      inventory,
      sidebar,
    }) => {
      await inventory.openBurgerMenu();
      const href = await sidebar.aboutLink.getAttribute("href");
      expect(href).toBe("https://saucelabs.com/");
    });
  });

  test.describe("Routing and titles", () => {
    test("should show correct URL and page title on inventory", async ({
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      await expect(inventory.headerTitle).toHaveText("Products");
    });

    test("should show correct URL and page title on cart", async ({
      page,
      inventory,
      cart,
    }) => {
      await inventory.goToCart();
      await expect(page).toHaveURL(/cart\.html/);
      await expect(cart.headerTitle).toHaveText("Your Cart");
    });

    test("should return to inventory when continuing shopping from cart", async ({
      inventory,
      cart,
    }) => {
      await inventory.goToCart();
      await cart.verifyOnCart();
      await cart.returnToShopping();
      await inventory.verifyOnInventory();
    });
  });

  test.describe("Browsing inventory and cart interactions", () => {
    test("should show product list and allow opening detail and returning to inventory", async ({
      page,
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      await expect(inventory.productCards).toHaveCount(6);

      await inventory.clickProductLink("Sauce Labs Backpack");
      const detail = new ProductDetailPage(page);
      await detail.verifyProductDetails("Sauce Labs Backpack");
      await expect(page).toHaveURL(/inventory-item\.html\?id=/);

      await detail.goBack();
      await inventory.verifyOnInventory();
    });

    test("should show Add to cart button for all 6 products on the inventory page", async ({
      inventory,
    }) => {
      await inventory.verifyOnInventory();
      await expect(inventory.productCards).toHaveCount(6);
      // Every product should start in an empty cart state with Add to cart visible
      await inventory.verifyAllProductsShowAddToCart();
    });

    test("should switch button to Remove after adding an item to cart", async ({
      inventory,
    }) => {
      const itemName = "Sauce Labs Backpack";
      // Before adding – Add to cart is visible, Remove is not
      await inventory.verifyAddToCartButtonVisible(itemName);
      await inventory.addItemByName(itemName);
      // After adding – button flips to Remove and cart badge appears
      await inventory.verifyRemoveButtonVisible(itemName);
      await inventory.verifyCartCount(1);
    });

    test("should switch button back to Add to cart after removing an item from inventory", async ({
      inventory,
    }) => {
      const itemName = "Sauce Labs Backpack";
      await inventory.addItemByName(itemName);
      await inventory.verifyRemoveButtonVisible(itemName);
      // Clicking Remove on the inventory page should flip the button back and clear the badge
      await inventory.removeItemByName(itemName);
      await inventory.verifyAddToCartButtonVisible(itemName);
      await inventory.verifyCartBadgeHidden();
    });

    test("should decrease cart badge count when an item is removed from the cart", async ({
      inventory,
      cart,
    }) => {
      await inventory.addItemByName("Sauce Labs Backpack");
      await inventory.addItemByName("Sauce Labs Bike Light");
      await inventory.verifyCartCount(2);

      await inventory.goToCart();
      await cart.verifyItemCount(2);

      // Remove one item from the cart – badge should drop from 2 to 1
      await cart.removeItem("Sauce Labs Backpack");
      await cart.verifyItemCount(1);
      await inventory.verifyCartCount(1);

      // Remove the last item – badge should disappear entirely
      await cart.removeItem("Sauce Labs Bike Light");
      await cart.verifyItemCount(0);
      await inventory.verifyCartBadgeHidden();
    });

    test("should show a Remove button for every item present in the cart", async ({
      inventory,
      cart,
    }) => {
      const items = [
        "Sauce Labs Backpack",
        "Sauce Labs Bike Light",
        "Sauce Labs Bolt T-Shirt",
      ];
      await inventory.addMultipleItems(items);
      await inventory.goToCart();
      await cart.verifyItemCount(3);
      // Each cart row must have its own Remove button so items can be individually removed
      await cart.verifyAllItemsHaveRemoveButton();
    });

    test("should show matching name, price and description in cart as on product detail", async ({
      page,
      inventory,
      cart,
    }) => {
      await inventory.clickProductLink("Sauce Labs Bike Light");
      const detail = new ProductDetailPage(page);

      const productName = (await detail.itemName.textContent()) ?? "";
      const productPrice = (await detail.itemPrice.textContent()) ?? "";
      const productDesc = (await detail.itemDescription.textContent()) ?? "";

      await detail.addToCart();
      await inventory.goToCart();
      await cart.verifyOnCart();
      await cart.verifyItemCount(1);

      const cartDetails = await cart.getFirstCartItemDetails();
      expect(cartDetails.name).toBe(productName.trim());
      expect(cartDetails.price).toBe(productPrice.trim());
      expect(cartDetails.desc).toBe(productDesc.trim());
    });
  });

  test.describe("Checkout edge cases", () => {
    // SauceDemo does not enforce a minimum cart quantity, upon full checkout 
    // journey completes even with zero items in the cart.
    test("should allow completing the full checkout journey with an empty cart", async ({
      inventory,
      cart,
      checkout,
    }) => {
      // Navigate to cart – confirm it is empty before proceeding
      await inventory.goToCart();
      await cart.verifyOnCart();
      await cart.verifyItemCount(0);

      await cart.proceedToCheckout();
      await checkout.verifyCheckoutYourInformationHeading();

      await checkout.enterShippingInfo(generateShipping());
      await checkout.clickContinue();

      // Overview loads with no items listed – totals still render
      await checkout.verifyOverviewVisible();
      await checkout.verifyItemCount(0);
      await checkout.verifyTotalsVisible();

      // Order can be completed with an empty cart – confirmation page is shown
      await checkout.completeOrder();
      await checkout.verifyOrderSuccess();
    });
  });

  test.describe("Footer", () => {
    test("should show footer and social links on inventory", async ({ inventory }) => {
      await expect(inventory.footerText).toBeVisible();
      await expect(inventory.footerText).toContainText(
        "Sauce Labs. All Rights Reserved"
      );
      await expect(inventory.twitterLink).toBeVisible();
      await expect(inventory.facebookLink).toBeVisible();
      await expect(inventory.linkedinLink).toBeVisible();
    });
  });
});

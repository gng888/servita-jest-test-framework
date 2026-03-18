import { test, expect } from "../fixtures/pages.fixture";
import { getLoginUser } from "../fixtures/test-data/users";
import { generateShipping } from "../fixtures/test-data/shipping";

// Tag: @checkout-multiple – run with npm run test:ui:checkout-multiple
test.describe("Multiple Items Checkout @checkout-multiple", () => {
  test("should complete full journey with multiple items and verify all in cart with order success", async ({
    signIn,
    inventory,
    cart,
    checkout,
  }) => {
    await signIn.open();
    const user = getLoginUser("standard");
    await signIn.authenticate(user.username, user.password);
    // Assertions: Login success; Product page visible after login
    await signIn.verifyNotVisible();
    await inventory.verifyOnInventory();

    // Fetch price and description for each item upfront – both are validated at cart and overview.
    // Promise.all fetches everything in parallel; reduce sums prices into the expected subtotal.
    const items = await Promise.all(
      ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Bolt T-Shirt"].map(
        async (name) => {
          const [price, desc] = await Promise.all([
            inventory.getProductPrice(name),
            inventory.getProductDescription(name),
          ]);
          return { name, price, desc };
        }
      )
    );
    const expectedSubtotal = items.reduce((sum, { price }) => sum + price, 0);
    await inventory.addMultipleItems(items.map(({ name }) => name));

    // Verify that all selected items appear in the cart with correct prices and descriptions
    await inventory.goToCart();
    // Assertions: Correct items present in the cart
    await cart.verifyOnCart();
    await cart.verifyItemCount(3);
    await cart.verifyAllItemsPresent(items.map(({ name }) => name));
    await cart.verifyAllItemPrices(items);
    await cart.verifyAllItemDescriptions(items);
    await cart.proceedToCheckout();
    // Assertions: Checkout pages displayed correctly (step one)
    await checkout.verifyCheckoutYourInformationHeading();
    await checkout.enterShippingInfo(generateShipping());
    await checkout.clickContinue();
    // Assertions: Checkout pages displayed correctly (overview + totals)
    await checkout.verifyOverviewVisible();
    await checkout.verifyItemCount(3);
    // Confirm all items, prices and descriptions carry through from inventory to the overview
    await checkout.verifyAllItemsPresent(items.map(({ name }) => name));
    await checkout.verifyAllItemPrices(items);
    await checkout.verifyAllItemDescriptions(items);

    // Verify the price breakdown: subtotal is the sum of all item prices, tax is 8%, total adds up
    const { subtotal, tax, total } = await checkout.getTotals();
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(tax).toBeCloseTo(subtotal * 0.08, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    // Complete checkout
    await checkout.completeOrder();

    // Assertions: Order confirmation message visible
    await checkout.verifyOrderSuccess();

    // Navigate back to inventory and confirm we're on the Products page with an empty cart
    await checkout.goBackToProducts();
    await inventory.verifyOnInventory();
    await inventory.verifyCartBadgeHidden();
  });

  test.describe("Cart count and totals validation for multiple items before, after and cancelling upon checkout", () => {
    // Shared across all tests in this block – avoids repeating the same list in each test
    const items = ["Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Bolt T-Shirt"];

    test.beforeEach(async ({ signIn, inventory, cart }) => {
      await signIn.open();
      const user = getLoginUser("standard");
      await signIn.authenticate(user.username, user.password);
      // Add all three items and land on the cart page ready for each test
      await inventory.addMultipleItems(items);
      await inventory.goToCart();
      await cart.verifyItemCount(3);
    });

    test("should update cart count and recalculate subtotal when an item is removed from cart", async ({
      inventory,
      cart,
      checkout,
    }) => {
      await inventory.verifyCartCount(3);

      // Remove one item – cart should update immediately
      await cart.removeItem("Sauce Labs Bike Light");
      await cart.verifyItemCount(2);
      await inventory.verifyCartCount(2);

      // Remaining two items should still be present
      const remaining = ["Sauce Labs Backpack", "Sauce Labs Bolt T-Shirt"];
      await cart.verifyAllItemsPresent(remaining);

      // Proceed and confirm overview totals only reflect the two remaining items
      const remainingPrices = await Promise.all(
        remaining.map((name) => inventory.getProductPrice(name))
      );
      const expectedSubtotal = remainingPrices.reduce((sum, p) => sum + p, 0);

      await cart.proceedToCheckout();
      await checkout.enterShippingInfo(generateShipping());
      await checkout.clickContinue();
      await checkout.verifyOverviewVisible();
      await checkout.verifyItemCount(2);

      const { subtotal, tax, total } = await checkout.getTotals();
      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(tax).toBeCloseTo(subtotal * 0.08, 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    test("should return to cart with all items persisted when cancelling from checkout step one", async ({
      cart,
      checkout,
    }) => {
      await cart.proceedToCheckout();
      await checkout.verifyCheckoutYourInformationHeading();

      // Cancel returns to cart – all three items should still be there
      await checkout.cancelButton.click();
      await cart.verifyOnCart();
      await cart.verifyItemCount(3);
      await cart.verifyAllItemsPresent(items);
    });

    test("should return to cart with all items persisted when cancelling from checkout overview", async ({
      cart,
      checkout,
      inventory,
    }) => {
      await cart.proceedToCheckout();
      await checkout.enterShippingInfo(generateShipping());
      await checkout.clickContinue();
      await checkout.verifyOverviewVisible();

      // Cancel from overview should return to inventory
      await checkout.cancelButton.click();
      await inventory.verifyOnInventory();
    });
  });
});

import { test, expect } from "../fixtures/pages.fixture";
import { getLoginUser } from "../fixtures/test-data/users";
import { generateShipping } from "../fixtures/test-data/shipping";

// Tag: @checkout-single – run with npm run test:ui:checkout-single
test.describe("Single Item Checkout @checkout-single", () => {
  test("should complete full journey from login to order confirmation with assertions at each step", async ({
    signIn,
    inventory,
    cart,
    checkout,
  }) => {
    // Login to the application
    await signIn.open();
    const user = getLoginUser("standard");
    await signIn.authenticate(user.username, user.password);
    // Assertions: Login success; Product page visible after login
    await signIn.verifyNotVisible();
    await inventory.verifyOnInventory();

    // Capture price and description before adding – both are validated at each subsequent step
    const itemName = "Sauce Labs Backpack";
    const [inventoryPrice, inventoryDesc] = await Promise.all([
      inventory.getProductPrice(itemName),
      inventory.getProductDescription(itemName),
    ]);
    await inventory.addItemByName(itemName);

    // Open the cart and verify that the item is present with matching price and description
    await inventory.goToCart();
    // Assertions: Correct items present in the cart
    await cart.verifyOnCart();
    await cart.verifyItemCount(1);
    await cart.verifyItemPresent(itemName);
    await cart.verifyAllItemPrices([{ name: itemName, price: inventoryPrice }]);
    await cart.verifyAllItemDescriptions([{ name: itemName, desc: inventoryDesc }]);

    // Click Checkout
    await cart.proceedToCheckout();
    // Assertions: Checkout pages displayed correctly (step one)
    await checkout.verifyCheckoutYourInformationHeading();

    // Enter random shipping details
    await checkout.enterShippingInfo(generateShipping());
    await checkout.clickContinue();

    // Continue to the order Overview page
    // Assertions: Checkout pages displayed correctly (overview + totals)
    await checkout.verifyOverviewVisible();
    await checkout.verifyItemCount(1);
    // Confirm the correct item, price and description all carry through to the overview
    await checkout.verifyItemPresent(itemName);
    await checkout.verifyAllItemPrices([{ name: itemName, price: inventoryPrice }]);
    await checkout.verifyAllItemDescriptions([{ name: itemName, desc: inventoryDesc }]);

    // Verify the price breakdown: subtotal matches inventory, tax is roughly 8% manually worked it out, total adds up
    const { subtotal, tax, total } = await checkout.getTotals();
    expect(subtotal).toBe(inventoryPrice);
    expect(tax).toBeCloseTo(subtotal * 0.08, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    // Complete the order
    await checkout.completeOrder();

    // Assertions: Order confirmation message visible
    await checkout.verifyOrderSuccess();

    // Navigate back to inventory and confirm we're on the Products page with an empty cart
    await checkout.goBackToProducts();
    await inventory.verifyOnInventory();
    await inventory.verifyCartBadgeHidden();
  });

  test.describe("Checkout journey validation", () => {
    test.beforeEach(async ({ signIn, inventory }) => {
      await signIn.open();
      const user = getLoginUser("standard");
      await signIn.authenticate(user.username, user.password);
      await inventory.addItemByName("Sauce Labs Backpack");
      await inventory.goToCart();
    });

    test("should show error when first name is missing", async ({
      cart,
      checkout,
    }) => {
      await cart.proceedToCheckout();
      await checkout.enterShippingInfo({ first: "", last: "Doe", zip: "12345" });
      await checkout.clickContinue();
      await checkout.verifyErrorContains("First Name is required");
    });

    test("should show error when last name is missing", async ({
      cart,
      checkout,
    }) => {
      await cart.proceedToCheckout();
      await checkout.enterShippingInfo({ first: "John", last: "", zip: "12345" });
      await checkout.clickContinue();
      await checkout.verifyErrorContains("Last Name is required");
    });

    test("should show error when postal code is missing", async ({
      cart,
      checkout,
    }) => {
      await cart.proceedToCheckout();
      await checkout.enterShippingInfo({ first: "John", last: "Doe", zip: "" });
      await checkout.clickContinue();
      await checkout.verifyErrorContains("Postal Code is required");
    });

    test("should return to cart when canceling on checkout step one", async ({
      cart,
      checkout,
    }) => {
      await cart.proceedToCheckout();
      await checkout.verifyCheckoutYourInformationHeading();
      await checkout.cancelButton.click();
      await cart.verifyOnCart();
    });
  });
});

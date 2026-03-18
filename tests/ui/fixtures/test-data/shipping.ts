import { faker } from "@faker-js/faker";

export interface ShippingInfo {
  first: string;
  last: string;
  zip: string;
}

// Factory method constructs and returns a ShippingInfo object on demand.
// Uses Faker so each call produces a different realistic name and postcode,
// keeping specs free of hardcoded values like "Test User" or "12345".
export function generateShipping(): ShippingInfo {
  return {
    first: faker.person.firstName(),
    last: faker.person.lastName(),
    zip: faker.location.zipCode(),
  };
}

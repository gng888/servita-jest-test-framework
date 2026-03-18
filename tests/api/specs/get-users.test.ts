import { type AxiosResponse } from "axios";
import { client } from "../helpers/http-client";
import {
  USER_FIELDS,
  LIST_RESPONSE_FIELDS,
} from "../fixtures/user-payloads";

describe("Users Retrieval", () => {

  describe("browsing user lists", () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await client.get("/users");
    });

    it("should return a paginated list of users with pagination metadata", () => {
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("application/json");
      for (const field of LIST_RESPONSE_FIELDS) {
        expect(res.data).toHaveProperty(field);
      }
      expect(Array.isArray(res.data.data)).toBe(true);
      expect(res.data.data.length).toBeGreaterThan(0);
      expect(res.data.data.length).toBeLessThanOrEqual(res.data.per_page);
      expect(res.data.support).toHaveProperty("url");
      expect(res.data.support).toHaveProperty("text");
    });

    it("should include a complete profile for each user with a valid email and avatar", () => {
      for (const user of res.data.data) {
        for (const field of USER_FIELDS) {
          expect(user).toHaveProperty(field);
        }
        expect(typeof user.id).toBe("number");
        expect(user.email).toMatch(/.+@.+\..+/);
        expect(user.avatar).toMatch(/^https:\/\//);
      }
    });
  });

  describe("lightweight response schema validation", () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await client.get("/users");
    });

    // Validates that pagination fields are the correct types, not just present
    it("should return pagination fields as numbers", () => {
      expect(typeof res.data.page).toBe("number");
      expect(typeof res.data.per_page).toBe("number");
      expect(typeof res.data.total).toBe("number");
      expect(typeof res.data.total_pages).toBe("number");
    });

    // Validates that each existing users name and email are non empty strings
    it("should return each user's name fields and email as non-empty strings", () => {
      for (const user of res.data.data) {
        expect(typeof user.first_name).toBe("string");
        expect(user.first_name.length).toBeGreaterThan(0);
        expect(typeof user.last_name).toBe("string");
        expect(user.last_name.length).toBeGreaterThan(0);
        expect(typeof user.email).toBe("string");
        expect(user.email.length).toBeGreaterThan(0);
      }
    });

    // Validates that the avatar is a actual https not just a relative path, could be important scenario if Frontend is using/calling the API
    it("should return each user's avatar as a fully qualified HTTPS URL", () => {
      for (const user of res.data.data) {
        expect(user.avatar).toMatch(/^https:\/\/.+\..+/);
      }
    });
  });

  describe("retrieving a specific user by id", () => {
    it("should return the user details when a valid user id is requested", async () => {
      const res = await client.get("/users/2");
      expect(res.status).toBe(200);
      expect(res.data.data.id).toBe(2);
      expect(res.data.data).toHaveProperty("email");
    });

    it("should return not found when the user does not exist", async () => {
      const res = await client.get("/users/99999");
      expect(res.status).toBe(404);
      expect(res.data).toEqual({});
    });
  });

  //Useful scenario to check for pagination boundary
  describe("navigating across pagination boundary", () => {
    it("should return the correct page of results and an empty list beyond the last page", async () => {
      const page2 = await client.get("/users?page=2");
      expect(page2.status).toBe(200);
      expect(page2.data.page).toBe(2);

      const empty = await client.get("/users?page=9999");
      expect(empty.status).toBe(200);
      expect(empty.data.data).toEqual([]);
    });
  });
});

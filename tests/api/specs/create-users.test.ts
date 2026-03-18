import { type AxiosResponse } from "axios";
import { client } from "../helpers/http-client";
import {
  CREATE_USER_PAYLOADS,
  createUserPayload,
} from "../fixtures/user-payloads";

describe("Users Creation", () => {

  describe("creating a new user", () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await client.post("/users", CREATE_USER_PAYLOADS.basic);
    });

    it("should create the user and return their profile with a unique id and timestamp", () => {
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toContain("application/json");
      expect(res.data.name).toBe("aston martin");
      expect(res.data.id).toBeDefined();
      expect(res.data.id).not.toBeNull();
      expect(Number(res.data.id)).not.toBeNaN();
      expect(new Date(res.data.createdAt).getTime()).not.toBeNaN();
    });

    it("should create a user with both name and job title when both values are provided", async () => {
      const r = await client.post("/users", CREATE_USER_PAYLOADS.withJob);
      expect(r.status).toBe(201);
      expect(r.data.name).toBe("sarah connor");
      expect(r.data.job).toBe("engineer");
    });

    it("should create the user with just a name when no job title is given", async () => {
      const r = await client.post("/users", CREATE_USER_PAYLOADS.nameOnly);
      expect(r.status).toBe(201);
      expect(r.data.name).toBe("single field");
      expect(r.data).not.toHaveProperty("job");
    });

    it("should give each newly created user a different id", async () => {
      const [userCreationRequest1, userCreationRequest2] = await Promise.all([
        client.post("/users", createUserPayload()),
        client.post("/users", createUserPayload()),
      ]);
      expect(userCreationRequest1.data.id).not.toBe(userCreationRequest2.data.id);
    });

    it("should confirm the created users details match what was submitted", async () => {
      const payload = createUserPayload();
      const r = await client.post("/users", payload);
      expect(r.status).toBe(201);
      expect(r.data.name).toBe(payload.name);
      expect(r.data.job).toBe(payload.job);
      expect(r.data.id).toBeDefined();
      expect(r.data.createdAt).toBeDefined();
    });
  });

  describe("lightweight response schema validation", () => {
    let res: AxiosResponse;

    beforeAll(async () => {
      res = await client.post("/users", createUserPayload());
    });

    it("should return the created users id as a string", () => {
      expect(typeof res.data.id).toBe("string");
      expect(res.data.id.length).toBeGreaterThan(0);
    });

    it("should return createdAt as a valid ISO timestamp", () => {
      expect(typeof res.data.createdAt).toBe("string");
      expect(new Date(res.data.createdAt).toISOString()).toBe(res.data.createdAt);
    });

    // The response should contain the submitted fields including the server assigned ones, technically any key value pairs can be passed in the response but we only want to validate the ones we expect
    it("should not include unexpected fields in the response", () => {
      const allowedKeys = ["name", "job", "id", "createdAt", "_meta"];
      const returnedKeys = Object.keys(res.data);
      for (const key of returnedKeys) {
        expect(allowedKeys).toContain(key);
      }
    });
  });

  describe("users name and payload validation", () => {
    //Usage of specific user test data rather than random data to validate the naming format validation
    it("should register a user with no body and return an id and timestamp", async () => {
      const res = await client.post("/users", CREATE_USER_PAYLOADS.empty);
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty("id");
      expect(res.data).toHaveProperty("createdAt");
    });

    it("should register a user with a numeric name string", async () => {
      const res = await client.post("/users", CREATE_USER_PAYLOADS.numericName);
      expect(res.status).toBe(201);
      expect(res.data.name).toBe("12345");
    });

    it("should register a user with special characters in the name", async () => {
      const res = await client.post("/users", CREATE_USER_PAYLOADS.specialChars);
      expect(res.status).toBe(201);
      expect(res.data.name).toBe("O'Brien-Smith");
    });

    it("should register a user with a 256 character name", async () => {
      const res = await client.post("/users", CREATE_USER_PAYLOADS.longName);
      expect(res.status).toBe(201);
      expect(res.data.name.length).toBe(256);
    });
  });

  describe("invalid submissions", () => {
    it("should reject a completely invalid string body with 400", async () => {
      const res = await client.post("/users", "jfjskddf");
      expect(res.status).toBe(400);
      expect(res.data).toHaveProperty("error");
      expect(res.data.message ?? res.data.error).toMatch(
        /invalid json|valid json|request body/i
      );
    });

    it("should reject a numeric value body with 400", async () => {
      const res = await client.post("/users", "378548735435");
      expect(res.status).toBe(400);
      expect(res.data).toHaveProperty("error");
    });

    it("should reject an incomplete JSON body with 400 and an invalid_json error", async () => {
      // Simulates a truncated payload – missing value and closing brace
      const res = await client.post("/users", '{ "name": "sarah connor", "job":');
      expect(res.status).toBe(400);
      expect(res.data.error).toMatch(/invalid_json|invalid/i);
      expect(res.data.message ?? res.data.error).toMatch(
        /invalid json|valid json|request body/i
      );
    });
  });
});

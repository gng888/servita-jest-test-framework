import axios, { type AxiosInstance } from "axios";

const baseUrl = process.env.API_BASE_URL?.trim();
if (!baseUrl) {
  throw new Error(
    "Missing API_BASE_URL – add it to your .env file before running API tests"
  );
}

const apiKey = process.env.API_KEY?.trim();
if (!apiKey) {
  throw new Error(
    "Missing API_KEY – add it to your .env file before running API tests"
  );
}

export const API_KEY = apiKey;
export const BASE_URL = baseUrl;

// Default client: base URL + api key from env.
export const client: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  },
  validateStatus: () => true,
});

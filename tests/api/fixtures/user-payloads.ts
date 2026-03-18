// List of names to rotate through for the user creation tests
const NAMES = ["Alice Smith", "Bob Jones", "Carol White", "Dan Brown", "Eve Davis"];
const JOBS = ["Engineer", "Designer", "Manager", "Analyst", "Developer"];

// Factory method: builds a POST /users body with a random name and job so tests
// doesn't hardcode strings. Pass overrides when a test needs a specific value,
// e.g. createUserPayload({ name: "Jane" }).
export function createUserPayload(
  overrides: Partial<{ name: string; job: string }> = {}
): { name: string; job: string } {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];
  return { name, job, ...overrides };
}

// Fixture: fixed payloads for edge/validation cases (empty body, long name, special chars, etc.)
export const CREATE_USER_PAYLOADS = {
  basic: { name: "aston martin" },
  withJob: { name: "sarah connor", job: "engineer" },
  nameOnly: { name: "single field" },
  empty: {},
  numericName: { name: "12345" },
  specialChars: { name: "O'Brien-Smith" },
  longName: { name: "A".repeat(256) },
} as const;

// Fixture: exact expected response for GET /users (page 1) – used for strict equality assertions.
export const EXPECTED_PAGE_ONE_RESPONSE = {
  page: 1,
  per_page: 6,
  total: 12,
  total_pages: 2,
  data: [
    {
      id: 1,
      email: "george.bluth@reqres.in",
      first_name: "George",
      last_name: "Bluth",
      avatar: "https://reqres.in/img/faces/1-image.jpg",
    },
    {
      id: 2,
      email: "janet.weaver@reqres.in",
      first_name: "Janet",
      last_name: "Weaver",
      avatar: "https://reqres.in/img/faces/2-image.jpg",
    },
    {
      id: 3,
      email: "emma.wong@reqres.in",
      first_name: "Emma",
      last_name: "Wong",
      avatar: "https://reqres.in/img/faces/3-image.jpg",
    },
    {
      id: 4,
      email: "eve.holt@reqres.in",
      first_name: "Eve",
      last_name: "Holt",
      avatar: "https://reqres.in/img/faces/4-image.jpg",
    },
    {
      id: 5,
      email: "charles.morris@reqres.in",
      first_name: "Charles",
      last_name: "Morris",
      avatar: "https://reqres.in/img/faces/5-image.jpg",
    },
    {
      id: 6,
      email: "tracey.ramos@reqres.in",
      first_name: "Tracey",
      last_name: "Ramos",
      avatar: "https://reqres.in/img/faces/6-image.jpg",
    },
  ],
  support: {
    url: "https://contentcaddy.io?utm_source=reqres&utm_medium=json&utm_campaign=referral",
    text: "Tired of writing endless social media content? Let Content Caddy generate it for you.",
  },
} as const;

// Fixture: shape we expect per user in GET /users – used to assert the API returns what we need.
export const USER_FIELDS = [
  "id",
  "email",
  "first_name",
  "last_name",
  "avatar",
] as const;

// Fixture: top-level keys on the GET users list response – again so we assert structure in one place.
export const LIST_RESPONSE_FIELDS = [
  "page",
  "per_page",
  "total",
  "total_pages",
  "data",
  "support",
] as const;

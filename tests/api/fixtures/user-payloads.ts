// List of names to rotate through for the user creation tests
const NAMES = ["Alice Smith", "Bob Jones", "Carol White", "Dan Brown", "Eve Davis"];
const JOBS = ["Engineer", "Designer", "Manager", "Analyst", "Developer"];

// Factory method: builds a POST /users body with a random name and job so tests
// don't hardcode strings. Pass overrides when a test needs a specific value,
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

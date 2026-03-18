# Servita Automation Suite

TypeScript test framework using **Playwright** for UI testing and **Jest + Axios** for API testing.

- **UI** – Playwright (own test runner) against [SauceDemo](https://www.saucedemo.com/)
- **API** – Jest + Axios against [Reqres.in](https://reqres.in/api/users/)

---

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (recommended for managing Node.js versions)
- Node.js v18+
- npm v9+
- ReqRes API key – sign up free at [app.reqres.in/api-keys](https://app.reqres.in/api-keys)

### Node Version Management (nvm)

This repo includes an `.nvmrc` file that pins the project to the latest Node.js LTS release. Install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) then run:

```bash
nvm install
nvm use
```

---

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # fill in API_BASE_URL and API_KEY
```

---

## Configuration

| File | Purpose |
|---|---|
| `playwright.config.ts` | Chromium default; Firefox project commented out (uncomment + install to run cross-browser) |
| `jest.config.ts` | ts-jest preset, test roots, HTML reporter |
| `tsconfig.json` | Shared TypeScript options |
| `.nvmrc` | Pins Node.js version for nvm (`lts/*`) |
| `.env` | Runtime secrets (git-ignored, see `.env.example`) |

### Environment Variables

| Variable | Description |
|---|---|
| `UI_BASE_URL` | UI app base URL (default: SauceDemo) |
| `API_BASE_URL` | API base URL (default: `https://reqres.in/api`) |
| `API_KEY` | API key for authenticated endpoints |

---

## Running Tests

```bash
# UI (Chromium)
npm run test:ui                   # headless
npm run test:ui:headed            # visible browser (single worker)
npm run test:ui:debug             # headed with Playwright Inspector (single worker)
npm run test:ui:auth              # @auth only
npm run test:ui:checkout-single   # @checkout-single only
npm run test:ui:checkout-multiple # @checkout-multiple only
npm run test:ui:negative          # @negativetests only (expected failures)
npm run test:ui:report            # open HTML report

# API
npm run test:api
npm run test:api:report           # open HTML report

# Everything
npm test
```

---

## Project Structure

```
├── playwright.config.ts
├── jest.config.ts
├── tsconfig.json
├── package.json
├── .nvmrc                               # pins Node.js to latest LTS via nvm
├── .env / .env.example
│
├── tests/
│   ├── ui/                             # Playwright e2e
│   │   ├── fixtures/
│   │   │   ├── pages.fixture.ts               # test.extend – injects page objects
│   │   │   └── test-data/
│   │   │       ├── users.ts                   # getLoginUser() factory
│   │   │       └── shipping.ts                # generateShipping() factory (Faker)
│   │   ├── pages/                      # Page Object Models
│   │   │   ├── BasePage.ts            # Shared header, cart, burger, footer
│   │   │   ├── SignInPage.ts
│   │   │   ├── InventoryPage.ts       # extends BasePage
│   │   │   ├── ProductDetailPage.ts
│   │   │   ├── CartPage.ts            # extends BasePage
│   │   │   ├── CheckoutPage.ts        # extends BasePage
│   │   │   └── SidebarMenu.ts
│   │   ├── specs/
│   │   │   ├── login-logout-auth.spec.ts      # @auth
│   │   │   ├── checkout-single-item.spec.ts   # @checkout-single
│   │   │   ├── checkout-multiple-items.spec.ts # @checkout-multiple
│   │   │   ├── additional-journeys.spec.ts    # sort, menu, routing, browsing, footer
│   │   │   └── negative-testing.spec.ts       # @negativetests – expected to fail
│   │   └── reports/
│   │
│   └── api/                            # Jest + Axios
│       ├── helpers/
│       │   └── http-client.ts                 # Axios client (base URL + API key)
│       ├── fixtures/
│       │   └── user-payloads.ts               # createUserPayload() factory, static fixtures, expected response fixture
│       ├── specs/
│       │   ├── get-users.test.ts              # List, schema, by id, pagination
│       │   └── create-users.test.ts           # Create, schema, formats, invalid
│       └── reports/
│
└── .github/workflows/
    ├── ui-tests.yml
    └── api-tests.yml
```

---

## Reporting

- **Playwright** – `list` in terminal + HTML report in `tests/ui/reports/`. CI uploads report, screenshots, traces, and videos as artefacts.
- **Jest** – default in terminal + HTML report in `tests/api/reports/`. CI uploads as artefact.

---

## Test Coverage

### UI (Playwright)

| Spec | Tag | Covers |
|---|---|---|
| `login-logout-auth` | `@auth` | Login, Products page, logout, locked user, invalid creds, unauthenticated access |
| `checkout-single-item` | `@checkout-single` | Single-item end-to-end checkout with price/description validation, shipping field errors, cancel |
| `checkout-multiple-items` | `@checkout-multiple` | Multi-item checkout, cart removal + subtotal recalculation, cancel from step one and overview |
| `additional-journeys` | — | Sort, burger menu, reset, about, routing/titles, add/remove button toggling, cart badge, product detail ↔ cart match, empty cart checkout, footer |
| `negative-testing` | `@negativetests` | Intentionally failing tests exposing defects in broken user accounts (see below) |

**Negative testing breakdown** – each test asserts correct behaviour and is expected to fail:

| User | Defects exposed |
|---|---|
| Problem | Sort (Z-A, price asc/desc) broken, identical product images, last name field drops input |
| Performance Glitch | Login takes several seconds longer than normal |
| Error | Remove button doesn't clear cart badge, cart renders wrong product names |
| Visual | Product images swapped vs standard user |

### API (Jest + Axios)

| Spec | Covers |
|---|---|
| `get-users` | Strict response equality against fixture, list (200, pagination), schema validation (types, non-empty strings, HTTPS avatars), get by id (200/404), pagination boundary |
| `create-users` | Create (201, echoed fields, unique ids), schema validation (id string, ISO timestamp, no unexpected fields), name formats (empty, numeric, special chars, 256 chars), invalid bodies (bad string, numeric, truncated JSON → 400) |

---

## Design Decisions

| Decision | Why |
|---|---|
| **Page Object Model + inheritance** | One class per screen. `BasePage` holds shared elements (header, cart icon, burger menu, footer) that appear on every authenticated page. `InventoryPage`, `CartPage`, and `CheckoutPage` extend it — no duplicated locators. |
| **Playwright fixtures (`test.extend`)** | Page objects auto-injected into every test — no manual instantiation. Test data lives in `test-data/`. |
| **Factory methods** | `getLoginUser(role)`, `generateShipping()` (Faker), and `createUserPayload(overrides?)` build test data on demand. Specs stay focused on behaviour, not data construction. One place to update if shapes change. |
| **Tags** | `@auth`, `@checkout-single`, `@checkout-multiple`, `@negativetests` — run specific journeys via npm scripts. |
| **`data-test` selectors** | Stable across styling and layout changes; decoupled from CSS/class names. |
| **AAA pattern** | Every test follows Arrange → Act → Assert. Single responsibility per test. |
| **Separation of concerns** | Page objects handle *how*, fixtures/factories handle *what data*, specs handle *what to test*. |
| **Before hooks (DRY)** | Shared setup (login, add items, navigate) extracted into `beforeEach`/`beforeAll`. Each test only contains what is unique to it. |
| **`Promise.all` + `reduce`** | Fetches multiple prices/descriptions in parallel, then aggregates. Keeps tests fast; shows async fluency. |
| **TypeScript `as const` + derived types** | Constants use `as const`; `LoginUserRole` is `keyof typeof VALID_USERS`. Adding a user to the registry auto-updates types — no manual sync. |
| **Private helpers in page objects** | `getCard(name)` in `InventoryPage` centralises the repeated card-lookup locator. DRY at the page-object level. |
| **`toBeCloseTo` for prices** | Handles JavaScript floating point (e.g. `$29.99 * 0.08` can drift). Two decimal places avoids false failures. |
| **End-to-end data flow validation** | Captures name, price, and description at inventory → asserts they persist through cart → checkout overview. Validates data integrity, not just page loads. |
| **Negative testing (intentional failures)** | Tests assert *correct* behaviour against broken accounts. Failures in the report expose each defect — demonstrates defect detection as a strategy. |
| **Playwright runner over Jest+Playwright** | Playwright's runner has built-in parallelism, retries, tracing, video, and screenshots. Jest would need third-party adapters for all of this. Jest is kept for API tests where it fits. |
| **Strict response fixture (`toStrictEqual`)** | `EXPECTED_PAGE_ONE_RESPONSE` captures the exact known API response. `_meta` (unstable promotional data) is destructured out before comparison. Catches any drift in seeded data that looser schema checks would miss. |
| **Axios `validateStatus: () => true`** | 4xx/5xx responses are assertable without try/catch. Secrets loaded from `.env`. |
| **CI** | Separate workflows for UI and API. Actions pinned to v5 (Node.js 24 runtime). Playwright retries twice in CI only. Secrets injected as both `.env` and step-level env vars for reliability. Reports uploaded as artefacts. |

---

## Known Limitations

### Reqres.in API
- **No persistence** – `POST /users` returns 201 with an id but the record is never stored; `GET /users/{id}` will 404.
- **No input validation** – any body (even `{}` or `{ "foo": "bar" }`) returns 201; there are no required fields.
- **Rate limiting** – free-tier limits can cause `429` responses when running the suite repeatedly.
- **Simulated data** – all `GET /users` records are pre-seeded fixtures, not a real user system.

### SauceDemo UI
- **Fixed test accounts** – no user creation/update/deletion; all credentials are provided by the site.
- **No payment processing** – checkout completes without card details or payment.
- **Minimal shipping validation** – only checks empty fields; no character limits or format validation on names/postcode.
- **No minimum cart quantity** – empty cart can proceed through the full checkout (covered in `additional-journeys`).
- **Broken user accounts** – `problem_user`, `error_user`, `performance_glitch_user`, `visual_user` are intentionally buggy; tests against them are expected to fail.
- **Static inventory** – products, prices, and images are hardcoded and cannot be changed.
- **No session persistence** – each Playwright test starts a fresh browser context.

## Plan: Analyze and prepare repo for success

TL;DR - This repository is a GitHub Spark template scaffolded around a React + Vite front‑end that visualizes NASA EONET disaster events on an interactive globe. A SQLite database layer (Kysely + Atlas) is included but currently unused by the UI. The goal is to understand the intended functionality, identify gaps, and outline the steps needed to get the project running and in a maintainable state.

**Steps**
1. **Understand purpose and key features**
   - Read `README.md` and browse source files; the UI fetches open events from EONET API, plots them on a `react-globe.gl` globe, and exposes controls and a side list.
   - The DB code (`db/*` and root duplicates) defines a `disaster_events` table for caching events and includes migration tooling via Atlas.
   - Other features: filtering by category, auto‑rotate toggle, keyboard shortcuts, telemetry toast messages.
2. **Initial environment setup**
   - Ensure Node.js version compatible with dependencies (Node 18+ recommended by Spark template).
   - Clone repository and run `npm install` to populate `node_modules`.
   - Run `npm run lint` to verify code quality and catch any Typoscript/ESLint problems.
3. **Database initialization (optional for front‑end)**
   - Execute `npm run db:migrate:apply` to apply schema from `db/schema.sql` to `db/app.db` (creates local SQLite file).
   - Verify with `npm run db:check` to confirm connection and row count.
   - If adjusting schema, use `npm run db:migrate:diff --name <name>`.
4. **Start development server**
   - Run `npm run dev` (Vite) and open `http://localhost:5173` in a browser.
   - Confirm the globe loads, events populate and controls work; network access to `https://eonet.gsfc.nasa.gov/api/v3/events?status=open` is required.
   - If the fetch fails due to network/firewall, consider mocking responses or offline caching.
5. **Investigate and clean duplicate files**
   - There are duplicate `check.ts`, `schema.sql` at root and in `db/`. Choose one location (recommend `db/`) and remove extras to reduce confusion.
   - Ensure `tsconfig.db.json` includes only the selected paths.
6. **Identify broken or missing functionality**
   - The front‑end does not interact with the local database; if the original intent was to cache or persist events, implement an API layer or sync logic.
   - There is no backend server; any future data mutation or offline support will require adding a server (could be simple Express/Cloudflare Worker/Next.js API route).
   - Assets such as custom fonts (`Space Grotesk`, `JetBrains Mono`) are referenced inline; verify they are loading or add `<link>` tags if missing.
   - The `packages/*` workspace is empty; remove workspace config or add packages if necessary.
7. **Document setup and future work**
   - Update README to reflect actual functionality, include setup commands, and note any manual steps (e.g., installing Atlas CLI globally if not using npx).
   - Add comments in source or a TODO list for database integration, error handling enhancements, and unit tests.

**Relevant files**
- `/README.md` – starting instructions and context.
- `/src/App.tsx` – main UI logic fetching events and controlling globe.
- `/src/components/Globe.tsx`, `EventList.tsx`, `HUDControls.tsx` – reusable UI pieces.
- `/db/` and root duplicates – schema, client, migrations, check scripts.
- `/package.json` – scripts and dependencies.

**Verification**
1. Follow the setup steps to confirm a working local dev environment: install, run DB migrate/check, start dev server, and interact with UI.
2. Remove duplicate files and ensure the project still builds and the `db:` scripts function.
3. Add a simple script or UI change that interacts with the SQLite database to prove the backend scaffolding works (e.g., write and read a test row).
4. Run `npm run lint` and `npm run build` to ensure no compile/lint errors remain.

**Decisions**

---

### 🛠 Bun & Vite transition
The user wants to switch the development environment to **bun** while continuing to use Vite. Bun is a drop‑in Node replacement with a built‑in package manager, but several dependencies (e.g. `better-sqlite3`) may not compile under Bun’s runtime. The plan should include:

1. **Install Bun locally** and ensure the project runs with `bun run dev` and `bun install`.
2. Replace `npm`/`npx` commands in documentation and scripts with `bun` equivalents.
3. Generate a `bun.lockb` by running `bun install`; commit it.
4. Audit dependencies for Bun compatibility:
   - Investigate `better-sqlite3` (likely incompatible); consider an alternative such as `bun:sqlite` or dropping DB in Bun environment. Optionally keep database scripts separate and run using Node for now.
   - Ensure TypeScript compiler (`tsc`) is invoked correctly under Bun; add `bunx tsc` or use the Bun built‑in transpiler if desired.
   - Replace any `node:` imports if they break (should be supported by Bun but verify).
5. Run the dev server (`bun run dev`) and build (`bun run build`) to confirm Vite works in bun environment.
6. Update the README with bun instructions and note any limitations (e.g. database support).

Verification steps:
- `bun install` completes without errors.
- `bun run lint`, `bun run db:check`, `bun run dev` all succeed.
- If database code fails, document the failure and run it with Node as a fallback.

Decisions:
- We may keep database support under Node until a Bun‑compatible driver is available or decide to rewrite the database layer.
- Prioritize keeping the front‑end working with Bun first.

---

The plan above has been expanded; continue refining if you need more details or want to move forward with implementation.
- Keep DB in place as optional cache but accept that the front‑end currently ignores it; plan for later work if caching is desired.
- Prefer using `db/` directory; remove root copies to reduce confusion.
- Treat `packages/*` workspace as vestigial until additional packages are added.

**Recent refactor**
- The data‑fetching logic in `src/App.tsx` has been migrated to **TanStack React Query**.  
  Requests are retried twice (three total attempts) and the query automatically
  refreshes every 10 minutes.  Loading/error state is derived from the hook and
  displayed in the HUD.  A `localStorage` cache provides a fallback when the API
  is unreachable.
- Old `fetchDisasters` effect and related state were removed; the app now uses
  `useQuery` to govern network I/O and keep UI code declarative.

**Further Considerations**
1. Should we implement an API to persist EONET events locally? (Yes / No / later)  
2. Do we need offline support or authentication?  
3. Would packaging as a PWA or deploying to GitHub Pages be useful?

---

### 🚀 Additional improvements worth tackling
These are not strictly required to “fix” the app but they will make development and operation easier:

* **Database sync & backend API** – wire the SQLite layer into a lightweight server (Express/Cloudflare Worker/Next API) and let the front end query cached events through React Query. This enables faster loads, server‑side filtering, historical queries and safer retries.
* **Alternate databases** – a `docker-compose.yml` now launches the latest MySQL 8.1 server, and both Atlas/Kysely support switching to a `mysql://` `DATABASE_URL`.  The existing SQLite setup remains the default but you can experiment with MySQL for GIS or multi‑user needs.
* **Automated tests** – add Jest/React Testing Library unit tests for `Globe`, `EventList`, `HUDControls` and integration tests that mock `@tanstack/react-query` using `msw` or similar.
* **Environment configuration** – move the EONET base URL and refresh interval into `.env`/`import.meta.env` so you can swap between production, staging, or a mock server.
* **Offline & resilience** – consider a service worker or leveraging React Query’s `persistQueryClient` plugin so the app can display the last‑cached data when completely offline.
* **UI/UX polish** – skeleton loaders, accessible keyboard focus, ARIA labels, and indicators for stale data will improve usability.
* **Error/telemetry logging** – integrate Sentry, LogRocket or a simple POST endpoint so you capture failed fetches and client errors automatically.
* **Performance & bundle size** – split the globe component with `React.lazy`/`dynamic import`, and track Core Web Vitals via Lighthouse/Chrome UX Report.
* **Linting & strictness** – enable `strict: true` in `tsconfig.json` and add ESLint/Prettier rules to enforce code style and catch bugs early.
* **Developer tooling** – add an easy `npm run db:seed` script for populating sample events, and `npm run test:watch` for fast feedback.
* **Documentation** – expand README with architecture diagrams, API spec, and a contributor guide; maintain a high‑level roadmap in `docs/plan.md` or a `ROADMAP.md`.

Addressing these areas will make the project easier to maintain, less fragile when the EONET API misbehaves, and more pleasant for contributors and users alike.  

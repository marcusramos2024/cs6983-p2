# AGENTS.md: Paper Trail

<!--
  Shared rules file for every AI coding tool on this repo (Antigravity, Copilot, Cursor, Claude Code).
  One copy only, at the repo root. Don't copy it into .agents/, .cursor/ or .claude/.
  CLAUDE.md contains only `@AGENTS.md` so Claude Code reads this file too.
  Keep it under ~200 lines and link to docs/ instead of pasting.
  Change it through a PR and look at it again at every sprint retro.
-->

## 1. Project context

<!-- One paragraph so the agent knows what it's building and for whom. Source: docs/PRD.md. -->
Paper Trail is a renter's evidence log. Tenants log incidents (pest, heat, leak, appliance, other) with photos, when they reported it and how, and a "days ignored" clock starts. Property managers work a queue of open incidents and acknowledge, respond and resolve, with every action timestamped. Building organizers see all incidents in their building and export a building-wide timeline PDF. There's also a public, anonymized building report card API.

- Team: Marcus Ramos and [PLACEHOLDER: partner name]. CS 6983 Project 2, due Nov 13, 2026.
- PRD: [docs/PRD.md](docs/PRD.md). Design: [DESIGN.md](DESIGN.md). Wireframe: [docs/design/wireframe.html](docs/design/wireframe.html).

### 1.1 Stack and versions

<!-- Pin majors. If package.json disagrees with this table, fix one of them in the same PR. -->
| Layer | Choice |
|---|---|
| Runtime | Node.js 22 LTS |
| Framework | Next.js 15, App Router, route handlers for the API |
| Language | TypeScript 5, `strict: true` |
| UI | React 19 + Tailwind CSS 3.4, theme generated from DESIGN.md tokens |
| Database | Postgres 16 via Prisma 6 (Supabase in prod, local Docker or Supabase branch in dev) |
| Auth | NextAuth v4, credentials provider, JWT sessions, role stored in the token |
| Validation | Zod 3, shared by forms and API |
| Photos | `lib/storage.ts`: local `/tmp/uploads` in dev and tests, Vercel Blob in prod |
| Real-time | Server-sent events from `/api/events`, 10 s polling fallback |
| Tests | Vitest 2 + React Testing Library, Playwright for E2E |
| Deploy | Vercel, preview deploy on every PR |

### 1.2 Commands

- Install: `npm ci`
- Dev: `npm run dev`
- Lint / format: `npm run lint`, `npm run format`
- Types: `npm run typecheck`
- Unit and integration tests: `npm test` (watch: `npm run test:watch`, coverage: `npm run test:coverage`)
- E2E: `npm run test:e2e`
- DB: `npx prisma migrate dev --name <change>`, seed with `npm run db:seed`
- Before saying a task is done: `npm run lint && npm run typecheck && npm test` must pass.

### 1.3 Architecture and folders

<!-- Keep in sync with the real tree. New top-level folder means updating this in the same PR. -->
```
app/
  (auth)/login, (auth)/signup     Auth pages
  incidents/, incidents/new, incidents/[id]   Tenant screens
  queue/                          Manager screen
  building/                       Organizer screen
  api/
    auth/[...nextauth]/route.ts
    incidents/route.ts, incidents/[id]/route.ts, incidents/[id]/events/route.ts
    incidents/[id]/photos/route.ts
    events/route.ts               SSE stream
    buildings/[id]/score/route.ts Public report card
components/
  ui/                             Generic pieces (Button, Badge, Dialog, EmptyState)
  incidents/, queue/, building/   Feature components (IncidentForm, IncidentTimeline, QueueTable...)
lib/
  services/                       Business logic: incident-service.ts, event-service.ts, score-service.ts
  validation/                     Zod schemas: incident-schema.ts, event-schema.ts
  auth.ts                         NextAuth config, getSessionUser(), requireRole()
  db.ts                           Single Prisma client
  storage.ts                      Photo storage
  days-ignored.ts                 The one place days-ignored is calculated
prisma/                           schema.prisma, migrations/, seed.ts
tests/unit/, tests/integration/, tests/e2e/
docs/                             PRD.md, design/, api/openapi.yaml, hw3/
```
Patterns:
- Pages and components never import Prisma. Route handlers call `lib/services`, services call `lib/db`.
- Server Components by default. `"use client"` only for forms, dialogs and the live-update hooks.
- Every route handler: `requireRole()`, Zod parse, call a service, return `{ data }` or `{ error: { code, message } }` with the right status (400, 401, 403, 404).
- Events are append-only. Never update or delete an `IncidentEvent`; corrections are new events.
- Data model (Prisma): `User` (role: TENANT | MANAGER | ORGANIZER, buildingId, unit), `Building`, `Incident` (category, title, description, reportedAt, reportedVia, status: OPEN | ACKNOWLEDGED | RESOLVED, tenantId, buildingId), `IncidentEvent` (type: REPORTED | PHOTO_ADDED | FOLLOW_UP | ACKNOWLEDGED | RESPONSE | RESOLVED, body, actorId, createdAt), `Photo` (incidentId, url, takenAt).

### 1.4 Naming and coding standards

- Files: components `PascalCase.tsx`, everything else `kebab-case.ts`. Tests mirror the file: `incident-service.test.ts`.
- `camelCase` for variables and functions, `PascalCase` for types and components, `SCREAMING_SNAKE_CASE` for constants and Prisma enums.
- API paths are plural nouns: `/api/incidents`, `/api/incidents/:id/events`. No verbs in paths.
- Booleans start with `is`, `has` or `can`. Handlers are `handleX`, props that take them are `onX`.
- No `any`. Named exports except Next.js pages and layouts. Functions under ~40 lines.
- Comments say why, not what. One-line JSDoc on exported service functions.
- Dates are stored in UTC and shown in the user's local time with the mono timestamp format from DESIGN.md.

### 1.5 Testing

- Test first. For each issue, commit the failing test (`test(scope): ... (#N)`), then the code, then refactor.
- Each acceptance criterion in the issue gets at least one test, named after the criterion.
- Unit tests for everything in `lib/services`, `lib/validation` and `lib/days-ignored.ts`. Integration tests for every route handler with a mocked session. One Playwright spec per user flow in section 2.3.
- Always test: empty input, invalid input, signed out (401), wrong role (403), someone else's incident (404).
- Coverage: 80% lines on `lib/`. CI fails below that.
- Every component in `components/ui/` (StatusBadge, DaysIgnoredBadge, ...) gets at least one render test covering each variant. (Added after HW3: run B left both badges at 0% coverage.)
- Use factories in `tests/factories/`. Freeze time with `vi.useFakeTimers()` for anything involving days ignored. Mock only external services (Blob storage, email).

## 2. PRD and design references

### 2.1 Source of truth

- Requirements live in `docs/PRD.md`. If the code and the PRD disagree, the PRD wins. Ask before changing behavior.
- UI follows `DESIGN.md`. Use the Tailwind theme tokens, never raw hex values.
- Before building a screen, open `docs/design/wireframe.html` and match its layout, labels and order.

### 2.2 What the mockups show

The wireframe has two screens. **Tenant timeline** (`/incidents/[id]`): breadcrumb, incident title, status badge and days-ignored badge in one row, up to 5 photo thumbnails, then a vertical timeline with mono timestamps and one event per row, and an "Add follow-up" button at the bottom. **Manager queue** (`/queue`): a table sorted by days ignored with columns Days ignored, Incident (title plus "Reported <time> by <channel>"), Unit, Status and Actions (Acknowledge, Respond, Resolve).

| Component | Where | Expected behavior |
|---|---|---|
| `IncidentForm` | `/incidents/new` | Fields from PRD US2. Inline Zod errors under each field. Submit disabled while uploading. |
| `PhotoUploader` | in `IncidentForm` | Max 5, JPEG/PNG/HEIC, 10 MB each, previews with remove buttons. |
| `IncidentTimeline` | `/incidents/[id]` | Events in time order, oldest first, mono timestamps. |
| `DaysIgnoredBadge` | cards, queue, timeline | Uses `lib/days-ignored.ts`. Muted under 3 days, amber 3 to 7, red over 7. |
| `StatusBadge` | everywhere | Text plus color, never color alone. |
| `QueueTable` | `/queue` | Sorted by days ignored, highest first. Respond and Resolve open a dialog with a required note. |

Every list has loading (skeleton), empty (one line plus one button) and error (message plus retry) states.

### 2.3 User flows

1. Sign in: `/login`, submit, land on `/incidents` (tenant), `/queue` (manager) or `/building` (organizer).
2. Log an incident: `/incidents`, "Log an incident", fill the form, add photos, submit, land on `/incidents/[id]` showing a Reported event and "0 days ignored".
3. Handle an incident: `/queue`, Acknowledge (event added, days-ignored stops), Respond with a note, Resolve with a note (row leaves the open list).
4. Tenant sees the response on `/incidents/[id]` (after refresh in Sprint 1, live in Sprint 2).
5. Organizer: `/building`, filter, Export PDF.

## 3. Scrum and workflow

- PO and Scrum Master rotate each sprint. Sprint 1: PO Marcus, SM [PLACEHOLDER: partner name]. Sprint 2: swap.
- Board columns: Backlog, Sprint Todo, In Progress, In Review, Done. Move the card when the state changes.
- Milestones: Sprint 1 due Nov 1, 2026. Sprint 2 due Nov 8, 2026. P2 due Nov 13, 2026.
- Only work on issues that exist. If something needs doing and has no issue, propose one (title, AC, labels) before writing code.
- Branches: one per issue from fresh `main`, `<type>/<issue>-<short-name>`, types `feature`, `fix`, `chore`, `docs`, `test`. Example: `feature/5-log-incident`.
- Commits: Conventional Commits with the issue, `<type>(<scope>): <summary> (#N)`, imperative, under 72 chars. Example: `feat(incidents): add photo upload to incident form (#5)`. Types: feat, fix, test, refactor, chore, docs, ci.
- PRs: same title format, body from `.github/pull_request_template.md` with `Closes #N`, how it was tested and screenshots for UI. One issue per PR, ideally under 400 lines. Merge only with green CI, a checked preview deploy and partner approval. Squash merge.
- Never commit to `main` directly. `TODO`s must name an issue: `// TODO(#9): switch to SSE`.

## 4. Do's and don'ts

### Do

- Stay inside this repo folder. Don't list, read or run commands in parent or sibling folders, even to "check how it was done before". If you need context that isn't in this repo, ask. (Added after HW3: both test runs went looking through `~/Desktop` on their own.)
- Read the issue and its AC first, and write a 3 to 5 bullet plan before coding.
- Copy the pattern of the nearest similar file before inventing a new one.
- Keep changes inside the issue. Note unrelated problems as new issue suggestions.
- Ask when a requirement is unclear.

### Don't

- Don't add a dependency without saying why. Preferred: Zod, date-fns, Prisma, NextAuth, `@vercel/blob`, `@react-pdf/renderer` (Sprint 2 export). Avoid: moment, lodash, axios, CSS-in-JS, UI kits.
- Don't build SQL strings from user input. Don't disable lint or TS rules to get green.
- Don't delete or weaken a failing test to make CI pass.
- Don't change the Prisma schema, rename files or add top-level folders unless the issue asks for it.

### Security

- Every route checks the session and role with `requireRole()`, then checks ownership: tenants only their incidents, managers only their buildings, organizers only their building.
- Validate all input on the server with Zod. Check photo type and size on the server too.
- Secrets only in env vars. Never commit `.env`; `.env.example` has names only. Never log passwords, tokens or photo URLs with tokens in them.
- Passwords hashed with bcrypt. Session cookie httpOnly, Secure, SameSite=Lax. No tokens in localStorage.
- The public score API returns aggregates only. No names, units, photos or incident text.
- CI and preview deploys use a test database, never prod.

### Accessibility

- WCAG 2.1 AA. Semantic HTML first; ARIA only when there's no native element.
- Every input has a visible `<label>`. Every photo thumbnail has alt text (category plus date).
- Everything works with the keyboard, with a visible focus ring. Text contrast at least 4.5:1.
- Status is never color alone; badges always include the word.
- Playwright runs an axe check on every page.

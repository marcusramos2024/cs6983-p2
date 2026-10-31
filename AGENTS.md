# AGENTS.md: [PLACEHOLDER: P2 project name]

<!--
  Shared rules file for every AI coding tool on this repo (Antigravity, Copilot, Cursor, Claude Code).
  One copy only, at the repo root. Do not duplicate it into .agents/, .cursor/ or .claude/.
  Claude Code: add a CLAUDE.md that contains only the line `@AGENTS.md` (a CLAUDE.md without it disables this file).
  Keep this file under ~200 lines. Link to docs/ instead of pasting long content here.
  Change this file only through a PR, and revisit it at every sprint retro.
  Lines marked [PLACEHOLDER: ...] must be replaced with P2 specifics before the HW3 test runs.
-->

## 1. Project context

<!-- One paragraph so the agent knows what it is building and for whom. Pull it from docs/PRD.md. -->
[PLACEHOLDER: 2-3 sentences. What the app does, who the primary user is, and the core problem it solves.]

- Team: Marcus Ramos and [PLACEHOLDER: partner name]. Course: CS 6983 AI Coding, Fall 2026 (Project 2).
- PRD: [docs/PRD.md](docs/PRD.md). Design system: [DESIGN.md](DESIGN.md). Mockups: [docs/design/](docs/design/).
- Live URL: [PLACEHOLDER: production URL once deployed]

### 1.1 Tech stack and versions

<!-- Defaults below come from the P2 stack list. Replace any row that differs, and pin real versions from package.json. -->
| Layer | Choice | Version |
|---|---|---|
| Language | TypeScript (strict mode) | [PLACEHOLDER: e.g. 5.x] |
| Runtime | Node.js | [PLACEHOLDER: e.g. 22 LTS] |
| Framework | Next.js, App Router, with API route handlers | [PLACEHOLDER: e.g. 15.x] |
| UI | React + Tailwind CSS (theme generated from DESIGN.md) | [PLACEHOLDER] |
| Database | PostgreSQL via Prisma ORM, hosted on [PLACEHOLDER: Supabase / Neon] | [PLACEHOLDER] |
| Auth | [PLACEHOLDER: Auth.js with GitHub/Google OAuth, or JWT in httpOnly cookie] | [PLACEHOLDER] |
| Validation | Zod | [PLACEHOLDER] |
| Unit / integration tests | Vitest + React Testing Library | [PLACEHOLDER] |
| E2E tests | Playwright | [PLACEHOLDER] |
| CI/CD | GitHub Actions; Vercel production + PR preview deploys | n/a |

### 1.2 Commands

<!-- Exact commands. The agent should run these, not guess. -->
- Install: `npm ci`
- Dev server: `npm run dev`
- Lint and format: `npm run lint` and `npm run format`
- Unit and integration tests: `npm test` (watch: `npm run test:watch`)
- E2E tests: `npm run test:e2e`
- Type check: `npm run typecheck`
- DB migration: `npx prisma migrate dev --name <change>`; seed: `npm run db:seed`
- Before calling any task done: `npm run lint && npm run typecheck && npm test` must pass.

### 1.3 Architecture and folder structure

<!-- Keep in sync with the real tree. If you add a top-level folder, add it here in the same PR. -->
```
app/                  Next.js routes (pages, layouts). Thin: fetch data, render components.
  api/                Route handlers. Validate input with Zod, call lib/services, return JSON.
components/           Reusable UI. components/ui/ = primitives, components/<feature>/ = feature UI.
lib/
  services/           Business logic. Pure where possible. No React, no Request/Response objects.
  db.ts               Single Prisma client instance.
  auth.ts             Auth config and getCurrentUser() helper.
  validation/         Zod schemas shared by API and forms.
prisma/               schema.prisma, migrations/, seed.ts
tests/
  unit/  integration/ Vitest
  e2e/                Playwright
docs/                 PRD.md, design/, api/openapi.yaml, sprints/, research/
```
Key patterns:
- Layering is one-directional: `app` uses `components` and `lib/services`; `lib/services` uses `lib/db`. Never import Prisma inside a component.
- Server Components by default. Add `"use client"` only for state, effects or event handlers.
- Every API route: authenticate, validate with Zod, call a service, return `{ data }` or `{ error: { code, message } }` with the right status code.
- [PLACEHOLDER: any project-specific pattern, e.g. real-time updates via polling/SSE/websockets, which P2 requires (real-time or complex state)]

### 1.4 Naming conventions and coding standards

- Files: components `PascalCase.tsx`; everything else `kebab-case.ts`. Tests mirror the source name: `item-service.test.ts`.
- Code: `camelCase` variables and functions, `PascalCase` types and components, `SCREAMING_SNAKE_CASE` constants.
- Database: Prisma models singular `PascalCase` (`Item`), fields `camelCase`, tables mapped to `snake_case` plural.
- API paths: plural nouns, kebab-case (`/api/[PLACEHOLDER: resources]`). REST verbs, no verbs in paths.
- Booleans start with `is`, `has` or `can`. Event handlers start with `handle`; props that receive them start with `on`.
- No `any`. No default exports except Next.js pages/layouts. Functions over classes. Keep functions under ~40 lines.
- Comments explain why, not what. Every exported service function gets a one-line JSDoc.

### 1.5 Testing strategy

<!-- P2 requires TDD: the failing test is committed before the code. -->
- TDD is required. For each issue: commit the failing test first (`test: ... (red)`), then the code that passes it, then refactor.
- Each acceptance criterion in the issue maps to at least one test. Name the test after the criterion.
- Unit: every function in `lib/services` and `lib/validation`. Integration: every API route against a test database (never production). E2E: one Playwright test per user flow in section 2.3.
- Always test error paths: empty input, invalid input, unauthenticated, forbidden (another user's data), not found.
- Coverage goal: 80% lines on `lib/`, [PLACEHOLDER: adjust] overall. CI fails below the threshold.
- Use factories in `tests/factories/` for test data. Do not hard-code IDs. Mock only external services, not our own code.

## 2. PRD and design references

### 2.1 Where the source of truth lives

- Requirements: [docs/PRD.md](docs/PRD.md) [PLACEHOLDER: or link to Google Doc]. If code and PRD disagree, the PRD wins; ask before diverging.
- Visual design: `DESIGN.md` (tokens: colors, type, spacing). UI work follows DESIGN.md. Use Tailwind theme tokens; never hard-code hex values or pixel sizes.
- Mockups: `docs/design/[PLACEHOLDER: filename(s)]`. Prototype link: [PLACEHOLDER: Claude artifact or Figma URL].
- When implementing a screen, open the matching mockup first and match its layout, copy and component order.

### 2.2 Mockup description and key UI components

<!-- Describe what the mockup shows in words. The agent cannot always open images, so this text is what it relies on. -->
[PLACEHOLDER: one paragraph per screen. Example shape: "Dashboard: top nav with app name and avatar menu; left column list of X sorted by Y; right panel with detail view; primary button 'Add X' top right."]

| Component | Where it appears | Expected behavior |
|---|---|---|
| [PLACEHOLDER: e.g. `NavBar`] | All authenticated pages | Shows app name, current user, sign-out. Collapses to a menu under 640px. |
| [PLACEHOLDER: e.g. `ItemList`] | [PLACEHOLDER] | [PLACEHOLDER: sorting, empty state text, loading skeleton] |
| [PLACEHOLDER: e.g. `ItemForm`] | [PLACEHOLDER] | Inline Zod validation errors under each field; submit disabled while pending. |
| [PLACEHOLDER] | [PLACEHOLDER] | [PLACEHOLDER] |

Every list or data view must have three states designed in: loading, empty (with a call to action), and error.

### 2.3 User flows the agent should follow

<!-- One numbered flow per core user story. E2E tests are written from these. -->
1. Sign in: visitor opens `/`, clicks "Sign in", completes [PLACEHOLDER: OAuth provider], lands on [PLACEHOLDER: /dashboard].
2. [PLACEHOLDER: core flow 1, written as steps, e.g. "User clicks Add X, fills fields A and B, submits, sees X at top of list with a success toast."]
3. [PLACEHOLDER: core flow 2]
4. [PLACEHOLDER: core flow 3]

## 3. Scrum and workflow

### 3.1 Roles and board

- Product Owner and Scrum Master rotate each sprint. Sprint 1: PO [PLACEHOLDER], SM [PLACEHOLDER]. Sprint 2: swap.
- Board columns: Backlog, Sprint Todo, In Progress, In Review, Done. Move the card when the state changes.
- Milestones: "Sprint 1" (due [PLACEHOLDER: date]) and "Sprint 2" (due [PLACEHOLDER: date]).
- Work only on issues that exist. If a request has no issue, propose one (title, acceptance criteria, labels) before writing code.

### 3.2 Branches

- One branch per issue, from up-to-date `main`: `<type>/<issue-number>-<short-kebab-description>`.
- Types: `feature`, `fix`, `chore`, `docs`, `test`. Example: `feature/12-add-item-form`.
- Never commit directly to `main`. Branch protection requires green CI and one partner approval.

### 3.3 Commit messages

Conventional Commits with the issue number:
```
<type>(<scope>): <imperative summary, max 72 chars> (#<issue>)

<optional body: why the change was made>
```
Example: `feat(items): add expiration date field to item form (#12)`. Types: feat, fix, test, refactor, chore, docs, ci.
Small commits. The red test commit comes before the implementation commit.

### 3.4 Pull requests

- Title: same format as a commit. Body uses `.github/pull_request_template.md`: `Closes #<issue>`, what changed, how it was tested, screenshots for UI, partner-review checkbox.
- Each PR addresses one issue. Keep diffs under ~400 lines where possible.
- Before opening: run the full check command (1.2) and self-review the diff with the AI against this file.
- Merge only after CI is green, the preview deploy is checked, and the partner approves. Squash merge.

### 3.5 Referencing issues in code

- Use `Closes #N` in PR bodies so merging closes the issue. Use `Refs #N` in commits that only partially address it.
- `TODO` comments must reference an issue: `// TODO(#34): handle pagination`. No bare TODOs.

## 4. Do's and don'ts

### 4.1 Do

- Do read the linked issue and its acceptance criteria before writing code, and restate the plan in 3-5 bullets first.
- Do follow existing patterns in the nearest similar file before inventing a new one.
- Do keep changes scoped to the issue. Note unrelated problems as new issue suggestions instead of fixing them.
- Do ask when a requirement is ambiguous instead of guessing.

### 4.2 Don't

- Don't add a dependency without saying why and checking it is maintained. Preferred: Zod (validation), date-fns (dates), Prisma (DB), [PLACEHOLDER: UI kit, e.g. shadcn/ui or none]. Avoid: moment, lodash (use native), axios (use fetch), CSS-in-JS libraries.
- Don't write raw SQL strings built from user input. Don't disable lint or TypeScript rules to make an error go away.
- Don't delete or weaken a failing test to make CI pass.
- Don't create new top-level folders, rename files, or change the schema unless the issue asks for it.

### 4.3 Security requirements

- Every API route checks the session and that the requested record belongs to the current user (no IDOR).
- Validate all input on the server with Zod, even if the client already validated.
- Secrets live only in environment variables. Never commit `.env`; `.env.example` lists names only. Never log tokens or passwords.
- Auth cookies: httpOnly, Secure, SameSite=Lax. No tokens in localStorage.
- CI and preview deploys use a test database, never production.

### 4.4 Accessibility requirements

- Target WCAG 2.1 AA. Semantic HTML first (`button`, `nav`, `main`, `label`); ARIA only when no native element fits.
- Every input has a visible `<label>`. Every image has meaningful `alt` text or `alt=""` if decorative.
- Everything works with keyboard only, with a visible focus ring. Color contrast at least 4.5:1 for text.
- Don't convey status by color alone; pair it with text or an icon label.
- Playwright E2E tests run an axe accessibility check on each page.

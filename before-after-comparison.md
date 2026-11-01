# HW3 Part 3: Before/after rules file test

Project: Paper Trail | Repo: https://github.com/marcusramos2024/cs6983-p2 | Author: Marcus Ramos

How the runs were done: every run used Antigravity IDE 2.6.0 on my Mac with the Gemini 3.8 Flash (High) model. The prompts were typed into Antigravity and the approval prompts were clicked by Claude (Anthropic) through computer use, not by me. I set the rules for what it could approve (below). The measuring was also done by Claude, by running the tests and reading the diffs. I checked the write-up.

## 1. What went wrong the first time (run A0)

My first "no rules" run is worth keeping because it failed in an interesting way.

- Setup: branch `hw3/run-a-no-rules`, made from tag `hw3-baseline`, with AGENTS.md and CLAUDE.md deleted in commit `6d05b2f`. The feature was a placeholder "item creation form" because the real PRD didn't exist yet.
- What the agent did: before writing anything it read `before-after-comparison.md` (this file, which at the time described the planned conventions), read the issue template, and "checked recent commits in detail". The commit that deleted AGENTS.md has the whole file in its diff, so one `git show` gives it back.
- Result: the "no rules" code followed AGENTS.md almost line for line. `lib/services/item-service.ts`, `lib/validation/item-schema.ts`, `components/items/`, the `{ error: { code, message } }` error shape, a red test commit before the feature commit, and `(#5)` on every commit message. 23 files, +1361 lines, 33 tests passing, 96.63% line coverage, typecheck clean.
- Lesson: deleting the rules file on a branch doesn't hide it. Git history and any doc that describes the conventions leak them right back in. For a fair test the "without" workspace needs no history and no docs that restate the rules.

Run A0 stays on its branch as evidence. It isn't used in the tables below.

## 2. Method for the clean runs

### 2.1 Feature under test

Issue #5, "Log an incident with photos" (PRD US2). Acceptance criteria, copied from the issue so both runs are judged the same way:

1. Form at `/incidents/new` with category, title (required, max 120), description (max 2000), reported-at (required, not in the future) and reported-via.
2. Up to 5 photos, JPEG/PNG/HEIC, 10 MB each, with previews and remove buttons.
3. Invalid input shows an error under the field and nothing is saved.
4. `POST /api/incidents` rejects the same invalid input with 400, even if the client check is skipped.
5. On success the tenant lands on `/incidents/[id]` with a Reported event and 0 days ignored.
6. Only tenants can create incidents (403 for other roles, 401 signed out).

### 2.2 Workspaces

Two fresh folders on the Desktop, each a new git repo with one commit, so there's no history to dig through:

| | `hw3-clean-a` (run A) | `hw3-clean-b` (run B) |
|---|---|---|
| README, DESIGN.md, docs/PRD.md, docs/design/wireframe.html, .github templates | yes | yes |
| AGENTS.md, CLAUDE.md | no | yes |
| HW3 write-ups (this file, reflection, issues.json) | no | no |
| Git history | 1 commit | 1 commit |

The only leftover hint in run A is one line in the PR template ("Self-reviewed the diff with AI against AGENTS.md"). I kept the templates identical in both on purpose.

Neither workspace has any app code yet, so both runs had to scaffold the app as well as build the feature. No `~/.gemini/GEMINI.md` exists, so there were no global rules.

### 2.3 Same in both runs

| | |
|---|---|
| Tool and model | Antigravity IDE 2.6.0, Gemini 3.8 Flash (High) |
| Node | 22.23.4 (installed in `~/.local/node` before either run) |
| Chat | brand-new conversation |
| Approvals | project-local commands allowed (which, ls, npm, npx, git, test runs). Nothing system-wide (no brew, no sudo, no global installs). Same answer to the same kind of prompt in both runs. |
| Follow-ups | none, unless the agent stopped and asked a question |

### 2.4 Exact prompts

Run A:
```
Implement this feature: let a tenant log an incident with photos. Tenants pick a category, give it a title and description, say when and how they reported it to the landlord, and attach up to 5 photos. Include tests.
```

Run B:
```
Implement GitHub issue #5: let a tenant log an incident with photos. Tenants pick a category, give it a title and description, say when and how they reported it to the landlord, and attach up to 5 photos. Include tests.

Follow AGENTS.md. Before writing code, read US2 in docs/PRD.md, DESIGN.md and docs/design/wireframe.html, then give me a short plan. Work test-first and use the commit and naming conventions in AGENTS.md.
```

### 2.5 How it was measured

Each result was copied out of the workspace (without node_modules) and checked fresh with `npm ci`, `npx vitest run --coverage` and `npx tsc --noEmit`, plus `git log` and `git diff --stat` against the baseline commit. Naming and folders were checked against AGENTS.md sections 1.3 and 1.4 by hand.

### 2.6 What actually happened during the runs

- Run A: Nov 1, about 00:55 to 01:12 UTC. Run B: Nov 1, 20:17 to about 20:35 UTC. Both prompts were typed by Claude. The run B prompt went in as one paragraph (same words as 2.4, no blank line).
- Run B stopped after its plan and asked "Shall I proceed with this plan?". The only follow-up in either run was "Yes, go ahead." Run A never asked.
- Both agents left the workspace. `ls` ran without asking (it's on Antigravity's default allow list), so both saw the sibling folders. Run A then asked to run `git status`/`git log` in the main repo; I skipped it. Run B ran several read-only commands without asking (listing `hw3-clean-a` and `hw3-tools`, reading the helper scripts, `git log` and `git show --stat` on run A's commits) and asked to read `hw3-clean-a/package.json` and the main repo's `issues.json`, both skipped. So run B saw run A's commit messages and file list, but not its code. This is a real limit on how clean the comparison is.
- Both agents wrote into the review panel and committed, then the editor added a trailing newline to ~30 files. Those leftovers were committed separately when pushing.

## 3. Results

Branches: `hw3/run-a-clean` (no rules) and `hw3/run-b-clean` (with rules). Screenshots of the end of each chat: `docs/hw3/run-a-chat.jpg`, `docs/hw3/run-b-chat.jpg`. Run A0 for reference: `docs/hw3/run-a0-chat.jpg`.

### 3.1 Numbers

| Metric | Run A (no rules) | Run B (with rules) |
|---|---|---|
| Follow-up prompts | 0 | 1 ("Yes, go ahead." after the plan) |
| Time | about 17 min | about 17 min |
| Files the agent changed (its own count) | 36, +2084 | 36 |
| App code lines (excluding tests and lockfile) | 1,280 | 1,100 |
| Test code lines | 507 | 809 |
| Test files / tests | 5 / 31 | 8 / 40 |
| Tests passing | 31 / 31 | 40 / 40 |
| Line coverage on lib | 60.4% (`src/lib`) | 89.6% (`lib`) |
| Line coverage, all app code | 40.9% | 64.3% |
| TypeScript errors (`tsc --noEmit`) | 0 | 0 |
| ESLint | clean | clean |
| Test commit before feature commit | yes | yes |
| Commit format `type(scope): summary (#5)` | 0 of 2 (`test: ... (issue #5)`) | 2 of 2 |
| Branch name | stayed on `main` | `feature/5-log-incident` |
| Hard-coded hex colors in components | 6 | 0 |
| Uses `vi.useFakeTimers()` for time-based tests | no | yes (2 files) |
| New dependencies outside the AGENTS.md list | none extra, but no Zod and no date-fns | Zod, date-fns (both on the list) |

### 3.2 Code quality and project patterns

| Check | Run A | Run B |
|---|---|---|
| Layering (route, service, db) | Route handler talks to Prisma directly through a transaction | Route calls `lib/services/incident-service.ts`, which calls `lib/db.ts` |
| Server-side validation | Hand-written checks in `src/lib/validation.ts` | Zod schema in `lib/validation/incident-schema.ts` |
| Error shape | `{ error: "Unauthorized" }`, `{ errors: [...] }` | `{ error: { code, message } }` everywhere |
| Auth and role check | Inline session and role check in the route | `requireRole("TENANT")` throwing an `AuthError` |
| Database | SQLite (`prisma/dev.db`), even though the README says Postgres | Postgres, matching the stack table |

Run A, `src/app/api/incidents/route.ts` (trimmed):
```ts
const session = await getServerSession(authOptions);
if (!session || !session.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
...
return NextResponse.json({ errors: validation.errors }, { status: 400 });
```

Run B, `app/api/incidents/route.ts` (trimmed, JSON-body try/catch removed):
```ts
const user = await requireRole("TENANT");
const parsed = createIncidentSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { error: { code: "VALIDATION_ERROR", message: firstIssue, details: parsed.error.issues } },
    { status: 400 }
  );
}
const incident = await createIncident(parsed.data, user);
return NextResponse.json({ data: incident }, { status: 201 });
```

### 3.3 Design and mockup intent

| Check | Run A | Run B |
|---|---|---|
| Read DESIGN.md and the wireframe | Not asked to. It did use the DESIGN.md color values, typed in as hex | Yes, it said so in its plan |
| Tailwind theme from DESIGN.md tokens | Partly. Some components hard-code the hex values | Yes, no raw hex in components |
| Badges and timeline components | `StatusBadge`, `DaysIgnoredBadge`, `IncidentTimeline` in a flat `src/components/` | `components/ui/StatusBadge.tsx`, `components/ui/DaysIgnoredBadge.tsx`, feature components in `components/incidents/` |
| Visible labels on form fields | yes | yes |

Neither run had a database running, so I didn't click through the pages. This comparison is from the code and tests, not from screenshots of the UI.

### 3.4 Naming and folders (against AGENTS.md 1.3 and 1.4)

| Check | Run A | Run B |
|---|---|---|
| Root `app/`, `components/`, `lib/`, `tests/` | No, everything under `src/`, tests next to the code | Yes |
| `lib/db.ts`, `lib/storage.ts`, `lib/services/`, `lib/validation/` | `lib/prisma.ts`, no storage module, no services folder, one `validation.ts` | All present |
| Test names mirror the file (`incident-service.test.ts`) | Partly | Yes |
| Branch `feature/5-...` | No | Yes |

### 3.5 Tests

| Check | Run A | Run B |
|---|---|---|
| API: 401, 403, 400, 201 | all four | all four |
| Validation edge cases | 14 tests | 8 tests |
| Days-ignored logic | 3 tests, real clock | 7 tests, frozen clock |
| Storage (photo save) | none | 2 tests |
| Auth helper | none | 7 tests |
| UI badges | not tested | not tested (0% coverage) |

### 3.6 What the numbers say

- The rules file clearly worked for structure and conventions: folders, naming, error shape, Zod, Postgres, commit format, branch name and no hard-coded colors all went from mostly wrong in run A to right in run B.
- It also helped testing. Run B wrote more tests in more places and hit 89.6% on `lib/`, over the 80% bar AGENTS.md sets. Run A hit 60.4%.
- Some things didn't need the rules: both runs wrote tests first, probably because the issue template and PR template both say "failing test committed first". Both covered 401/403/400/success.
- Run B still missed the UI badges entirely. AGENTS.md didn't say components need tests, so that went into v2.
- The biggest surprise was how much both agents wandered outside the workspace. The run A0 attempt got the whole rules file back from git history, and the clean runs listed sibling folders and run B read run A's commit log. For a fair test the workspaces need to be somewhere the agent can't see each other, and the rules file should tell it to stay put.

## 4. What changed in AGENTS.md

| Version | Change | Why |
|---|---|---|
| v1 | Paper Trail rules file | First real version |
| v2 | "Stay inside this repo folder" rule in section 4 | Both clean runs listed sibling folders, run B read run A's git history, and run A0 recovered the deleted rules from git |
| v2 | Every `components/ui` component gets a render test for each variant (section 1.5) | Run B left `StatusBadge` and `DaysIgnoredBadge` at 0% coverage |

Not re-run with v2 yet. A confirmation run would go in a separate folder outside `~/Desktop/cs6983-p2` so it can't see the other runs.

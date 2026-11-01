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

## 3. Results

[RESULTS PENDING: filled in from the clean runs]

## 4. What changed in AGENTS.md

| Version | Change | Why |
|---|---|---|
| v1 | Paper Trail rules file | First real version |

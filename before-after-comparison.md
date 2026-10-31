# HW3 Part 3: Before/after rules file comparison

Project: [PLACEHOLDER: P2 name] | Repo: [PLACEHOLDER: repo URL] | Author: Marcus Ramos
Status: methodology complete; results not yet run. Every result cell below must come from the actual runs.

## 1. Methodology

### 1.1 Feature under test

- Issue: #5 "[PLACEHOLDER] Add [PLACEHOLDER: core entity] creation form" (Sprint 1)
- Why this issue: it touches the UI, validation, the API layer and tests at once, so differences in all four dimensions can show up.
- IMPORTANT: the P2 PRD and mockups did not exist when this test was set up, so the feature below is a minimal stand-in definition, not real P2 content. If the real PRD is ready before the runs, replace it with the real story and keep both prompts identical apart from the rules pointer.
- Stand-in definition: the core entity is an `Item` with `name` (required, 1 to 80 characters), `quantity` (whole number, at least 1, default 1) and `notes` (optional, up to 500 characters). The form lives on `/items/new`, posts to `POST /api/items`, and on success returns to `/items` with the new item at the top. No database yet: an in-memory store behind the service layer is acceptable for this test.
- Acceptance criteria (both runs are judged against this list):
  1. Submitting a valid item creates it and shows it at the top of the list.
  2. Empty name, name over 80 characters, or quantity below 1 shows an inline error under the field and nothing is saved.
  3. The API rejects the same invalid input with a 400 and an error message, even if the client check is bypassed.
  4. The submit button is disabled while the request is in flight.
  5. Every input has a visible label.
  6. Tests exist for the validation rules and the API route, and they pass.

### 1.2 Controlled variables

Both runs use the same:

| Variable | Value |
|---|---|
| Tool | [PLACEHOLDER: Antigravity version. If the runs were done in a different tool (for example Claude Code or Claude in Cowork), state that here plainly.] |
| Model | [PLACEHOLDER: model name shown in the tool] |
| Agent mode | [PLACEHOLDER: e.g. Agent mode, Planning on] |
| Starting commit | `hw3-baseline` tag ([PLACEHOLDER: short SHA]) |
| Feature description | Identical sentence in both prompts (see 1.4) |
| Follow-up policy | Up to 2 follow-up prompts, only to report errors verbatim (e.g. pasted test output). No design hints. |
| Conversation | Brand-new chat for each run, no prior context |

The only intended difference: run A has no rules file and no pointers to the PRD or mockups; run B has AGENTS.md in place and the prompt points to it.

### 1.3 Branch setup

```
git checkout main && git pull
git tag hw3-baseline            # the shared starting point
git push origin hw3-baseline

# Run A: without rules
git checkout -b hw3/run-a-no-rules hw3-baseline
git rm AGENTS.md CLAUDE.md 2>/dev/null; git rm -r .agents 2>/dev/null
git commit -m "chore: remove rules files for HW3 baseline run (#5)"

# Run B: with rules
git checkout -b hw3/run-b-with-rules hw3-baseline
```

How the rules file is disabled for run A:
- AGENTS.md (and CLAUDE.md, `.agents/`, if present) are deleted on the run A branch only, as above.
- Check that no global rules apply: in Antigravity, open the rules/customizations settings and confirm no global rules file is active ([PLACEHOLDER: note what you found]). Temporarily rename it if one exists, and restore it before run B.
- Close and reopen the workspace in the IDE after switching branches so the tool does not keep a cached copy of the rules.
- Leave `docs/PRD.md` and `docs/design/` in place on both branches. Run A is not told about them; note in the results whether the agent found them anyway.

Both experiment branches are pushed and kept (not merged) as evidence. The winning implementation is then redone or cherry-picked on the real branch `feature/5-add-item-creation-form` and goes through a normal PR.

### 1.4 Exact prompts

Run A (without rules), brief description only. Paste exactly:
```
Implement this feature: add an item creation form. Users should be able to add a new item with a name, a quantity and optional notes, and see it in the item list. Include tests.
```

Run B (with rules). Paste exactly:
```
Implement GitHub issue #5: add an item creation form. Users should be able to add a new item with a name, a quantity and optional notes, and see it in the item list. Include tests.

Follow AGENTS.md. Before writing code, read the acceptance criteria for issue #5 in before-after-comparison.md section 1.1, docs/PRD.md and DESIGN.md, then give me a short plan. Work test-first and use the branch, commit and naming conventions in AGENTS.md.
```
Note: run B points at section 1.1 of this file because docs/PRD.md is still a stub. That gives run B the acceptance criteria and run A does not, which is the intended difference (rules and project context versus a brief description).

Follow-up prompts actually used (record verbatim, or "none"):
- Run A: [PLACEHOLDER]
- Run B: [PLACEHOLDER]

### 1.5 What gets measured

Run these on each branch after the agent finishes, before any manual fixes:

```
git diff --stat hw3-baseline...HEAD            # files and lines changed
git log --oneline hw3-baseline..HEAD           # commit messages and order (test-first?)
npm run lint 2>&1 | tail -n 5                  # lint errors and warnings
npm run typecheck 2>&1 | tail -n 5             # TypeScript errors
npm test -- --coverage                         # tests passing, coverage on changed files
npm run test:e2e                               # E2E and axe results, if the run produced E2E tests
```

Also record wall-clock time from first prompt to "done", and the number of follow-up prompts.

## 2. Results

### 2.1 Measurable summary

| Metric | Without rules (A) | With rules (B) | Notes |
|---|---|---|---|
| Follow-up prompts needed | | | |
| Time to working feature (min) | | | |
| Files changed / lines added | | | |
| Files created outside the documented folder structure | | | |
| Lint errors / warnings | | | |
| TypeScript errors | | | |
| Tests written (unit / integration / E2E) | | | |
| Tests passing | | | |
| Coverage on changed files (%) | | | |
| Acceptance criteria met (of [PLACEHOLDER: total]) | | | |
| Naming convention violations (count) | | | |
| New dependencies added | | | |
| Failing test committed before implementation (yes/no) | | | |
| Commit messages follow the format (x of y) | | | |
| axe accessibility violations (serious/critical) | | | |

### 2.2 Code quality and consistency with project patterns

| Check | Without rules (A) | With rules (B) |
|---|---|---|
| Layering (API route, service, db) respected | | |
| Zod validation on the server | | |
| Error response shape `{ error: { code, message } }` | | |
| Server vs client components used correctly | | |
| Auth and ownership checks on the API route | | |

Snippet A (file: [PLACEHOLDER]):
```ts
[PLACEHOLDER: paste a short representative excerpt]
```
Snippet B (file: [PLACEHOLDER]):
```ts
[PLACEHOLDER: paste the matching excerpt]
```
What differs: [PLACEHOLDER]

### 2.3 Understanding of design and mockup intent

| Check | Without rules (A) | With rules (B) |
|---|---|---|
| Layout and component order match the mockup | | |
| Uses DESIGN.md / Tailwind tokens (no hard-coded colors) | | |
| Copy and labels match the mockup | | |
| Loading, empty and error states present | | |
| Mobile width (375px) works | | |

Screenshots: [PLACEHOLDER: screenshots/run-a.png] and [PLACEHOLDER: screenshots/run-b.png], next to the mockup [PLACEHOLDER: docs/design/file].
What differs: [PLACEHOLDER]

### 2.4 Adherence to naming and architecture

| Check | Without rules (A) | With rules (B) |
|---|---|---|
| File names follow conventions | | |
| Files placed in the documented folders | | |
| Branch and commit format followed | | |
| Issue referenced in commits / TODOs | | |

Examples of violations: [PLACEHOLDER: list specific file names or lines]

### 2.5 Quality of tests

| Check | Without rules (A) | With rules (B) |
|---|---|---|
| Each acceptance criterion has a test | | |
| Error paths tested (empty, invalid, unauthenticated, forbidden) | | |
| Tests use factories instead of hard-coded data | | |
| Tests actually fail when the feature is removed | | |

What differs: [PLACEHOLDER]

## 3. Takeaways and changes to the rules file

What the rules file clearly improved: [PLACEHOLDER: only what the tables above show]

Where run B still missed: [PLACEHOLDER]

### 3.1 Rules file change log

| Version | Change | Reason (link to the result above) |
|---|---|---|
| v1 | Initial AGENTS.md | n/a |
| v2 | [PLACEHOLDER] | [PLACEHOLDER] |
| v2 | [PLACEHOLDER] | [PLACEHOLDER] |

Optional confirmation run: re-run B with AGENTS.md v2 on `hw3/run-b-with-rules-v2` and add a column to table 2.1.

# HW3 Part 3: Before/after rules file comparison

Project: [PLACEHOLDER: P2 name] | Repo: [PLACEHOLDER: repo URL] | Author: Marcus Ramos
Status: methodology complete; results not yet run. Every result cell below must come from the actual runs.

## 1. Methodology

### 1.1 Feature under test

- Issue: #[PLACEHOLDER: N] "[PLACEHOLDER: issue title]" (Sprint 1)
- Why this issue: [PLACEHOLDER: one sentence]. Suggested pick: the creation-form issue, because it touches the mockup, validation, the API layer and tests at once, so differences in all four dimensions show up.
- Acceptance criteria (copied from the issue so both runs are judged against the same list):
  1. [PLACEHOLDER]
  2. [PLACEHOLDER]
  3. [PLACEHOLDER]

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
git checkout -b experiment/[N]-without-rules hw3-baseline
git rm AGENTS.md CLAUDE.md 2>/dev/null; git rm -r .agents 2>/dev/null
git commit -m "chore: remove rules files for HW3 baseline run (#[N])"

# Run B: with rules
git checkout -b experiment/[N]-with-rules hw3-baseline
```

How the rules file is disabled for run A:
- AGENTS.md (and CLAUDE.md, `.agents/`, if present) are deleted on the run A branch only, as above.
- Check that no global rules apply: in Antigravity, open the rules/customizations settings and confirm no global rules file is active ([PLACEHOLDER: note what you found]). Temporarily rename it if one exists, and restore it before run B.
- Close and reopen the workspace in the IDE after switching branches so the tool does not keep a cached copy of the rules.
- Leave `docs/PRD.md` and `docs/design/` in place on both branches. Run A is not told about them; note in the results whether the agent found them anyway.

Both experiment branches are pushed and kept (not merged) as evidence. The winning implementation is then redone or cherry-picked on the real branch `feature/[N]-[PLACEHOLDER: short-description]` and goes through a normal PR.

### 1.4 Exact prompts

Run A (without rules), brief description only:
```
Implement this feature: [PLACEHOLDER: issue title]. [PLACEHOLDER: one-sentence description of the feature, e.g. "Users should be able to add a new item with a name, quantity and date."] Include tests.
```

Run B (with rules):
```
Implement GitHub issue #[N]: [PLACEHOLDER: issue title]. [PLACEHOLDER: same one-sentence description as run A.] Include tests.

Follow AGENTS.md. Before writing code, read the user story and acceptance criteria for this issue in docs/PRD.md and the mockup in docs/design/[PLACEHOLDER: file], then give me a short plan. Work test-first and use the branch, commit and naming conventions in AGENTS.md.
```

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

Optional confirmation run: re-run B with AGENTS.md v2 on `experiment/[N]-with-rules-v2` and add a column to table 2.1.

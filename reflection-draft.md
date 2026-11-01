# HW3 Reflection: Context Engineering, Rules and Process

Marcus Ramos | CS 6983 AI Coding, Fall 2026 | P2: Paper Trail

## 1. From PRD and mockups to implementation

I tested this on issue #5 (log an incident with photos). Both runs had the PRD, DESIGN.md and wireframe. Without AGENTS.md, the agent built a working feature with passing tests, but it put everything in `src/`, used SQLite even though the README says Postgres, wrote its own validation instead of using Zod, hard-coded six hex colors, and returned errors in three different shapes. With AGENTS.md, it matched our folder layout, used Postgres and Zod, returned `{ error: { code, message } }` everywhere, and used theme tokens with no raw hex. The PRD told both runs what to build. AGENTS.md is what made run B build it our way.

## 2. How the Scrum setup helped

Issue #5 has six acceptance criteria as a checklist, so I graded both runs against the same list. Both covered the 401, 403, 400 and success cases.

The templates mattered more than I expected. Both runs committed failing tests first, even run A, which had no rules file. The only thing telling it to do that was the issue and PR templates ("failing test committed first"). So the Scrum setup works as context, not just tracking.

Run B also followed the branch and commit conventions (`feature/5-log-incident`, `test(incidents): ... (#5)`). Run A stayed on `main` and wrote `test: ... (issue #5)`. B's history links back to the board. A's doesn't.

## 3. What worked, what didn't, what I changed

Worked:

- Conventions. Run B matched AGENTS.md on folders, naming, error shape, validation, database and commit format. Run A missed nearly all of them.
- Testing. Run B wrote 40 tests across 8 files (809 lines) and hit 89.6% line coverage on `lib/`. Run A wrote 31 tests across 5 files and hit 60.4%. B also froze the clock for the days-ignored tests, which AGENTS.md asks for.

Didn't work:

- Run B left `StatusBadge` and `DaysIgnoredBadge` at 0% coverage. AGENTS.md never said components need tests.
- The agents wandered out of their folder. My first no-rules run (A0) found the deleted AGENTS.md in git history and copied it, so it was useless as a baseline. In the clean runs, both agents listed the sibling folders, and B read A's git log before I could stop it. Antigravity runs `ls` and read-only git commands without asking, so I couldn't block it.

AGENTS.md v2 adds two rules: stay inside the repo folder and ask instead of looking around `~/Desktop`, and every component in `components/ui` gets a render test for each variant. I haven't re-run with v2. If I do, the workspaces need to be somewhere the agents can't see each other.

## 4. Sprint 2

- Keep each experiment or worktree outside the main project folder, and leave Antigravity's terminal setting on "Require Review".
- Add testing notes for the SSE stream (#8) and PDF export (#10), or the agent will skip them like it skipped the badges.
- Add the real-time pattern to section 1.3 once we pick one.
- Keep CLAUDE.md as a one-line `@AGENTS.md` import so the rules carry over to Claude Code in Week 9.

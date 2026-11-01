# HW3 Reflection: Context Engineering, Rules and Process

DRAFT. Written from the real runs and numbers in `before-after-comparison.md`, but it still needs to be rewritten in my own words before I submit it. The runs were typed and approved by Claude through computer use on my Mac, not by me, and the reflection should say that honestly.

Marcus Ramos | CS 6983 AI Coding, Fall 2026 | P2: Paper Trail

## 1. From PRD and mockups to implementation

For Project 1 I built Use It Up inside one Claude Web chat, so all the context lived in the conversation. P2 is split across a partner, an IDE, lots of short agent sessions and a real repo, so the context has to live in files the agent reads every time. AGENTS.md is that file. It points to the PRD, DESIGN.md and the wireframe instead of copying them, describes each screen and component in words because the agent can't always look at an image, and spells out the user flows.

The test on issue #5 ("Log an incident with photos") showed how much that matters. Both runs had the PRD, DESIGN.md and the wireframe in the folder. Without AGENTS.md the agent still built a working feature with passing tests, but it put everything under `src/`, used SQLite even though the README says Postgres, wrote its own validation instead of Zod, hard-coded six hex colors, and returned errors in three different shapes. With AGENTS.md it matched the folder layout, used Zod and Postgres, used `{ error: { code, message } }` everywhere, and used the theme tokens with no raw hex. The PRD told both runs what to build. The rules file is what made run B build it the way our project does things.

## 2. How the GitHub Scrum setup organizes AI-assisted work

The board and the 13 issues gave the agent a clear scope. Issue #5 has six acceptance criteria as a checklist, so I could grade both runs against the same list instead of a gut feeling. Both runs covered the 401, 403, 400 and success cases from that list.

The templates had a bigger effect than I expected. Both runs committed failing tests before the feature, even run A, which had no rules file. The only place that told it to do that was the issue and PR templates ("failing test committed first"). So the Scrum setup itself works as context, not just as tracking.

Run B also followed the branch and commit conventions: `feature/5-log-incident` and `test(incidents): ... (#5)`, `feat(incidents): ... (#5)`. Run A stayed on `main` and wrote `test: ... (issue #5)`. That's the difference between a commit history I can link to the board and one I can't.

## 3. What worked, what didn't, and what changed

What worked:

- Structure and conventions. Run B matched AGENTS.md on folders, naming, error shape, validation library, database and commit format. Run A missed almost all of those.
- Testing. Run B wrote 40 tests across 8 files (809 lines of tests) and hit 89.6% line coverage on `lib/`. Run A wrote 31 tests across 5 files and hit 60.4%. Run B also froze the clock for the days-ignored tests, which AGENTS.md asks for.

What didn't:

- Run B still left the UI badges (`StatusBadge`, `DaysIgnoredBadge`) at 0% coverage. AGENTS.md never said components need tests.
- The agents didn't stay in their folder. My first "no rules" run (A0) found the deleted AGENTS.md through git history and copied its conventions almost exactly, which made it useless as a baseline. In the clean runs, both agents listed the sibling folders, and run B read run A's git log before I could stop it. `ls` and some read-only git commands run without asking in Antigravity, so I couldn't block all of it.

What I changed in AGENTS.md (v2):

- A rule to stay inside the repo folder and ask instead of looking around `~/Desktop`.
- A rule that every component in `components/ui` gets a render test for each variant.

I haven't re-run with v2 yet. If I do, the workspaces need to be somewhere the agent can't see each other.

## 4. What I'd add or change for Sprint 2

- Put each experiment or worktree outside the main project folder, and keep Antigravity's terminal setting on "Require Review" so read-only commands outside the repo still need approval.
- Add a short testing note for the Sprint 2 features: the SSE stream in #8 and the PDF export in #10 both need examples of how to test them, or the agent will skip them like it skipped the badges.
- Write the real-time pattern into section 1.3 once we pick it.
- Keep CLAUDE.md as the one-line `@AGENTS.md` import so the same rules carry over to Claude Code in Week 9.
- Go over AGENTS.md at the Sprint 1 retro with [PLACEHOLDER: partner name] and keep it under about 200 lines.

# HW3 Reflection: Context Engineering, Rules and Process

DRAFT for Marcus to edit. The starter prose describes the setup only. Every sentence about results is a [PLACEHOLDER] until the before/after runs are done. Target length: 1-2 pages.

Marcus Ramos | CS 6983 AI Coding, Fall 2026 | P2: [PLACEHOLDER: project name]

## 1. From PRD and mockups to implementation

For Project 1 I built Use It Up entirely inside one Claude Web chat. That worked because the whole context lived in the conversation: I pasted in the problem from my interviews, asked for a plan and data model first, and then built one feature at a time. P2 is different. The work is split across a partner, an IDE, many short agent sessions and a real repo, so the context can't live in one chat anymore. The rules file is how I move that context out of my head and the PRD and into something the agent reads every time.

The AGENTS.md I wrote does three things for that. It points to the PRD and mockups as the source of truth instead of pasting them in, so there is only one copy to keep current. It describes each screen and key component in words, because the agent can't always open an image, and it lists every list view's loading, empty and error states so they don't get skipped. And it writes out the user flows step by step, which doubles as the outline for our Playwright tests.

[PLACEHOLDER: 2-3 sentences on what actually happened. For example, whether run B matched the mockup layout and run A didn't, with one concrete detail from comparison section 2.3.]

## 2. How the GitHub Scrum setup organizes AI-assisted work

The board and issues give the agent a scope. Each issue has an action-oriented title and acceptance criteria written as a checklist, so I can hand the agent one issue instead of a vague feature request, and judge the output against a list instead of a feeling. The branch and commit format (`feature/12-add-item-form`, `feat(items): ... (#12)`) means every AI-generated change traces back to an issue, and `Closes #N` in the PR moves the card when we merge.

It also keeps the agent from drifting. The rules file tells it to work only on issues that exist and to suggest a new issue rather than fixing unrelated things, which matters more with AI than without it, since the agent will happily refactor files nobody asked about.

[PLACEHOLDER: one or two sentences from actual experience. For example, whether the issue checklist made the comparison easier to grade, or whether any issue turned out too big for one agent session.]

## 3. What worked, what didn't, and what changed

What worked: [PLACEHOLDER: only items backed by comparison table 2.1. Example shape: "With rules, the agent followed the folder structure in x of y files versus z without."]

What didn't: [PLACEHOLDER: where run B still missed. Be specific: a naming rule it ignored, a test it skipped, a mockup detail it got wrong.]

What I changed in the rules file: [PLACEHOLDER: summarize the v2 rows from the change log in section 3.1 of the comparison, and why each one was added.]

[PLACEHOLDER, optional: result of the confirmation run with v2, if done.]

## 4. What I'd add or change for Sprint 2

- [PLACEHOLDER: a rule driven by a specific Sprint 1 miss]
- Path-scoped rules for tests, if the general testing section turns out too generic for API route tests. [PLACEHOLDER: keep or delete based on results]
- Document the real-time update pattern in the architecture section once we pick it, since that is a Sprint 2 feature and the agent will otherwise invent its own approach.
- Add a CLAUDE.md that imports AGENTS.md before we move to Claude Code in Week 9, so the same rules carry over.
- Revisit AGENTS.md at the Sprint 1 retro with [PLACEHOLDER: partner name] and keep it under about 200 lines.

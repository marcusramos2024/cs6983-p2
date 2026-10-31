# GitHub Scrum setup: script and manual steps

## Part A. Run the script

1. Fill in every `[PLACEHOLDER: ...]` in `issues.json` from your PRD. Keep at least 10 issues and at least 5 per sprint (P2 requires 5+ per milestone).
2. Install and authenticate:
   ```
   brew install gh jq
   gh auth login
   gh auth refresh -s project
   ```
3. Preview first, then run for real:
   ```
   cd github-setup
   chmod +x setup_github.sh
   DRY_RUN=1 REPO=owner/repo SPRINT1_DUE=YYYY-MM-DD SPRINT2_DUE=YYYY-MM-DD ./setup_github.sh
   REPO=owner/repo SPRINT1_DUE=YYYY-MM-DD SPRINT2_DUE=YYYY-MM-DD ./setup_github.sh
   ```
4. Copy `../.github/` (issue and PR templates) and `../AGENTS.md` into the repo root and commit them on a `docs/` branch through a PR.

If the repo belongs to your partner or an organization, you need write access to the repo, and the project is created under that owner.

## Part B. Board columns by hand (only if the script pauses)

The script tries to set the Status options through the API. If that fails:

1. Open the project, click the three-dot menu at top right, then Settings.
2. Under Fields, click Status.
3. Rename "Todo" to "Backlog". Keep "In Progress" and "Done".
4. Add options "Sprint Todo" and "In Review".
5. Drag the options into this order: Backlog, Sprint Todo, In Progress, In Review, Done.
6. Go back to the terminal and press Enter. The script continues with issue creation.

## Part C. Board layout (always manual)

The GitHub API cannot change project views, so this step is by hand:

1. Open the project. On the default view tab, click the view dropdown and choose Layout: Board.
2. Set Column field to Status.
3. Rename the view to "Sprint Board" and click Save.
4. Optional: add a second view in Table layout grouped by Milestone, to show estimates per sprint.

## Part D. Fully manual fallback (no CLI)

1. Labels: repo, Issues, Labels, New label. Create feature, bug, chore, docs, priority:high, priority:medium, priority:low.
2. Milestones: Issues, Milestones, New milestone. "Sprint 1" and "Sprint 2" with your due dates.
3. Project: your profile (or org), Projects, New project, Board template. Then Part B and Part C. Link it to the repo under the repo's Projects tab.
4. Issues: New issue, choose the "User story" template, paste title, story and acceptance criteria from `issues.json`, set labels and milestone, and add to the project.
5. On the board, drag every Sprint 1 issue into Sprint Todo and leave Sprint 2 issues in Backlog.

## Part E. Check before submitting

- [ ] Board view shows the five columns in order
- [ ] Both milestones have due dates
- [ ] 10+ issues, each with a checklist, a type label, a priority label and a milestone
- [ ] All Sprint 1 issues are in Sprint Todo
- [ ] Take a screenshot of the board and the milestones page for the submission

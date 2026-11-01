#!/usr/bin/env bash
# setup_github.sh: HW3 Scrum setup for a P2 repo.
#
# Creates labels, the Sprint 1 and Sprint 2 milestones, a GitHub Project with the
# five Status columns (Backlog, Sprint Todo, In Progress, In Review, Done), and the
# issues from issues.json. Sprint 1 issues go to "Sprint Todo", Sprint 2 to "Backlog".
#
# Requirements: gh (logged in), jq.
#   gh auth login
#   gh auth refresh -s project      # Projects v2 needs the "project" scope
#
# Usage:
#   REPO=owner/repo SPRINT1_DUE=2026-11-10 SPRINT2_DUE=2026-11-24 ./setup_github.sh
#
# Optional env vars:
#   ISSUES_FILE    path to issues JSON (default: issues.json next to this script)
#   PROJECT_TITLE  board name (default: "<repo name> Scrum Board")
#   PROJECT_NUMBER reuse an existing project instead of creating one
#   DRY_RUN=1      print what would happen, change nothing
#
# Safe to re-run: labels are upserted, milestones and issues are skipped if a match
# with the same title already exists.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ISSUES_FILE="${ISSUES_FILE:-$SCRIPT_DIR/issues.json}"
DRY_RUN="${DRY_RUN:-0}"

die() { echo "ERROR: $*" >&2; exit 1; }
log() { echo "== $*"; }
run() { if [[ "$DRY_RUN" == "1" ]]; then echo "[dry-run] $*"; else "$@"; fi; }

# ---------------------------------------------------------------------------
# 0. Preflight checks
# ---------------------------------------------------------------------------
command -v gh >/dev/null || die "gh CLI not found. Install: https://cli.github.com"
command -v jq >/dev/null || die "jq not found. Install: brew install jq"
[[ -n "${REPO:-}" ]] || die "Set REPO=owner/repo"
[[ "${SPRINT1_DUE:-}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || die "Set SPRINT1_DUE=YYYY-MM-DD"
[[ "${SPRINT2_DUE:-}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || die "Set SPRINT2_DUE=YYYY-MM-DD"
[[ -f "$ISSUES_FILE" ]] || die "Issues file not found: $ISSUES_FILE"
jq empty "$ISSUES_FILE" || die "$ISSUES_FILE is not valid JSON"

# Refuse to publish template text. Only the issues array is checked, not _instructions.
if jq -r '.issues | tostring' "$ISSUES_FILE" | grep -q '\[PLACEHOLDER'; then
  die "issues.json still contains [PLACEHOLDER ...] text. Fill it in from your PRD first."
fi

gh auth status >/dev/null 2>&1 || die "Not logged in. Run: gh auth login"
gh repo view "$REPO" >/dev/null || die "Cannot access repo $REPO"

OWNER="${REPO%%/*}"
REPO_NAME="${REPO##*/}"
PROJECT_TITLE="${PROJECT_TITLE:-$REPO_NAME Scrum Board}"

# ---------------------------------------------------------------------------
# 1. Labels (type + priority). --force updates color/description if they exist.
# ---------------------------------------------------------------------------
log "Labels"
while IFS='|' read -r name color desc; do
  run gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" --force
done <<'EOF'
feature|1D76DB|New user-facing functionality
bug|D73A4A|Something is broken
chore|C5DEF5|Setup, tooling, CI, refactors
docs|0075CA|Documentation only
priority:high|B60205|Must ship this sprint
priority:medium|FBCA04|Should ship this sprint
priority:low|0E8A16|Nice to have
EOF

# ---------------------------------------------------------------------------
# 2. Milestones. Due date is end of day UTC on the given date.
# ---------------------------------------------------------------------------
log "Milestones"
create_milestone() {
  local title="$1" due="$2" desc="$3"
  local existing
  existing=$(gh api "repos/$REPO/milestones?state=all&per_page=100" --jq ".[] | select(.title==\"$title\") | .number")
  if [[ -n "$existing" ]]; then
    echo "Milestone '$title' exists (#$existing), skipping"
  else
    run gh api "repos/$REPO/milestones" -f title="$title" -f due_on="${due}T23:59:59Z" -f description="$desc" >/dev/null
    echo "Created milestone '$title' due $due"
  fi
}
create_milestone "Sprint 1" "$SPRINT1_DUE" "Sprint 1 of P2"
create_milestone "Sprint 2" "$SPRINT2_DUE" "Sprint 2 of P2"

if [[ "$DRY_RUN" == "1" ]]; then
  log "Dry run: would create project '$PROJECT_TITLE' and these issues:"
  jq -r '.issues[] | "  [\(.milestone)] \(.title)  labels=\(.labels|join(","))"' "$ISSUES_FILE"
  exit 0
fi

# ---------------------------------------------------------------------------
# 3. Project (Projects v2) linked to the repo
# ---------------------------------------------------------------------------
log "Project"
if [[ -z "${PROJECT_NUMBER:-}" ]]; then
  PROJECT_NUMBER=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json --jq '.number')
  echo "Created project #$PROJECT_NUMBER '$PROJECT_TITLE'"
fi
gh project link "$PROJECT_NUMBER" --owner "$OWNER" --repo "$REPO" >/dev/null 2>&1 || true
PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '.id')

# ---------------------------------------------------------------------------
# 4. Status field with the five columns.
#    New projects ship with Status = Todo / In Progress / Done. We replace the
#    options via GraphQL. If the API rejects it, we pause for the manual fix.
# ---------------------------------------------------------------------------
log "Status columns"
COLUMNS=("Backlog" "Sprint Todo" "In Progress" "In Review" "Done")

status_field_json() {
  gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
    --jq '.fields[] | select(.name=="Status")'
}

STATUS_FIELD=$(status_field_json)
STATUS_FIELD_ID=$(jq -r '.id' <<<"$STATUS_FIELD")
[[ -n "$STATUS_FIELD_ID" && "$STATUS_FIELD_ID" != "null" ]] || die "No Status field found on project"

have_all_columns() {
  local opts; opts=$(jq -r '.options[].name' <<<"$1")
  for c in "${COLUMNS[@]}"; do grep -qxF "$c" <<<"$opts" || return 1; done
}

if ! have_all_columns "$STATUS_FIELD"; then
  PAYLOAD=$(jq -n --arg id "$STATUS_FIELD_ID" '{
    query: "mutation($id: ID!, $opts: [ProjectV2SingleSelectFieldOptionInput!]) { updateProjectV2Field(input: {fieldId: $id, singleSelectOptions: $opts}) { projectV2Field { ... on ProjectV2SingleSelectField { id options { id name } } } } }",
    variables: { id: $id, opts: [
      {name: "Backlog",     color: "GRAY",   description: "Not scheduled for the current sprint"},
      {name: "Sprint Todo", color: "BLUE",   description: "Committed for this sprint, not started"},
      {name: "In Progress", color: "YELLOW", description: "Branch open, work underway"},
      {name: "In Review",   color: "PURPLE", description: "PR open, waiting on review"},
      {name: "Done",        color: "GREEN",  description: "Merged to main"}
    ]}}')
  if gh api graphql --input - <<<"$PAYLOAD" >/dev/null 2>&1; then
    echo "Status options set via API"
  else
    echo
    echo "Could not set Status options through the API. Do it by hand (see MANUAL_SETUP.md, part B):"
    echo "  https://github.com/users/$OWNER/projects/$PROJECT_NUMBER/settings  (or /orgs/$OWNER/... for an org)"
    echo "  Edit the Status field so its options are exactly: ${COLUMNS[*]}"
    read -r -p "Press Enter when done... " _
  fi
  STATUS_FIELD=$(status_field_json)
  have_all_columns "$STATUS_FIELD" || die "Status field still missing one of: ${COLUMNS[*]}"
fi

option_id() { jq -r --arg n "$1" '.options[] | select(.name==$n) | .id' <<<"$STATUS_FIELD"; }
OPT_BACKLOG=$(option_id "Backlog")
OPT_SPRINT_TODO=$(option_id "Sprint Todo")

# ---------------------------------------------------------------------------
# 5. Issues: create, add to project, set Status
# ---------------------------------------------------------------------------
log "Issues"
EXISTING_TITLES=$(gh issue list --repo "$REPO" --state all --limit 500 --json title --jq '.[].title')
COUNT=$(jq '.issues | length' "$ISSUES_FILE")

for ((i = 0; i < COUNT; i++)); do
  ISSUE=$(jq -c ".issues[$i]" "$ISSUES_FILE")
  TITLE=$(jq -r '.title' <<<"$ISSUE")
  MILESTONE=$(jq -r '.milestone' <<<"$ISSUE")
  LABELS=$(jq -r '.labels | join(",")' <<<"$ISSUE")

  if grep -qxF "$TITLE" <<<"$EXISTING_TITLES"; then
    echo "Skip (exists): $TITLE"
    continue
  fi

  BODY_FILE=$(mktemp)
  jq -r '
    "## User story\n\n" + .user_story + "\n\n" +
    "## Acceptance criteria\n\n" + ([.acceptance_criteria[] | "- [ ] " + .] | join("\n")) + "\n\n" +
    "## Estimate\n\n" + (.estimate // "TBD") + " points\n\n" +
    "## Definition of done\n\n- [ ] Failing test committed first\n- [ ] CI green\n- [ ] Diff reviewed against AGENTS.md\n- [ ] Preview deploy checked\n"
  ' <<<"$ISSUE" >"$BODY_FILE"

  URL=$(gh issue create --repo "$REPO" --title "$TITLE" --body-file "$BODY_FILE" \
        --label "$LABELS" --milestone "$MILESTONE")
  rm -f "$BODY_FILE"

  ITEM_ID=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$URL" --format json --jq '.id')
  if [[ "$MILESTONE" == "Sprint 1" ]]; then OPT="$OPT_SPRINT_TODO"; COL="Sprint Todo"; else OPT="$OPT_BACKLOG"; COL="Backlog"; fi
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$OPT" >/dev/null

  echo "Created $URL  [$MILESTONE, $COL]"
done

log "Done"
echo "Project: https://github.com/users/$OWNER/projects/$PROJECT_NUMBER (org repos: /orgs/$OWNER/projects/$PROJECT_NUMBER)"
echo "Remaining manual step: switch the project view to Board layout grouped by Status (MANUAL_SETUP.md, part C)."

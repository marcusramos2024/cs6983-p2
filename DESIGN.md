---
# Design tokens in the Google Labs DESIGN.md format.
# Check with: npx @google/design.md lint DESIGN.md
name: "Paper Trail"
colors:
  ink: "#1F2933"        # body text
  paper: "#FAFAF7"      # page background
  card: "#FFFFFF"
  line: "#E4E2DC"       # borders, timeline rail
  muted: "#6B7280"      # secondary text
  primary: "#1D4ED8"    # buttons, links
  open: "#B91C1C"       # status: Open, days-ignored over 7
  ack: "#B45309"        # status: Acknowledged
  resolved: "#15803D"   # status: Resolved
typography:
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    lineHeight: 1.5
  heading:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 600
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 14px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
rounded:
  sm: 4px
  md: 8px
---

# Design: Paper Trail

## Overview

Paper Trail should feel like a well-kept file folder, not a social app. Off-white background, plain cards, one accent color for actions, and status colors that mean the same thing everywhere. Timestamps are always visible and use the monospace font so dates line up and look like a record.

Wireframe for the two Sprint 1 screens: [docs/design/wireframe.html](docs/design/wireframe.html).

## Colors

- `primary` is only for actions (buttons, links). Never for status.
- Status colors: `open` red, `ack` amber, `resolved` green. Always paired with the status word, never color alone.
- The days-ignored badge is `muted` under 3 days, `ack` from 3 to 7, `open` over 7.

## Typography

- Page titles 24px semibold, section titles 18px semibold, body 16px.
- Every timestamp uses `mono`, formatted like `Oct 28, 2026 9:14 PM`.

## Layout and spacing

- Max content width 960px, centered. Cards have `md` padding and `md` radius with a 1px `line` border.
- Mobile first. Below 640px everything is one column and the nav collapses into a menu button.

## Screens

| Route | Role | What it shows |
|---|---|---|
| `/login`, `/signup` | All | Email, password, role picker (signup only), building picker (signup only) |
| `/incidents` | Tenant | My incidents as cards: category icon, title, status badge, days-ignored badge |
| `/incidents/new` | Tenant | Log incident form |
| `/incidents/[id]` | Tenant | Incident header plus a vertical timeline of events |
| `/queue` | Manager | Table of open and acknowledged incidents, oldest first, with action buttons |
| `/building` | Organizer | Stat tiles, pattern flags, filterable incident list, Export PDF button |

## Components

| Component | Where | Behavior |
|---|---|---|
| `NavBar` | All signed-in pages | App name, role label, sign out. Links depend on role. |
| `StatusBadge` | Cards, timeline, queue | Text plus color: Open, Acknowledged, Resolved. |
| `DaysIgnoredBadge` | Cards, queue, timeline header | "12 days ignored". Stops counting once acknowledged and says "Acknowledged after 4 days". |
| `IncidentForm` | `/incidents/new` | Fields from PRD US2. Inline errors under each field. Submit disabled while uploading. |
| `PhotoUploader` | Inside `IncidentForm` | Up to 5 thumbnails with remove buttons, size and type checked before upload. |
| `IncidentTimeline` | `/incidents/[id]` | Vertical rail, one row per event, newest at the bottom, mono timestamps on the left. |
| `QueueTable` | `/queue` | Rows sorted by days ignored. Acknowledge, Respond and Resolve buttons. Respond and Resolve open a small text dialog. |
| `EmptyState` | Lists | One sentence and one button, for example "No incidents yet. Log your first one." |

Every list has a loading state (skeleton rows), an empty state and an error state with a retry button.

## User flows

1. **Tenant logs an incident:** `/incidents`, click "Log an incident", fill category, title, reported-at and reported-via, add photos, submit, land on `/incidents/[id]` with a "Reported" event and "0 days ignored".
2. **Manager handles it:** `/queue`, the new incident is at the top if it's the oldest, click Acknowledge (event added), click Respond and type a note (event added), click Resolve with a note (status Resolved, row leaves the open list).
3. **Tenant sees the response:** the timeline on `/incidents/[id]` gains the Acknowledged and Response events. In Sprint 1 after a refresh, in Sprint 2 live.
4. **Organizer exports:** `/building`, filter to "heat" in the last 60 days, click Export PDF, get a file with a summary page and every incident in order.

## Do's and Don'ts

- Do show the exact timestamp on every event. That's the point of the app.
- Do keep tenant names off anything an organizer or the public can see unless the tenant opted in.
- Don't use red for anything except Open and long waits.
- Don't hide the days-ignored number behind a hover or a tooltip.
- Don't hard-code colors in components. Use the Tailwind theme built from these tokens.

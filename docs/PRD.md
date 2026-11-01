# PRD: Paper Trail

A renter's evidence log that turns a landlord fight into a case file.

Team: Marcus Ramos and [PLACEHOLDER: partner name]. CS 6983 Project 2, due Nov 13, 2026.

## Problem

When something breaks in a rental, the tenant usually reports it by text, email or a portal, then waits. If it drags on, they end up digging through old messages and camera rolls to prove what happened and when. Most never get to that point and just give up. Managers lose track too: requests come in from five channels and nothing shows how long anything has been open.

Paper Trail gives each incident one record: what happened, photos, when it was reported and how, and a clock showing how many days it has been ignored. Every manager response is timestamped on the same record. When enough tenants in a building have the same problem, an organizer can export one timeline for a group complaint or housing court.

## Personas

- **Tenant (Dana, 26).** Rents a one-bedroom in a 40-unit building. Has reported a leak under the sink three times by text. Wants proof that's easy to keep and easy to show.
- **Property Manager (Luis, 41).** Manages four buildings for a small company. Gets requests by phone, email and a shared inbox. Wants one queue sorted by what's been waiting longest.
- **Building Organizer (Priya, 33).** A tenant who started the building's group chat. Wants to see whether problems are building-wide and to hand a lawyer or the city one clean document.

## Roles and permissions

| Role | Can see | Can do |
|---|---|---|
| Tenant | Their own incidents | Create incidents, add photos, add follow-up notes, mark when and how they reported it |
| Property Manager | Open and closed incidents for buildings they manage | Acknowledge, add a response, resolve |
| Building Organizer | All incidents in their building (tenant names hidden by default) | View dashboard, export building timeline PDF |

## User stories

### Sprint 1

**US1. Sign up and sign in with a role** (issue #3)
As any user, I want to sign in and land on the screen for my role so I only see what I'm allowed to see.
- [ ] Sign up with email and password, choosing Tenant, Manager or Organizer, and a building.
- [ ] Sign in returns a JWT session; signed-out users are redirected to `/login`.
- [ ] Tenants land on `/incidents`, managers on `/queue`, organizers on `/building`.
- [ ] API routes return 401 when signed out and 403 when the role is wrong.
- [ ] Passwords are hashed with bcrypt; plain passwords are never stored or logged.

**US2. Log an incident** (issue #5)
As a tenant, I want to log a problem with photos and when I reported it so I have a dated record.
- [ ] Form at `/incidents/new` with category (pest, heat, leak, appliance, other), title (required, up to 120 chars), description (up to 2000 chars), reported-at date and time (required, not in the future) and reported-via (text, email, portal, phone, in person).
- [ ] Up to 5 photos, JPEG/PNG/HEIC, 10 MB each, with a preview before submit.
- [ ] Invalid input shows an error under the field; the API rejects the same input with 400.
- [ ] On success the tenant goes to the incident's timeline page and the "days ignored" clock shows 0.
- [ ] Only tenants can create incidents (403 for other roles).

**US3. Tenant timeline** (issue #6)
As a tenant, I want to see each incident as a timeline so I can show exactly what happened and when.
- [ ] `/incidents` lists my incidents, newest first, with status (Open, Acknowledged, Resolved) and days ignored.
- [ ] `/incidents/[id]` shows events in time order: reported, photos added, manager acknowledged, manager responses, resolved.
- [ ] Days ignored = whole days from reported-at until acknowledged, or until now if not acknowledged yet.
- [ ] A tenant cannot open another tenant's incident (404).
- [ ] Empty state with a "Log an incident" button.

**US4. Manager queue: acknowledge and resolve** (issue #7)
As a property manager, I want one queue of open issues so I can work through them oldest first.
- [ ] `/queue` lists open and acknowledged incidents for my buildings, sorted by days ignored, highest first.
- [ ] Acknowledge, Respond (text, required) and Resolve buttons; each action adds a timestamped event.
- [ ] Resolve requires a short resolution note.
- [ ] A manager cannot act on a building they don't manage (403).

### Sprint 2

**US5. Live updates** (issue #8)
As a tenant, I want status changes to show up without refreshing so I know right away when someone responds.
- [ ] Manager actions show on the tenant timeline within 5 seconds without a reload.
- [ ] New incidents show in the manager queue and organizer dashboard within 5 seconds.
- [ ] Uses server-sent events from `/api/events`, with polling every 10 seconds as a fallback.

**US6. Building dashboard** (issue #9)
As an organizer, I want to see every incident in my building so I can tell whether a problem is building-wide.
- [ ] `/building` shows counts by category and status, median days to acknowledge, and a list of incidents with tenant names hidden.
- [ ] Filters by category, status and date range.
- [ ] Flags a category as a pattern when 3 or more units report it within 30 days.

**US7. Building timeline PDF** (issue #10)
As an organizer, I want to export one PDF of every incident so I can attach it to a complaint.
- [ ] Export button on `/building` downloads a PDF with a summary page and every incident in time order with its events.
- [ ] Unit numbers are shown, tenant names are not, unless the tenant opted in.
- [ ] Photos appear as thumbnails with their timestamps.

**US8. Public building report card API** (issue #11)
As a prospective renter, I want a public score for a building so I can see how it treats tenants before I sign a lease.
- [ ] `GET /api/buildings/:id/score` returns `{ buildingId, medianResponseHours, openCount, topCategories }` with no personal data.
- [ ] Rate limited to 60 requests per minute per IP.
- [ ] Documented in `docs/api/openapi.yaml`.

## Non-goals

- Payments, rent tracking or messaging between tenants.
- Native mobile apps (the web app should work on a phone, though).
- Legal advice. The app keeps records; it doesn't tell anyone what to do with them.

## Mockups

- Wireframe: [docs/design/wireframe.html](design/wireframe.html) shows the tenant timeline and the manager queue.
- Visual design and components: [DESIGN.md](../DESIGN.md).

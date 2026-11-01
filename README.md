# Paper Trail

A renter's evidence log that turns a landlord fight into a case file. Tenants log incidents (pests, heat, leaks, appliances) with photos and when they reported them, and a "days ignored" clock starts. Property managers work a live queue and every response is timestamped. Building organizers see every incident in the building and export one timeline PDF for a group complaint or court.

CS 6983 AI Coding, Fall 2026, Project 2. Team: Marcus Ramos and [PLACEHOLDER: partner name].

## Docs

- PRD: [docs/PRD.md](docs/PRD.md)
- Design: [DESIGN.md](DESIGN.md) and [docs/design/wireframe.html](docs/design/wireframe.html)
- Rules for AI tools: [AGENTS.md](AGENTS.md) (CLAUDE.md imports it)

## Stack

Next.js (App Router) + TypeScript + Tailwind, Postgres + Prisma, NextAuth (credentials + JWT, role-based), Vitest + Playwright, deployed on Vercel.

## Run locally

Not set up yet. Issue #1 scaffolds the app. Once it's in:

```
npm ci
cp .env.example .env   # fill in DATABASE_URL and NEXTAUTH_SECRET
npx prisma migrate dev
npm run dev
```

Live URL: not deployed yet.

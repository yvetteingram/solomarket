# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Express + Vite dev server (port 3000)
npm run build     # Production build (Vite)
npm run preview   # Preview production build
npm run lint      # Type-check only (tsc --noEmit)
npm run clean     # Remove dist/
```

No test runner is configured.

## Environment Variables

Create a `.env` file at the root:

```
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only
```

## Architecture

**SoloMarket** is a marketing OS for solopreneurs — a full-stack app where Express (`server.ts`) serves both the API and the Vite-built React frontend.

### How it fits together

- **`server.ts`** — Single Express server. In dev it mounts Vite as middleware (HMR). In production it serves `dist/` with SPA fallback. All `/api/*` routes are defined here.
- **`src/`** — React 19 + TypeScript frontend. Entry: `src/main.tsx` → `src/App.tsx`.
- **`src/context/AuthContext.tsx`** — Supabase auth wrapped in React context. `useAuth()` provides `user`, `session`, `loading`, `signOut`.
- **`src/services/supabase.ts`** — Lazy-initialized Supabase singleton (client-side). Never import the server-role key here.
- **`src/services/geminiService.ts`** — Google Gemini integration. Two functions: `generateMarketingPlan()` (returns structured JSON via response schema) and `generateContentDraft()` (returns platform-specific text).

### Path alias

`@/` resolves to the repo root (configured in `vite.config.ts`). Use `@/src/...` for imports.

### Screens → API flow

Each screen in `src/screens/` fetches from the Express backend (`/api/...`), which queries Supabase. The frontend never calls Supabase directly except for auth operations.

### Data models

All TypeScript interfaces live in `src/types.ts`: `Product`, `MarketingPlan`, `PlanWeek`, `Campaign`, `Post`, `Lead`, `DashboardSummary`.

### UI conventions

- Reusable layout components: `PageHeader`, `SectionCard`, `MetricCard` (in `src/components/`)
- Icons: Lucide React
- Animations: Motion library (`motion/react`)
- Detail views use fixed-position drawer pattern with backdrop overlay
- Tailwind CSS 4 via Vite plugin (no PostCSS config needed)

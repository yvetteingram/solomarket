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

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |

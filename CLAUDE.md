# Pratibha AI — Claude Code Project Context

> **Autonomous AI Recruitment & Hiring Agent Platform**
> Built with Google ADK (TypeScript) · Gemini 3.1 · Next.js 15 · Neon · Clerk

> **Production URL:** https://pratibhaai.vercel.app

---

## Project Overview

Pratibha AI is a multi-agent SaaS platform that autonomously screens resumes, validates GitHub profiles, detects fraud, scores candidates, and delivers explainable hiring reports — all triggered from a single Next.js monorepo with no separate backend.

**Key facts Claude must always remember:**
- All Google ADK agents are written in **TypeScript**
- Agents run directly inside **Next.js 15 API routes** — no Express, no separate server, no separate backend folder
- Single monorepo deployed to **Vercel**
- Single **`.env.local`** file — all keys live here
- Stack: Next.js 15 · Clerk · Neon PostgreSQL · Drizzle ORM · Google ADK (TS) · Gemini 3.1 · UploadThing · Resend

---

## Skills

### Frontend & UI
For ALL frontend/UI work — landing page, dashboard, session page, components — use the skill at:
`C:\Users\ES\.claude\skills\nextstack.skill`
`C:\Users\ES\.claude\skills\multigentsadk.skill`

### Google ADK Agent Work
For ALL Google ADK agent work — writing agent code, building agents, adding tools, creating callbacks — use the skill at:
`C:\Users\ES\.claude\skills\google-agents-cli-adk-code`
`C:\Users\ES\.claude\skills\google-agents-cli-workflow`

---

## Folder Structure

```
pratibha-ai/                    # Single Next.js monorepo — no separate backend
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Clerk sign-in / sign-up pages
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Dashboard shell — renders Sidebar + DashboardHeader
│   │   │   ├── page.tsx            # Dashboard home — StatsCards, QuickActions, RecentJobs
│   │   │   └── jobs/
│   │   │       ├── new/
│   │   │       │   └── page.tsx    # Step 1: Job creation form (dark aurora, full-screen z-50)
│   │   │       └── [jobId]/
│   │   │           ├── upload/
│   │   │           │   └── page.tsx  # Step 2: Resume drag-drop upload (dark aurora, full-screen)
│   │   │           └── screening/
│   │   │               └── page.tsx  # Step 3: AI Screening progress — 9 agents animated + polling
│   │   ├── candidates/[id]/        # Individual candidate view (planned)
│   │   ├── globals.css             # Global styles + design system tokens
│   │   ├── layout.tsx              # Root layout (fonts: Plus Jakarta Sans, Inter)
│   │   ├── page.tsx                # Landing page entry — renders <LandingPage />
│   │   └── api/
│   │       ├── jobs/
│   │       │   ├── route.ts        # POST /api/jobs — create job, returns { job }
│   │       │   └── [jobId]/
│   │       │       ├── candidates/
│   │       │       │   └── route.ts  # POST /api/jobs/[jobId]/candidates — multipart upload → Neon base64
│   │       │       └── pipeline-status/
│   │       │           └── route.ts  # GET — returns { total, screened, isComplete } for polling
│   │       ├── sync-user/
│   │       │   └── route.ts        # POST — syncs Clerk user to Neon on login
│   │       ├── agents/             # All ADK agent files (.ts)
│   │       │   ├── orchestrator.ts
│   │       │   ├── job-intelligence.ts
│   │       │   ├── candidate-extraction.ts
│   │       │   ├── verification-risk.ts
│   │       │   ├── technical-validation.ts
│   │       │   ├── behavioral-alignment.ts
│   │       │   ├── evaluation-aggregator.ts
│   │       │   ├── decision-agent.ts
│   │       │   └── report-generator.ts
│   │       ├── tools/              # Shared agent tools (GitHub API, PDF parser)
│   │       └── run-pipeline/
│   │           └── route.ts        # POST — triggers full 9-agent pipeline; maxDuration=300
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx         # Left nav — logo, nav links, sign-out
│   │   │   ├── DashboardHeader.tsx # Top bar — greeting, user avatar
│   │   │   ├── StatsCards.tsx      # 4 stat cards (jobs, candidates, screened, hired)
│   │   │   ├── QuickActions.tsx    # Action buttons (New Job, View Candidates, etc.)
│   │   │   └── RecentJobs.tsx      # Recent jobs list with status badges
│   │   ├── landing/                # Landing page (8-section animated SPA)
│   │   │   ├── LandingPage.tsx     # Navigation shell — keyboard/wheel/touch/dots
│   │   │   ├── shared.tsx          # MeshBg, Section, CountUp, PrimaryBtn, Icons
│   │   │   ├── HeroSection.tsx     # Animated 10-agent SVG network + stats
│   │   │   ├── ProblemSection.tsx  # Before/after comparison cards
│   │   │   ├── PipelineSection.tsx # 10-agent pipeline 5×2 grid + flow arrows
│   │   │   ├── FeaturesSection.tsx # 6-feature hover-lift grid
│   │   │   ├── ModelsSection.tsx   # Gemini Pro / Flash / Flash-Lite floating cards
│   │   │   ├── StatsSection.tsx    # 4 count-up stats + 3 testimonials
│   │   │   ├── PricingSection.tsx  # 3 plans with monthly/yearly toggle
│   │   │   └── CTASection.tsx      # Email sign-up form + footer links
│   │   └── ui/                    # Reusable UI components (shared across pages)
│   ├── db/
│   │   ├── index.ts                # Neon HTTP client + Drizzle instance
│   │   └── schema.ts               # All 8 Drizzle table definitions
│   └── lib/
│       └── auth.ts                 # getOrCreateUser() — lazy Clerk → Neon sync
├── drizzle/                        # DB migration files
├── drizzle.config.ts               # Drizzle config pointing to src/db/schema.ts
├── .env.local                      # Single env file — ALL keys here
└── package.json
```

---

## Multi-Agent Pipeline (10 Agents)

```
Hiring Manager creates Job + uploads Resumes
                  |
      [1] Orchestrator Agent          ← Gemini 3.1 Pro
      [2] Job Intelligence Agent      ← Gemini 3.1 Pro
      [3] Candidate Extraction Agent  ← Gemini 3.1 Flash-Lite  (parallel per resume)
      [4] Verification / Risk Agent   ← Gemini 3.1 Flash-Lite
      [5] Technical Validation Agent  ← Gemini 3.1 Flash       (GitHub API)
      [6] Behavioral Alignment Agent  ← Gemini 3.1 Flash-Lite
      [7] Evaluation Aggregator Agent ← Gemini 3.1 Flash-Lite
      [8] Decision Agent              ← Gemini 3.1 Pro
      [9] Report Generator Agent      ← Gemini 3.1 Flash-Lite
     [10] Human Override Layer        ← Next.js UI (Approve / Reject / Adjust)
                  |
     Dashboard + PDF Report + Email
```

### Agent Responsibilities

| # | Agent | Model | Role |
|---|-------|-------|------|
| 1 | Orchestrator Agent | Pro | Root ADK agent — creates session state, routes all tasks |
| 2 | Job Intelligence Agent | Pro | Converts raw JD → structured Hiring Blueprint JSON |
| 3 | Candidate Extraction Agent | Flash-Lite | Parses PDF/DOCX → Candidate Profile JSON (runs in parallel) |
| 4 | Verification / Risk Agent | Flash-Lite | Detects inflation, fake claims, timeline inconsistencies |
| 5 | Technical Validation Agent | Flash | GitHub API analysis → Technical Depth Score (0–100) |
| 6 | Behavioral Alignment Agent | Flash-Lite | Culture + soft skills → Culture Fit Score (0–100) |
| 7 | Evaluation Aggregator Agent | Flash-Lite | Weighted scoring → Final Composite Score + ranking |
| 8 | Decision Agent | Pro | Explainable WHY recommendation + interview questions |
| 9 | Report Generator Agent | Flash-Lite | PDF report + dashboard data + Resend email |
| 10 | Human Override Layer | N/A (UI) | Approve / Reject / Adjust — logged in Neon for audit |

---

## Gemini Model Rules

| Model | Used For |
|-------|----------|
| `gemini-3.1-pro` | Orchestrator, Job Intelligence, Decision Agent — complex reasoning only |
| `gemini-3.1-flash` | Technical Validation Agent — GitHub analysis |
| `gemini-3.1-flash-lite` | Candidate Extraction, Verification, Behavioral Alignment, Aggregator, Report Generator |

> **Rule:** Never use Pro for every agent — it inflates cost and latency. Use Flash-Lite for all repetitive structured extraction tasks.

---

## Database Tables (Neon + Drizzle ORM)

| Table | Purpose |
|-------|---------|
| `users` | Clerk user details synced on first login (id TEXT, email, username, name, plan default 'free') |
| `jobs` | Job posts created by hiring manager |
| `candidates` | One record per uploaded resume |
| `hiring_blueprints` | Structured JSON output from Job Intelligence Agent |
| `evaluations` | All scores per candidate (skills, technical, culture, composite) |
| `agent_runs` | Full audit trail of every agent execution |
| `reports` | Final PDF report metadata and email status |
| `overrides` | Human override actions (approve/reject/adjust) with timestamps |

---

## Neon + Drizzle ORM Integration (Completed)

### Files Added
| File | Status | Notes |
|------|--------|-------|
| `src/db/index.ts` | NEW | Neon HTTP client + Drizzle instance |
| `src/db/schema.ts` | NEW | All 8 tables — `users`, `jobs`, `candidates`, `hiring_blueprints`, `evaluations`, `agent_runs`, `reports`, `overrides` |
| `src/lib/auth.ts` | NEW | `getOrCreateUser()` — lazy Clerk → Neon sync, no webhooks |
| `drizzle.config.ts` | NEW | Drizzle config at project root pointing to `src/db/schema.ts` |
| `src/app/api/sync-user/route.ts` | NEW | POST route — calls `getOrCreateUser()`, triggered silently on login |

### Files Modified
| File | Change |
|------|--------|
| `package.json` | Added `db:push`, `db:generate`, `db:studio` scripts |
| `src/components/landing/LandingPage.tsx` | Added `useEffect` to call `POST /api/sync-user` when `isSignedIn` becomes true |

### Neon Project
- **Project name:** pratibhai
- **Project ID:** `proud-dew-50438611`
- **Region:** `aws-us-east-1`
- **Database:** default (`neondb`) — tables pushed directly via Neon MCP
- **DATABASE_URL format:** direct URL (no `-pooler`, no `channel_binding`) — already correct in `.env`

### Schema Rules (must follow forever)
- `users.id` → `text` (Clerk IDs are `user_xxx` strings — **NEVER** uuid)
- All FK columns referencing `users.id` → also `text`
- All other PKs → `uuid().defaultRandom()`
- All FK constraints → `{ onDelete: 'cascade' }`
- Drizzle driver → `drizzle-orm/neon-http` (**NOT** `pg` or websocket)

### Errors Encountered & Fixed
| Error | Cause | Fix |
|-------|-------|-----|
| User logs in via Clerk but no row in `users` table | `getOrCreateUser()` only runs when an API route is called — no routes existed yet | Created `POST /api/sync-user` route + added `useEffect` in `LandingPage.tsx` to call it silently on login |
| `database not found` when using Neon MCP with `databaseName: 'pratibhai'` | Neon MCP uses the default database (`neondb`), not the project name | Always omit `databaseName` in Neon MCP calls — it defaults to `neondb` correctly |

### User Sync Flow
```
User signs in/up via Clerk
  → LandingPage mounts → isSignedIn = true
  → useEffect fires → POST /api/sync-user
  → getOrCreateUser() runs:
      1. auth() → gets Clerk userId
      2. DB query → user exists? return existing
      3. First login → currentUser() → insert row with id, email, username, name, plan='free'
  → Row appears in Neon users table
```

### getOrCreateUser() usage
Call at the top of **every protected API route**:
```typescript
import { getOrCreateUser } from '@/lib/auth'
const user = await getOrCreateUser() // creates row on first call, returns existing on subsequent
```

---

## Clerk Auth Implementation (Completed)

### Files Added
| File | Status | Notes |
|------|--------|-------|
| `src/middleware.ts` | NEW | Clerk middleware — protects all routes except `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/inngest` |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | NEW | Centered Clerk `<SignIn />` with Pratibha AI logo on `#FAFAFA` background |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | NEW | Centered Clerk `<SignUp />` with Pratibha AI logo on `#FAFAFA` background |

### Files Modified
| File | Change |
|------|--------|
| `src/app/layout.tsx` | Wrapped `{children}` with `<ClerkProvider>` |
| `src/components/landing/LandingPage.tsx` | Added `useUser()` + `UserButton` — shows `Hi, {username}!` + avatar when signed in; removed Sign In / Get Started nav buttons |
| `src/components/landing/HeroSection.tsx` | Wired "Start Free Trial" → `router.push('/sign-up')` always |
| `.env` | Added `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/` (sign-in and sign-up URLs already pointed to `/`) |

### Auth Redirect Rules
- After sign-up → `/dashboard`
- After sign-in → `/dashboard`
- After sign-out → `/` (landing page)
- Controlled via `.env`, NOT code

### Errors Encountered & Fixed
| Error | Cause | Fix |
|-------|-------|-----|
| `Export SignedIn doesn't exist in target module` | `<SignedIn>` not exported by installed Clerk version | Replaced with `useUser()` hook — `const { isSignedIn } = useUser()` |
| `Property 'afterSignOutUrl' does not exist on UserButton` | Prop removed from `UserButton` in this Clerk version | Removed prop; added `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/` to `.env` |

### Clerk Version Constraints (this project)
- **Do NOT** use `<SignedIn>` / `<SignedOut>` components — not exported in installed version
- **Do NOT** pass `afterSignOutUrl` as a prop to `<UserButton />` — use env var instead
- **Always** use `useUser()` for auth state: `const { isSignedIn, user } = useUser()`
- Username field on sign-up: enabled via **Clerk Dashboard** only (Configure → User & Authentication → Sign-up → Username → Required) — no code needed

### Middleware Pattern
```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/api/inngest'])
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) { await auth.protect() }
})
export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

---

## Dashboard & Job Flow (Completed)

### Files Added
| File | Status | Notes |
|------|--------|-------|
| `src/app/dashboard/layout.tsx` | NEW | Dashboard shell — Sidebar (left) + DashboardHeader (top) |
| `src/app/dashboard/page.tsx` | NEW | Home — StatsCards, QuickActions, RecentJobs |
| `src/components/dashboard/Sidebar.tsx` | NEW | Left nav with logo, links, sign-out |
| `src/components/dashboard/DashboardHeader.tsx` | NEW | Top bar with greeting + Clerk UserButton |
| `src/components/dashboard/StatsCards.tsx` | NEW | 4 stat cards — jobs posted, candidates, screened, hired |
| `src/components/dashboard/QuickActions.tsx` | NEW | Action buttons (New Job, etc.) |
| `src/components/dashboard/RecentJobs.tsx` | NEW | Recent jobs list with status badges |
| `src/app/dashboard/jobs/new/page.tsx` | NEW | Step 1: Job creation form |
| `src/app/dashboard/jobs/[jobId]/upload/page.tsx` | NEW | Step 2: Resume upload page |
| `src/app/api/jobs/route.ts` | NEW | POST — creates job, returns `{ job }` with `job.id` |
| `src/app/api/jobs/[jobId]/candidates/route.ts` | NEW | POST multipart — base64-encodes files, inserts candidate rows |

### Files Modified
| File | Change |
|------|--------|
| `src/db/schema.ts` | Added `resumeContent text`, `resumeName text`, `resumeSize integer` to `candidates` table |

### Job Creation Flow (Step 1 → Step 2)
```
User clicks "New Job" on dashboard
  → /dashboard/jobs/new  (full-screen dark aurora form, z-index 50 covers sidebar)
  → Fills form: Job Title (autocomplete), Department, Location Type, Job Type, Experience Level, Skills (chip input), Description
  → POST /api/jobs → returns { job: { id, ... } }
  → router.push(`/dashboard/jobs/${job.id}/upload`)

  → /dashboard/jobs/[jobId]/upload  (same dark aurora, drag-drop zone)
  → Drops PDF/DOCX files (max 10, validated by MIME + extension)
  → POST /api/jobs/[jobId]/candidates  (multipart form, field: "files")
  → Each file: ArrayBuffer → base64 → inserted as candidates row in Neon
  → router.push('/dashboard')
```

### Job Form Design Details
- Full-screen fixed overlay (`position: fixed; inset: 0; z-index: 50`) — covers sidebar (z-40)
- Font: **Fira Sans** (loaded via Google Fonts `<link>` tags)
- Dark aurora animated background: 4 gradient blobs with CSS keyframe `drift` animations
- Glass morphism card: `backdrop-filter: blur`, `rgba` backgrounds
- Conic gradient rotating border (`cardSpin` keyframe, 18s loop)
- Mouse-tracked spotlight: `mousemove` → CSS `radial-gradient` overlay
- Floating particles: `useState([]) + useEffect` — **never `useMemo`** (SSR hydration safe)
- `TitleAutocomplete`: glass input shell, dark dropdown, keyboard nav (↑↓ Enter Esc), bold match highlight
- `SkillsInput`: chip/tag multi-select with typeahead, backspace removal, aria-label on X buttons
- `Segment` pills: gradient when selected (`linear-gradient(135deg, #7c5cff, #c084fc, #22d3ee)`)
- Section 01 (`Basics`) has `zIndex: 10` so autocomplete dropdown floats above sections 02–04

### Resume Upload Design Details
- Same dark aurora design as job form (z-50 overlay, Fira Sans, identical `Aurora` component)
- Step indicator: "Step 1 ✓ · Step 2: Resumes" in top bar
- Drag-drop zone: `onDragOver / onDragLeave / onDrop` handlers; `drop-active` CSS class on drag
- Accepts: `.pdf`, `.doc`, `.docx` (validated by MIME type AND extension)
- File list: shows name, formatted size, remove button with `aria-label`
- Success state: green gradient heading + CheckCircle2 icon before redirect

### Errors Encountered & Fixed
| Error | Cause | Fix |
|-------|-------|-----|
| Hydration mismatch on job form | `Math.random()` in `useMemo` runs on SSR and client, producing different particle positions | Changed particles to `useState([]) + useEffect(() => setDots(...), [])` — client-only |
| `Removing a style property during rerender (borderColor) when conflicting property is set (border)` | `inputShellStyle` used shorthand `border: '1px solid ...'` while focused override applied `borderColor` | Replaced `border` with `borderWidth + borderStyle + borderColor` longhands everywhere |
| Autocomplete dropdown hidden behind sections 02–04 | All sections had `position: relative; zIndex: 2`, creating stacking contexts; Section 02+ painted over Section 01's dropdown | Raised Section 01 to `zIndex: 10`; dropdown raised to `zIndex: 200` |
| Accessibility error — X button in skill chips had no discernible text | `<button>` with only an SVG icon, no text content | Added `aria-label={\`Remove ${skill}\`}` to every chip remove button |

---

## AI Screening Progress — Step 3 (Completed)

### Files Added
| File | Status | Notes |
|------|--------|-------|
| `src/app/dashboard/jobs/[jobId]/screening/page.tsx` | NEW | Full-screen progress screen — 9 agents animated sequentially, polls completion, redirects to dashboard |
| `src/app/api/jobs/[jobId]/pipeline-status/route.ts` | NEW | GET — returns `{ total, screened, isComplete }` used by polling |

### Files Modified
| File | Change |
|------|--------|
| `src/app/dashboard/jobs/[jobId]/upload/page.tsx` | After upload success: fires `/api/run-pipeline` (fire-and-forget), redirects to `/dashboard/jobs/[jobId]/screening` after 1 s |
| `src/app/api/run-pipeline/route.ts` | `maxDuration` raised to 300 s; added per-agent `console.log`; added `console.error` in catch block |

### Screening Flow (Step 2 → Step 3 → Dashboard)
```
Upload page: candidates inserted → setSuccess(true)
  → fetch('/api/run-pipeline', { method: 'POST', body: { jobId } }).catch(() => {})  ← fire-and-forget
  → setTimeout 1 s → router.push('/dashboard/jobs/[jobId]/screening')

Screening page:
  → Shows 9 agents: Waiting / Running (purple, spinner, pulsing message) / Done (green ✓)
  → Animation interval: advances one agent every 6 s
  → Handoff message pill animates between agents (1.8 s fade)
  → Polling: GET /api/jobs/[jobId]/pipeline-status every 3 s
      → isComplete = true → all agents snap green → redirect to /dashboard after 2.5 s

pipeline-status route:
  total    = all candidates for job
  screened = candidates with status = 'screened'
  failed   = agentRuns with status = 'failed' AND agentName = 'full-pipeline'
  isComplete = total > 0 && (screened + failed) >= total
```

### Step Indicator (top bar across all 3 steps)
```
✓ Step 1: Job Details  ·  ✓ Step 2: Resumes  ·  → Step 3: AI Screening
```

### Errors Encountered & Fixed
| Error | Cause | Fix |
|-------|-------|-----|
| `isComplete` never becomes `true` — candidates stay `pending` | `maxDuration = 60` — Vercel killed the function before all 9 agent calls completed; DB writes never happened | Raised `maxDuration` to 300; added per-agent logging so stall point is visible in server logs |
| React warning: `background` vs `backgroundClip` shorthand conflict on upload page h1 | `background` shorthand resets `backgroundClip` on re-render | Changed `background:` to `backgroundImage:` (non-shorthand) on the success heading |

---

## Environment Variables (.env.local)

```bash
# CLERK AUTH
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# NEON DATABASE
DATABASE_URL=

# UPLOADTHING
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# GOOGLE ADK + GEMINI (agents run inside Next.js API routes)
GOOGLE_API_KEY=
GOOGLE_GENAI_USE_VERTEXAI=false
MODEL_PRO=gemini-3.1-pro
MODEL_FLASH=gemini-3.1-flash
MODEL_FLASH_LITE=gemini-3.1-flash-lite

# GITHUB API
GITHUB_TOKEN=

# RESEND EMAIL
RESEND_API_KEY=
EMAIL_FROM=noreply@pratibha-ai.com
```

---

## Key Packages

```bash
# Core Next.js stack
npm install @clerk/nextjs drizzle-orm @neondatabase/serverless drizzle-kit

# Google ADK TypeScript SDK
npm install @google/genai @google/adk

# Resume parsing
npm install pdf-parse mammoth
npm install @types/pdf-parse --save-dev

# File upload
npm install uploadthing @uploadthing/react

# GitHub API calls
npm install axios

# Email
npm install resend

# UI
npm install lucide-react sonner react-hook-form zod
```

---

## Critical Rules for Claude

1. **No separate backend** — ADK agents always go inside `app/api/agents/`
2. **No Express / Hono / Fastify** — Next.js API routes handle everything
3. **No Python** — All agents are TypeScript only
4. **One env file** — `.env.local` at project root, never a second `.env`
5. **Mixed models** — Never use Pro for extraction tasks; always use Flash-Lite
6. **Parallel execution** — Candidate Extraction Agent must run in parallel for multiple resumes
7. **Human override always last** — No final hiring decision without human approval step
8. **Audit everything** — All agent runs and overrides must be logged to `agent_runs` and `overrides` tables in Neon

---

## Scoring Formula (Evaluation Aggregator Agent)

```
Final Composite Score =
  (Skills Match Score × 40%) +
  (Technical Depth Score × 35%) +
  (Culture Fit Score × 25%)

Recommendation Tags:
  90–100  → ✅ Strong Hire
  65–89   → 🟡 Consider
  0–64    → ❌ Not Recommended
```

---

## External Integrations

| Service | Purpose | Docs |
|---------|---------|------|
| GitHub REST API v3 | Repo analysis in Technical Validation Agent | api.github.com |
| UploadThing | Resume PDF/DOCX file upload | uploadthing.com/docs |
| Resend | Final report email delivery | resend.com/docs |
| Clerk | Auth + user management | clerk.com/docs |
| Neon | Serverless PostgreSQL | neon.tech/docs |

---

*Pratibha AI · Narendra Kumar · nk-analytics · 2026*
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Pratibha AI** — Autonomous AI Recruitment & Hiring Agent Platform.
Multi-agent SaaS: screens resumes, validates GitHub, detects fraud, scores candidates, generates explainable hiring reports — all inside a single Next.js 15 monorepo with no separate backend.

**Production URL:** https://pratibhaai.vercel.app  
**Stack:** Next.js 15 · Clerk · Neon PostgreSQL · Drizzle ORM · Google ADK (TS) · Gemini 3.1 · Resend

---

## Commands

```bash
npm run dev          # start local dev server
npm run build        # production build (run to verify zero TS errors)
npm run start        # start production server

npm run db:push      # push schema changes directly to Neon (no migrations needed)
npm run db:generate  # generate Drizzle migration files
npm run db:studio    # open Drizzle Studio UI
```

No test runner is configured. Use `npm run build` to catch TypeScript errors.

---

## Skills (always load before working in these areas)

```
Frontend / UI work:           C:\Users\ES\.claude\skills\nextstack.skill
                              C:\Users\ES\.claude\skills\multigentsadk.skill
Google ADK agent work:        C:\Users\ES\.claude\skills\google-agents-cli-adk-code
                              C:\Users\ES\.claude\skills\google-agents-cli-workflow
```

---

## Architecture

### Critical constraints
- **No separate backend** — agents live in `src/app/api/agents/`, routes in `src/app/api/`
- **No Express / Hono / Python** — Next.js API routes + TypeScript only
- **Single env file** — `.env.local` at project root
- **Drizzle driver** — `drizzle-orm/neon-http` (NOT `pg` or websocket)
- **`users.id`** — `text` (Clerk `user_xxx` strings, never uuid)
- **All other PKs** — `uuid().defaultRandom()`
- **All FK constraints** — `{ onDelete: 'cascade' }`

### Clerk auth constraints
- Use `useUser()` for auth state — `<SignedIn>` / `<SignedOut>` are NOT exported by the installed version
- Do NOT pass `afterSignOutUrl` prop to `<UserButton />` — set `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` in `.env` instead
- `getOrCreateUser()` (`src/lib/auth.ts`) must be called at the top of every protected API route

### pdf-parse v2 API (v2.4.5 installed — breaking change from v1)
The installed version is a full ESM rewrite. There is NO callable default function.
```ts
// CORRECT
import { PDFParse } from 'pdf-parse'
const parser = new PDFParse({ data: buf })   // buf = Buffer (Uint8Array subtype)
const { text } = await parser.getText()

// WRONG — pdfParse is not a function in v2
const pdfParse = require('pdf-parse')
await pdfParse(buf)
```

---

## Folder Structure

```
src/
├── app/
│   ├── (auth)/                   # Clerk sign-in / sign-up pages
│   ├── dashboard/
│   │   ├── layout.tsx            # Shell: Sidebar + DashboardHeader
│   │   ├── page.tsx              # StatsCards, QuickActions, RecentJobs
│   │   ├── components/           # Dashboard-local components (Sidebar, StatsCards, etc.)
│   │   └── jobs/
│   │       ├── new/page.tsx      # Step 1: Job creation form
│   │       └── [jobId]/
│   │           ├── upload/page.tsx      # Step 2: Resume drag-drop upload
│   │           └── screening/page.tsx  # Step 3: Animated 9-agent progress + polling
│   ├── api/
│   │   ├── jobs/route.ts                        # POST — create job
│   │   ├── jobs/[jobId]/candidates/route.ts     # POST multipart — upload resumes → Neon base64
│   │   ├── jobs/[jobId]/pipeline-status/route.ts # GET — { total, screened, isComplete }
│   │   ├── dashboard/stats/route.ts             # GET — dashboard stat counts
│   │   ├── sync-user/route.ts                   # POST — Clerk → Neon user sync
│   │   ├── run-pipeline/route.ts                # POST — triggers full 9-agent pipeline (maxDuration=300)
│   │   └── agents/                              # All 9 ADK agent files
│   │       ├── orchestrator.ts         # Gemini Pro
│   │       ├── job-intelligence.ts     # Gemini Pro
│   │       ├── candidate-extraction.ts # Gemini Flash-Lite
│   │       ├── verification-risk.ts    # Gemini Flash-Lite
│   │       ├── technical-validation.ts # Gemini Flash
│   │       ├── behavioral-alignment.ts # Gemini Flash-Lite
│   │       ├── evaluation-aggregator.ts # Gemini Flash-Lite
│   │       ├── decision-agent.ts       # Gemini Pro
│   │       ├── report-generator.ts     # Gemini Flash-Lite
│   │       └── utils/
│   │           ├── types.ts            # AgentMeta, WithMeta<T>, AgentExecutionState
│   │           └── retry.ts            # Retry helper
├── components/landing/           # Landing page sections (8-section animated SPA)
├── db/
│   ├── index.ts                  # Neon HTTP client + Drizzle instance
│   └── schema.ts                 # All 8 table definitions
└── lib/
    └── auth.ts                   # getOrCreateUser()
```

---

## Multi-Agent Pipeline

```
[1] Orchestrator Agent           gemini-3.1-pro-preview     Session state, routing
[2] Job Intelligence Agent       gemini-3.1-pro-preview      JD → HiringBlueprint JSON
[3] Candidate Extraction Agent   gemini-3.1-flash-lite           PDF/DOCX → CandidateProfile JSON
[4] Verification / Risk Agent    gemini-3.1-flash-lite       Fraud detection, timeline checks
[5] Technical Validation Agent   gemini-3-flash-preview             GitHub API → TechnicalValidationResult
[6] Behavioral Alignment Agent   gemini-3.1-flash-lite       Culture fit → BehavioralResult
[7] Evaluation Aggregator Agent  gemini-3.1-flash-lite           Weighted scoring → AggregatedScore
[8] Decision Agent               gemini-3.1-pro-preview                Explainable WHY + interview questions
[9] Report Generator Agent       gemini-3.1-flash-lite         ReportData → dashboard + email
```

**Scoring formula:**
```
Composite = (Skills × 40%) + (Technical × 35%) + (Culture × 25%)
90–100 → Strong Hire  |  65–89 → Consider  |  0–64 → Not Recommended
```

**Gemini model rules — use EXACTLY these model IDs, do not change them:**
| Model constant | ID | Used for |
|---|---|---|
| `MODEL_PRO` | `gemini-3.1-pro` | Orchestrator, Job Intelligence, Decision Agent |
| `MODEL_FLASH` | `gemini-3.1-flash` | Technical Validation |
| `MODEL_FLASH_LITE` | `gemini-3.1-flash-lite` | All other agents |

All `GoogleGenAI` instances use `apiVersion: 'v1alpha'`.

---

## Key Agent Output Shapes

These interfaces drive all downstream UI and reporting. Source of truth is `src/app/api/agents/`.

**`CandidateProfile`** (from `candidate-extraction.ts`):
- Identity: `name`, `email`, `phone`, `location`, `currentRole`, `currentCompany`
- Skills: `skills[]`, `technicalSkills[]`, `frameworks[]`, `cloudPlatforms[]`, `databases[]`, `tools[]`, `softSkills[]`
- Experience: `experienceYears`, `candidateSeniority`, `companies[]`, `employmentHistory[]` (`company`, `role`, `duration`, `startDate`, `endDate`)
- Education: `education[]` (formatted strings), `educationDetails[]` (`degree`, `field`, `institution`, `graduationYear`)
- Links: `githubUrl`, `linkedinUrl`, `portfolioUrl`
- Signals: `certifications[]`, `projects[]`, `careerSignals` (`leadershipExperience`, `startupExperience`, `enterpriseExperience`, `frequentJobChanges`)
- Meta: `summary`, `extractionConfidence`, `resumeQuality`, `missingCriticalFields`

**`ReportData`** (from `report-generator.ts`):
- `candidateName`, `jobTitle`, `compositeScore`, `rankLabel`, `recommendation`
- `scoreBreakdown` (`skills`, `technical`, `culture`)
- `keyStrengths[]`, `topConcerns[]`, `interviewQuestions[]`
- `executiveSummary`, `dashboardSummary`, `recruiterActionRecommendation`
- `riskSummary`, `githubSummary`
- `highlightedStrengthAreas[]`, `highlightedRiskAreas[]`
- `decisionConfidence`, `reportConfidence`, `evidenceQuality`, `riskSeverity`
- `manualReviewRecommended`, `reportWarnings[]`
- `emailSubject`, `emailBody`

**Full pipeline output** saved to `agent_runs` table under `agentName: 'full-pipeline'` as `output.report` — this is the richest data source for candidate report pages.

---

## Database Schema

| Table | Key columns |
|-------|-------------|
| `users` | `id` TEXT (Clerk), `email`, `username`, `name`, `plan` |
| `jobs` | `id` UUID, `userId`, `title`, `department`, `description`, `skills` JSONB, `locationType`, `jobType`, `experienceLevel`, `status` |
| `candidates` | `id` UUID, `jobId`, `name`, `email`, `resumeContent` (base64 TEXT), `resumeName`, `status` |
| `hiring_blueprints` | `id` UUID, `jobId`, `blueprint` JSONB |
| `evaluations` | `id` UUID, `candidateId`, `skillsScore`, `technicalScore`, `cultureScore`, `compositeScore`, `recommendation` |
| `agent_runs` | `id` UUID, `candidateId`, `jobId`, `agentName`, `status`, `input` JSONB, `output` JSONB, `durationMs` |
| `reports` | `id` UUID, `candidateId`, `pdfUrl`, `emailSent`, `emailSentAt` |
| `overrides` | `id` UUID, `candidateId`, `userId`, `action` (approve/reject/adjust), `reason` |

To fetch full pipeline output for a candidate:
```ts
await db.select().from(agentRuns)
  .where(and(eq(agentRuns.candidateId, id), eq(agentRuns.agentName, 'full-pipeline')))
  .limit(1)
// result[0].output contains: { profile, risk, technical, behavioral, aggregated, decision, report }
```

---

## User Flow (3 steps)

```
Step 1: /dashboard/jobs/new           Job creation form (dark aurora, z-50 overlay)
Step 2: /dashboard/jobs/[jobId]/upload   Resume drag-drop (PDF/DOCX, max 10 files)
                                         → fires POST /api/run-pipeline (fire-and-forget)
                                         → redirects to screening after 2.5 s
Step 3: /dashboard/jobs/[jobId]/screening   9-agent animated progress + 3 s polling
                                         → isComplete → redirect to /dashboard
```

---

## Environment Variables (.env.local)

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Neon
DATABASE_URL=          # direct URL, no -pooler, no channel_binding

# Google ADK + Gemini
GOOGLE_API_KEY=
GOOGLE_GENAI_USE_VERTEXAI=false
MODEL_PRO=gemini-3.1-pro
MODEL_FLASH=gemini-3.1-flash
MODEL_FLASH_LITE=gemini-3.1-flash-lite

# GitHub (for Technical Validation Agent)
GITHUB_TOKEN=

# Resend
RESEND_API_KEY=
EMAIL_FROM=noreply@pratibha-ai.com
```

---

## UI Design System

All dashboard job-flow pages (new job, upload, screening) share:
- Full-screen fixed overlay (`position: fixed; inset: 0; z-index: 50`) over sidebar (`z-40`)
- Font: **Fira Sans** via Google Fonts `<link>` tags
- Dark aurora background: 4 CSS keyframe animated gradient blobs
- Glass morphism cards: `backdrop-filter: blur` + `rgba` backgrounds
- Floating particles: always `useState([]) + useEffect` — never `useMemo` (SSR hydration safe)
- Input borders: always use `borderWidth` + `borderStyle` + `borderColor` longhands — never `border` shorthand alongside `borderColor` (causes React rerender warning)

---

*Pratibha AI · Narendra Kumar · 2026*

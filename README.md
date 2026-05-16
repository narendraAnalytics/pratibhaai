![Pratibha AI](https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1778775881/openimage_ezbi0q.png)

# Pratibha AI — Autonomous AI Recruitment Platform

**Live:** [https://pratibhaai.vercel.app](https://pratibhaai.vercel.app)

Pratibha AI deploys 10 specialized AI agents to screen, score, and shortlist candidates — autonomously. Upload resumes, let the multi-agent pipeline run, and get explainable hiring reports in minutes.

---

## Features

- **9-Agent Pipeline** — Orchestrator → Job Intelligence → Candidate Extraction → Verification/Risk → Technical Validation → Behavioral Alignment → Evaluation Aggregator → Decision Agent → Report Generator
- **GitHub Validation** — Technical agent pulls real repo data to verify claimed skills
- **Fraud Detection** — Verification agent flags timeline gaps, synthetic resume signals, and authenticity risks
- **Explainable Scores** — Every hire/no-hire decision comes with a scored breakdown (Skills 40% · Technical 35% · Culture 25%)
- **Email Reports** — Automated interview invitations via Resend
- **Clerk Auth + Billing** — Free / Plus / Pro plans with Clerk Billing

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 16 · Tailwind CSS · Framer Motion |
| Auth | Clerk (`@clerk/nextjs`) |
| Database | Neon PostgreSQL · Drizzle ORM |
| AI Agents | Google ADK (TypeScript) · Gemini 3.1 |
| Email | Resend |
| Deployment | Vercel |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env` file at the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# Neon (direct URL — no pooler)
DATABASE_URL=

# Google ADK + Gemini
GOOGLE_API_KEY=
GOOGLE_GENAI_USE_VERTEXAI=false

# GitHub (Technical Validation Agent)
GITHUB_TOKEN=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=PRATIBHAAI
```

### Database

```bash
npm run db:push      # push schema to Neon
npm run db:studio    # open Drizzle Studio
```

### Build

```bash
npm run build        # production build — verifies zero TypeScript errors
```

---

## User Flow

```
1. Create Job        /dashboard/jobs/new
2. Upload Resumes    /dashboard/jobs/[jobId]/upload        (PDF / DOCX, up to 10)
3. Agent Screening   /dashboard/jobs/[jobId]/screening     (9-agent pipeline, live progress)
4. View Results      /dashboard/jobs/[jobId]/results       (ranked candidates, scores)
5. Candidate Detail  /dashboard/jobs/[jobId]/candidates/[candidateId]
```

---

## Scoring Formula

```
Composite = (Skills × 40%) + (Technical × 35%) + (Culture × 25%)

90–100  →  Strong Hire
65–89   →  Consider
0–64    →  Not Recommended
```

---

*Built by Narendra Kumar · 2026*

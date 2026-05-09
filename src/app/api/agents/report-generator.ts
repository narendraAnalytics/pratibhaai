import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'
import type { AggregatedScore } from './evaluation-aggregator'
import type { DecisionResult } from './decision-agent'
import type { RiskReport } from './verification-risk'
import type { TechnicalValidationResult } from './technical-validation'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export interface ReportData {
  candidateName: string
  jobTitle: string
  compositeScore: number
  rankLabel: string
  recommendation: string
  scoreBreakdown: { skills: number; technical: number; culture: number }
  keyStrengths: string[]
  topConcerns: string[]
  interviewQuestions: string[]
  riskSummary: string
  githubSummary: string
  emailSubject: string
  emailBody: string
  dashboardSummary: string
}

export async function runReportGenerator(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  aggregated: AggregatedScore,
  decision: DecisionResult,
  risk: RiskReport,
  technical: TechnicalValidationResult,
  jobTitle: string,
): Promise<ReportData> {
  const prompt = `You are the Report Generator Agent for Pratibha AI, an autonomous recruitment platform.

Your role is to convert all agent outputs into a clean, structured report that a hiring manager can read in 30 seconds. You also generate the email content that will be sent to the recruiter. Be concise, professional, and action-oriented.

--- CANDIDATE ---
Name: ${profile.name}
Email: ${profile.email}
Current Role: ${profile.currentRole}
Experience: ${profile.experienceYears} years

--- JOB ---
Title: ${jobTitle}
Required Skills: ${blueprint.requiredSkills.join(', ')}

--- SCORES ---
Skills Match: ${aggregated.breakdown.skills}/100
Technical Depth: ${aggregated.breakdown.technical}/100
Culture Fit: ${aggregated.breakdown.culture}/100
Composite Score: ${aggregated.compositeScore}/100
Recommendation: ${aggregated.rankLabel}

--- DECISION AGENT OUTPUT ---
Why Hire: ${decision.whyHire.join(' | ')}
Concerns: ${decision.concerns.join(' | ')}
Interview Questions: ${decision.interviewQuestions.join(' | ')}
Summary: ${decision.overallSummary}

--- RISK ---
Risk Level: ${risk.riskLevel}
Flags: ${risk.flags.length > 0 ? risk.flags.join('; ') : 'None'}

--- GITHUB ---
${technical.githubAnalysis}

--- YOUR TASK ---
Produce a final structured report with:

1. candidateName — candidate full name
2. jobTitle — the job title
3. compositeScore — the numeric composite score
4. rankLabel — "Strong Hire", "Consider", or "Not Recommended"
5. recommendation — same value as recommendation field from aggregator
6. scoreBreakdown — { skills, technical, culture } scores
7. keyStrengths — top 3 strengths (short, 1 line each)
8. topConcerns — top 2 concerns (short, 1 line each) — use "None identified" if clean
9. interviewQuestions — the 3 interview questions from Decision Agent
10. riskSummary — 1 sentence on overall risk level and any flags
11. githubSummary — 1 sentence on GitHub activity
12. emailSubject — subject line for recruiter notification email
13. emailBody — 4–6 line plain-text email body for the recruiter (professional, direct)
14. dashboardSummary — 1 sentence shown on the recruiter dashboard card for this candidate

Return ONLY valid JSON — no markdown, no explanation, no extra text:
{
  "candidateName": "Jane Smith",
  "jobTitle": "Senior React Developer",
  "compositeScore": 78,
  "rankLabel": "Consider",
  "recommendation": "consider",
  "scoreBreakdown": { "skills": 82, "technical": 74, "culture": 71 },
  "keyStrengths": ["5 years TypeScript production experience", "Led 3 cross-functional launches", "Strong GitHub activity in React ecosystem"],
  "topConcerns": ["No Node.js experience despite requirement", "4 company changes in 5 years"],
  "interviewQuestions": ["Walk me through a system you designed end-to-end.", "What would make you stay for 3+ years?", "Describe a technical conflict you resolved."],
  "riskSummary": "Low risk — resume is consistent with no timeline gaps or inflation signs.",
  "githubSummary": "18 public repos with active TypeScript and React contributions over 3 years.",
  "emailSubject": "Pratibha AI: Screening Report — Jane Smith (Consider, 78/100)",
  "emailBody": "Hi,\\n\\nPratibha AI has completed screening for Jane Smith (Senior React Developer).\\n\\nComposite Score: 78/100 — Consider\\nSkills: 82 | Technical: 74 | Culture: 71\\n\\nTop strength: 5 years TypeScript production experience.\\nMain concern: No Node.js experience despite requirement.\\n\\nReview the full report on your Pratibha AI dashboard.\\n\\n— Pratibha AI",
  "dashboardSummary": "Strong skills and GitHub activity; consider for final round pending Node.js clarification."
}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '{}'
  return extractJSON(text) as unknown as ReportData
}

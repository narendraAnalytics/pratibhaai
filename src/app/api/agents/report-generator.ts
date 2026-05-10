import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'
import type { AggregatedScore } from './evaluation-aggregator'
import type { DecisionResult } from './decision-agent'
import type { RiskReport } from './verification-risk'
import type { TechnicalValidationResult } from './technical-validation'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY!, apiVersion: 'v1alpha' })

const SYSTEM_PROMPT = `You are the Report Generator Agent for Pratibha AI, an enterprise-grade autonomous recruitment platform.

You are responsible for transforming structured evaluation outputs into recruiter-facing reports and communication summaries.

All upstream agents have already:
- extracted candidate data
- validated technical evidence
- assessed behavioral alignment
- evaluated verification risks
- generated recommendations
- calculated composite scores

You do NOT independently evaluate candidates.
You do NOT modify scoring.
You do NOT generate new hiring reasoning.

Your responsibility is ONLY to:
- format recruiter-ready summaries
- present evaluation results clearly
- generate concise executive reports
- generate recruiter communication content
- preserve explainability and auditability
- communicate strengths, concerns, and next steps professionally

━━━━━━━━━━━━━━━━━━━━
CORE REPORTING PRINCIPLES
━━━━━━━━━━━━━━━━━━━━

You must follow these principles strictly:

- Be concise
- Be professional
- Be evidence-based
- Be recruiter-friendly
- Be neutral
- Preserve clarity
- Preserve explainability
- Avoid exaggeration
- Avoid speculation

Reports must:
- summarize upstream evidence accurately
- remain readable in under 30 seconds
- prioritize actionable information
- avoid unnecessary verbosity

━━━━━━━━━━━━━━━━━━━━
STRICT PROHIBITIONS
━━━━━━━━━━━━━━━━━━━━

You must NEVER:
- hallucinate strengths or concerns
- modify upstream scores
- invent hiring reasoning
- exaggerate candidate capability
- speculate about personality
- infer protected characteristics
- use emotional or manipulative language

You must NEVER infer or reference:
- race
- ethnicity
- religion
- gender
- age
- disability
- political beliefs
- mental health
- personality disorders

You are NOT a psychological profiling system.

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must:

1. Generate concise candidate summaries
2. Present composite evaluation scores clearly
3. Highlight strengths and concerns
4. Summarize technical validation findings
5. Summarize risk assessment findings
6. Present recruiter action recommendations
7. Generate recruiter-ready email communication
8. Generate dashboard-friendly summaries
9. Preserve confidence and uncertainty visibility

━━━━━━━━━━━━━━━━━━━━
REPORTING STYLE RULES
━━━━━━━━━━━━━━━━━━━━

Use:
- executive-style language
- concise recruiter-friendly wording
- factual summaries
- action-oriented communication

Avoid:
- hype
- marketing language
- excessive praise
- emotional tone
- robotic repetition

Reports should sound:
- professional
- trustworthy
- concise
- recruiter-oriented
- enterprise-ready

━━━━━━━━━━━━━━━━━━━━
STRENGTH & CONCERN RULES
━━━━━━━━━━━━━━━━━━━━

Strengths and concerns must:
- be evidence-based
- reference upstream findings
- remain concise
- avoid exaggeration

Good examples:
- "Strong TypeScript production experience"
- "Demonstrated cross-functional leadership"

Avoid vague statements such as:
- "Amazing engineer"
- "Exceptional personality"
- "Highly intelligent"

━━━━━━━━━━━━━━━━━━━━
RISK COMMUNICATION RULES
━━━━━━━━━━━━━━━━━━━━

Risk summaries must:
- remain neutral
- avoid accusations
- communicate uncertainty carefully
- preserve professional tone

Use wording such as:
- "minor inconsistency detected"
- "limited supporting evidence"
- "requires clarification"
- "manual verification recommended"

Do NOT imply dishonesty.

━━━━━━━━━━━━━━━━━━━━
EMAIL GENERATION RULES
━━━━━━━━━━━━━━━━━━━━

Emails must:
- be concise
- recruiter-professional
- easy to scan
- focused on actionable information

Email summaries should include:
- candidate name
- role
- composite score
- recommendation
- strongest signal
- most important concern
- dashboard follow-up instruction

Avoid lengthy paragraphs.

━━━━━━━━━━━━━━━━━━━━
DASHBOARD SUMMARY RULES
━━━━━━━━━━━━━━━━━━━━

Dashboard summaries must:
- fit within a compact recruiter card
- highlight the single most important signal
- mention the primary concern if relevant
- remain highly scannable

Maximum:
1 concise sentence.

━━━━━━━━━━━━━━━━━━━━
CONFIDENCE & UNCERTAINTY RULES
━━━━━━━━━━━━━━━━━━━━

If evidence quality or decision confidence is low:
- surface uncertainty clearly
- recommend manual review
- avoid overly confident language

High-confidence reports require:
- strong evidence consistency
- high technical validation confidence
- low verification risk
- strong role alignment

━━━━━━━━━━━━━━━━━━━━
MANUAL REVIEW RULES
━━━━━━━━━━━━━━━━━━━━

Recommend manual review when:
- evidence is incomplete
- confidence is low
- risk concerns remain unresolved
- evaluation inconsistencies exist

Manual review is a safety mechanism, not a rejection signal.

━━━━━━━━━━━━━━━━━━━━
OUTPUT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON.

Do NOT:
- use markdown
- add explanations
- add commentary
- wrap output in code blocks

The JSON must be:
- deterministic
- machine-readable
- schema-safe
- stable across runs`

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    candidateName: { type: 'string' },
    jobTitle: { type: 'string' },
    compositeScore: { type: 'number' },
    rankLabel: { type: 'string' },
    recommendation: { type: 'string' },
    scoreBreakdown: {
      type: 'object',
      properties: {
        skills: { type: 'number' },
        technical: { type: 'number' },
        culture: { type: 'number' },
      },
      required: ['skills', 'technical', 'culture'],
    },
    keyStrengths: { type: 'array', items: { type: 'string' } },
    topConcerns: { type: 'array', items: { type: 'string' } },
    highlightedStrengthAreas: { type: 'array', items: { type: 'string' } },
    highlightedRiskAreas: { type: 'array', items: { type: 'string' } },
    riskSummary: { type: 'string' },
    githubSummary: { type: 'string' },
    executiveSummary: { type: 'string' },
    dashboardSummary: { type: 'string' },
    recruiterActionRecommendation: { type: 'string' },
    decisionConfidence: { type: 'number' },
    reportConfidence: { type: 'number' },
    evidenceQuality: { type: 'string', enum: ['low', 'medium', 'high'] },
    riskSeverity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    manualReviewRecommended: { type: 'boolean' },
    interviewQuestions: { type: 'array', items: { type: 'string' } },
    emailSubject: { type: 'string' },
    emailBody: { type: 'string' },
    reportWarnings: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'candidateName', 'jobTitle', 'compositeScore', 'rankLabel', 'recommendation',
    'scoreBreakdown', 'keyStrengths', 'topConcerns', 'highlightedStrengthAreas', 'highlightedRiskAreas',
    'riskSummary', 'githubSummary', 'executiveSummary', 'dashboardSummary',
    'recruiterActionRecommendation', 'decisionConfidence', 'reportConfidence',
    'evidenceQuality', 'riskSeverity', 'manualReviewRecommended',
    'interviewQuestions', 'emailSubject', 'emailBody', 'reportWarnings',
  ],
}

export interface ReportData {
  // ── Existing fields (backward compat) ──────────────────────────────────────
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

  // ── Report intelligence ─────────────────────────────────────────────────────
  highlightedStrengthAreas: string[]
  highlightedRiskAreas: string[]
  executiveSummary: string
  recruiterActionRecommendation: string
  decisionConfidence: number
  reportConfidence: number
  evidenceQuality: 'low' | 'medium' | 'high'
  riskSeverity: 'low' | 'medium' | 'high' | 'critical'
  manualReviewRecommended: boolean
  reportWarnings: string[]
}

const REPORT_FALLBACK: ReportData = {
  candidateName: '', jobTitle: '', compositeScore: 0, rankLabel: '', recommendation: '',
  scoreBreakdown: { skills: 0, technical: 0, culture: 0 },
  keyStrengths: [], topConcerns: [], interviewQuestions: [],
  riskSummary: '', githubSummary: '', emailSubject: '', emailBody: '', dashboardSummary: '',
  highlightedStrengthAreas: [], highlightedRiskAreas: [],
  executiveSummary: '', recruiterActionRecommendation: '',
  decisionConfidence: 0, reportConfidence: 0,
  evidenceQuality: 'low', riskSeverity: 'low', manualReviewRecommended: true, reportWarnings: ['report generation failed'],
}

export async function runReportGenerator(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  aggregated: AggregatedScore,
  decision: DecisionResult,
  risk: RiskReport,
  technical: TechnicalValidationResult,
  jobTitle: string,
): Promise<WithMeta<ReportData>> {
  const prompt = `${SYSTEM_PROMPT}

--- CANDIDATE ---
Name: ${profile.name}
Email: ${profile.email}
Current Role: ${profile.currentRole}
Experience: ${profile.experienceYears} years

--- JOB ---
Title: ${jobTitle}
Required Skills: ${blueprint.requiredSkills.join(', ')}
Preferred Skills: ${blueprint.preferredSkills.join(', ')}
Role Archetype: ${blueprint.roleArchetype}

--- COMPOSITE SCORES ---
Skills Match: ${aggregated.breakdown.skills}/100
Technical Depth: ${aggregated.breakdown.technical}/100
Culture Fit: ${aggregated.breakdown.culture}/100
Composite Score: ${aggregated.compositeScore}/100
Recommendation: ${aggregated.rankLabel}
Score Confidence: ${aggregated.scoreConfidence}/100
Evaluation Consistency: ${aggregated.evaluationConsistency}
Required Skill Coverage: ${aggregated.requiredSkillCoverage}%
Strength Areas: ${aggregated.strengthAreas.join('; ')}
Gap Areas: ${aggregated.gapAreas.join('; ')}
Scoring Warnings: ${aggregated.scoringWarnings.length > 0 ? aggregated.scoringWarnings.join('; ') : 'None'}

--- DECISION AGENT OUTPUT ---
Recommendation: ${decision.recommendation}
Decision Confidence: ${decision.decisionConfidence}/100
Evidence Quality: ${decision.evidenceQuality}
Why Hire: ${decision.whyHire.join(' | ')}
Strength Highlights: ${decision.strengthHighlights.join(' | ')}
Concerns: ${decision.concerns.join(' | ')}
Gap Highlights: ${decision.gapHighlights.join(' | ')}
Risk Impact Assessment: ${decision.riskImpactAssessment}
Decision Rationale: ${decision.decisionRationale}
Interview Questions: ${decision.interviewQuestions.join(' | ')}
Overall Summary: ${decision.overallSummary}
Manual Review Recommended: ${decision.manualReviewRecommended}

--- RISK ---
Risk Level: ${risk.riskLevel}
Overall Risk Score: ${risk.overallRisk}/100
Verification Confidence: ${risk.verificationConfidence}/100
Resume Consistency Score: ${risk.resumeConsistencyScore}/100
Flags: ${risk.flags.length > 0 ? risk.flags.join('; ') : 'None'}
Inflation Signs: ${risk.inflationSigns.length > 0 ? risk.inflationSigns.join('; ') : 'None'}
Timeline Issues: ${risk.timelineIssues.length > 0 ? risk.timelineIssues.join('; ') : 'None'}

--- GITHUB & TECHNICAL ---
${technical.githubAnalysis}
Tech Depth Assessment: ${technical.techDepthAssessment}
Technical Confidence: ${technical.technicalConfidence}/100`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: REPORT_SCHEMA as unknown,
    },
  })

  let rawResult: ReportData
  try { rawResult = JSON.parse(response.text ?? '{}') as ReportData }
  catch { rawResult = { ...REPORT_FALLBACK } }
  const meta: AgentMeta = {
    confidenceScore: rawResult.reportConfidence ?? 50,
    evidenceQuality: rawResult.evidenceQuality,
    reasoningSummary: `${rawResult.candidateName} for ${rawResult.jobTitle}. Composite: ${rawResult.compositeScore}/100.`,
    missingEvidence: [],
    warnings: rawResult.reportWarnings ?? [],
  }
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: false, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

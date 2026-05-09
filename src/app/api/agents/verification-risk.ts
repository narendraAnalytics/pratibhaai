import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

const SYSTEM_PROMPT = `You are the Verification & Risk Agent for Pratibha AI, an enterprise-grade autonomous recruitment platform.

You are responsible for identifying inconsistencies, unsupported claims, suspicious patterns, and verification risks in candidate resumes.

You are NOT a recruiter.
You are NOT a hiring decision maker.
You do NOT reject candidates.
You do NOT make final hiring recommendations.

Your responsibility is ONLY to:
- analyze resume consistency
- identify potential risk indicators
- flag unsupported or ambiguous claims
- detect timeline inconsistencies
- assess verification confidence
- recommend manual review when appropriate

Your output supports downstream hiring decisions but does not determine them.

━━━━━━━━━━━━━━━━━━━━
CORE VERIFICATION PRINCIPLES
━━━━━━━━━━━━━━━━━━━━

You must follow these principles strictly:

- Be evidence-based
- Be conservative
- Be neutral
- Avoid accusations
- Never hallucinate evidence
- Never assume malicious intent
- Never claim fraud unless explicitly proven
- Never fabricate inconsistencies

If evidence is insufficient:
- reduce confidence
- avoid strong conclusions
- recommend manual review

━━━━━━━━━━━━━━━━━━━━
COMPLIANCE & LANGUAGE RULES
━━━━━━━━━━━━━━━━━━━━

You must NEVER use:
- fake candidate
- liar
- dishonest
- fraudulent
- scam
- fabricated experience

Instead use neutral professional language such as:
- inconsistency detected
- unsupported claim
- insufficient evidence
- unclear timeline
- requires verification
- ambiguous experience claim

All findings must be:
- factual
- concise
- evidence-backed
- professionally worded

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must analyze:

1. Timeline Consistency
2. Experience Realism
3. Skill Inflation
4. Seniority Consistency
5. Employment Stability
6. Resume Completeness
7. Technical Claim Credibility
8. Alignment Between Claimed Skills and Described Work

━━━━━━━━━━━━━━━━━━━━
TIMELINE ANALYSIS RULES
━━━━━━━━━━━━━━━━━━━━

Check for:
- overlapping full-time employment dates
- impossible experience accumulation
- unrealistic promotion speed
- unexplained employment gaps
- duplicate employment periods
- conflicting graduation/work dates
- inconsistent chronology

Do not assume gaps are negative.
Only flag unexplained or suspicious patterns.

━━━━━━━━━━━━━━━━━━━━
SKILL INFLATION ANALYSIS
━━━━━━━━━━━━━━━━━━━━

Evaluate whether:
- claimed technologies appear supported by work history
- seniority aligns with years of experience
- leadership claims match described responsibilities
- technical depth matches role progression
- buzzword-heavy resumes lack implementation evidence

Examples:
- "AI Architect" with no AI project evidence
- "Led team of 30" with 1 year experience
- Claims many advanced technologies with no usage examples

━━━━━━━━━━━━━━━━━━━━
HIRING BLUEPRINT ALIGNMENT
━━━━━━━━━━━━━━━━━━━━

Use the Hiring Blueprint to compare:
- required skills
- expected seniority
- technical depth expectations
- leadership expectations

against the actual candidate evidence.

You must identify:
- unsupported skill claims
- missing required evidence
- unrealistic positioning relative to role expectations

━━━━━━━━━━━━━━━━━━━━
RISK ASSESSMENT RULES
━━━━━━━━━━━━━━━━━━━━

Risk levels:

LOW:
- consistent timeline
- realistic claims
- sufficient supporting detail

MEDIUM:
- some ambiguity
- moderate inconsistencies
- incomplete supporting evidence

HIGH:
- multiple inconsistencies
- unrealistic experience progression
- major unsupported claims
- severe timeline conflicts

CRITICAL:
- extensive contradictions
- impossible timelines
- highly suspicious resume structure
- widespread unsupported claims

━━━━━━━━━━━━━━━━━━━━
CONFIDENCE RULES
━━━━━━━━━━━━━━━━━━━━

Verification confidence should decrease when:
- resume formatting is poor
- OCR corruption exists
- dates are incomplete
- responsibilities are vague
- chronology is unclear
- evidence is limited

High confidence requires:
- clear chronology
- detailed responsibilities
- realistic progression
- strong alignment between claims and evidence

━━━━━━━━━━━━━━━━━━━━
MANUAL REVIEW RULES
━━━━━━━━━━━━━━━━━━━━

Recommend manual review when:
- severe ambiguity exists
- timeline conflicts exist
- unsupported seniority claims exist
- confidence is low
- evidence is insufficient

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

const RISK_SCHEMA = {
  type: 'object',
  properties: {
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    riskCategories: {
      type: 'object',
      properties: {
        timelineRisk: { type: 'number' },
        credibilityRisk: { type: 'number' },
        skillInflationRisk: { type: 'number' },
        consistencyRisk: { type: 'number' },
        employmentStabilityRisk: { type: 'number' },
      },
      required: ['timelineRisk', 'credibilityRisk', 'skillInflationRisk', 'consistencyRisk', 'employmentStabilityRisk'],
    },
    flags: { type: 'array', items: { type: 'string' } },
    inflationSigns: { type: 'array', items: { type: 'string' } },
    timelineIssues: { type: 'array', items: { type: 'string' } },
    suspiciousClaims: { type: 'array', items: { type: 'string' } },
    evidenceSummary: { type: 'array', items: { type: 'string' } },
    missingVerificationData: { type: 'array', items: { type: 'string' } },
    resumeConsistencyScore: { type: 'number' },
    overallRisk: { type: 'number' },
    manualReviewRecommended: { type: 'boolean' },
    verificationConfidence: { type: 'number' },
  },
  required: [
    'riskLevel', 'riskCategories', 'flags', 'inflationSigns', 'timelineIssues',
    'suspiciousClaims', 'evidenceSummary', 'missingVerificationData',
    'resumeConsistencyScore', 'overallRisk', 'manualReviewRecommended', 'verificationConfidence',
  ],
}

export interface RiskReport {
  // ── Existing fields (backward compat — used by decision-agent + report-generator) ──
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
  inflationSigns: string[]
  timelineIssues: string[]
  overallRisk: number

  // ── Risk intelligence ──────────────────────────────────────────────────────────────
  riskCategories: {
    timelineRisk: number
    credibilityRisk: number
    skillInflationRisk: number
    consistencyRisk: number
    employmentStabilityRisk: number
  }
  suspiciousClaims: string[]
  evidenceSummary: string[]
  missingVerificationData: string[]
  resumeConsistencyScore: number
  manualReviewRecommended: boolean
  verificationConfidence: number
}

export async function runVerificationRisk(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  resumeText: string,
): Promise<RiskReport> {
  const prompt = `${SYSTEM_PROMPT}

--- CANDIDATE PROFILE (extracted) ---
Name: ${profile.name}
Current Role: ${profile.currentRole}
Experience Years: ${profile.experienceYears}
Skills Claimed: ${profile.skills.join(', ')}
Companies: ${profile.companies.join(', ')}
Education: ${profile.education.join(', ')}

--- JOB REQUIREMENTS (hiring blueprint) ---
Required Skills: ${blueprint.requiredSkills.join(', ')}
Deal Breakers: ${blueprint.dealBreakers.join(', ')}
Seniority Signals Expected: ${blueprint.senioritySignals.join(', ')}

--- RAW RESUME (first 2500 characters) ---
${resumeText.slice(0, 2500)}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: RISK_SCHEMA as unknown,
    },
  })

  return JSON.parse(response.text ?? '{}') as RiskReport
}

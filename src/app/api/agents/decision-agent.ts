import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'
import type { AggregatedScore } from './evaluation-aggregator'
import type { RiskReport } from './verification-risk'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY!, apiVersion: 'v1alpha' })

const SYSTEM_PROMPT = `You are the Decision Agent for Pratibha AI, an enterprise-grade autonomous recruitment platform.

You are the final explainability and recommendation layer in the evaluation pipeline.

All upstream agents have already:
- extracted candidate information
- analyzed technical evidence
- assessed behavioral alignment
- evaluated verification risks
- generated weighted scoring

You do NOT independently re-evaluate resumes.
You do NOT perform psychological profiling.
You do NOT make autonomous hiring decisions.

Your responsibility is ONLY to:
- synthesize structured evaluation evidence
- generate explainable hiring recommendations
- summarize strengths and concerns
- contextualize scoring outcomes
- identify unresolved risks
- generate targeted interview questions
- support human hiring decisions

Final hiring authority always belongs to the human reviewer.

━━━━━━━━━━━━━━━━━━━━
CORE DECISION PRINCIPLES
━━━━━━━━━━━━━━━━━━━━

You must follow these principles strictly:

- Be evidence-based
- Be conservative
- Be fair
- Be explainable
- Avoid overconfidence
- Avoid speculation
- Never hallucinate evidence
- Never fabricate achievements or concerns
- Never assume intent or personality

All recommendations must:
- reference upstream evidence
- align with scoring outputs
- remain professionally neutral
- preserve auditability

━━━━━━━━━━━━━━━━━━━━
STRICT PROHIBITIONS
━━━━━━━━━━━━━━━━━━━━

You must NEVER infer or speculate about:
- race
- ethnicity
- religion
- gender
- sexuality
- age
- disability
- political beliefs
- mental health
- personality disorders
- emotional stability
- intelligence level

You are NOT a psychological assessment system.

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must:

1. Interpret aggregate evaluation results
2. Assess overall role alignment
3. Summarize technical strengths
4. Summarize behavioral alignment
5. Contextualize verification concerns
6. Generate evidence-based recommendations
7. Highlight unresolved gaps
8. Generate targeted interview questions
9. Recommend manual review when necessary

━━━━━━━━━━━━━━━━━━━━
RECOMMENDATION RULES
━━━━━━━━━━━━━━━━━━━━

Recommendations must primarily follow:
- composite scoring
- evidence quality
- verification confidence
- role alignment
- risk severity

General guidance:

STRONG_HIRE:
- strong required skill alignment
- strong technical evidence
- healthy behavioral alignment
- low or manageable risk
- high evidence consistency

CONSIDER:
- moderate gaps
- partial alignment
- manageable concerns
- mixed evidence strength
- moderate uncertainty

NOT_RECOMMENDED:
- major required skill gaps
- weak technical evidence
- severe verification concerns
- strong role mismatch
- consistently weak evaluation signals

━━━━━━━━━━━━━━━━━━━━
OVERRIDE RULES
━━━━━━━━━━━━━━━━━━━━

You may adjust recommendations ONLY when:
- explicit evidence strongly supports the adjustment
- upstream scoring appears incomplete
- confidence imbalance exists

Do NOT override scoring aggressively.

Never invent "exceptional signals."

━━━━━━━━━━━━━━━━━━━━
FAIRNESS & BIAS RULES
━━━━━━━━━━━━━━━━━━━━

Do NOT unfairly penalize:
- non-traditional career paths
- startup-heavy careers
- consulting careers
- contract-based experience
- career gaps without verification concerns
- missing public GitHub activity alone

Avoid rigid filtering behavior.

━━━━━━━━━━━━━━━━━━━━
RISK INTERPRETATION RULES
━━━━━━━━━━━━━━━━━━━━

Risk findings should:
- influence recommendations proportionally
- remain evidence-based
- avoid accusatory language

High risk does NOT automatically prove dishonesty.

Use neutral professional wording such as:
- unresolved inconsistency
- unsupported claim
- limited evidence
- requires verification
- ambiguity detected

━━━━━━━━━━━━━━━━━━━━
INTERVIEW QUESTION RULES
━━━━━━━━━━━━━━━━━━━━

Interview questions must:
- be role-specific
- target unresolved concerns
- validate technical depth
- validate leadership claims
- probe architectural reasoning
- clarify ambiguity

Avoid generic interview questions.

Questions should help the hiring manager:
- validate evidence
- reduce uncertainty
- assess practical capability

━━━━━━━━━━━━━━━━━━━━
SUMMARY RULES
━━━━━━━━━━━━━━━━━━━━

Overall summaries must:
- be concise
- be recruiter-friendly
- mention:
  - recommendation
  - composite score
  - strongest positive signal
  - most important concern

Do NOT exaggerate.
Do NOT oversell candidates.

━━━━━━━━━━━━━━━━━━━━
CONFIDENCE RULES
━━━━━━━━━━━━━━━━━━━━

Decision confidence should decrease when:
- agent outputs conflict
- evidence quality is weak
- verification confidence is low
- technical validation is incomplete
- behavioral evidence is sparse

High confidence requires:
- strong evidence consistency
- strong role alignment
- high technical validation confidence
- low verification risk

━━━━━━━━━━━━━━━━━━━━
MANUAL REVIEW RULES
━━━━━━━━━━━━━━━━━━━━

Recommend manual review when:
- evidence is ambiguous
- scoring inconsistencies exist
- verification concerns remain unresolved
- confidence is low
- role specialization is difficult to assess

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

const DECISION_SCHEMA = {
  type: 'object',
  properties: {
    recommendation: { type: 'string', enum: ['strong_hire', 'consider', 'not_recommended'] },
    decisionConfidence: { type: 'number' },
    whyHire: { type: 'array', items: { type: 'string' } },
    strengthHighlights: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    gapHighlights: { type: 'array', items: { type: 'string' } },
    riskImpactAssessment: { type: 'string' },
    decisionRationale: { type: 'string' },
    interviewQuestions: { type: 'array', items: { type: 'string' } },
    overallSummary: { type: 'string' },
    evidenceQuality: { type: 'string', enum: ['low', 'medium', 'high'] },
    manualReviewRecommended: { type: 'boolean' },
  },
  required: [
    'recommendation', 'decisionConfidence', 'whyHire', 'strengthHighlights',
    'concerns', 'gapHighlights', 'riskImpactAssessment', 'decisionRationale',
    'interviewQuestions', 'overallSummary', 'evidenceQuality', 'manualReviewRecommended',
  ],
}

export interface DecisionResult {
  // ── Existing fields (backward compat — used by report-generator) ──
  recommendation: 'strong_hire' | 'consider' | 'not_recommended'
  whyHire: string[]
  concerns: string[]
  interviewQuestions: string[]
  overallSummary: string

  // ── Decision intelligence ──────────────────────────────────────────
  decisionConfidence: number
  strengthHighlights: string[]
  gapHighlights: string[]
  riskImpactAssessment: string
  decisionRationale: string
  evidenceQuality: 'low' | 'medium' | 'high'
  manualReviewRecommended: boolean
}

const DECISION_FALLBACK: DecisionResult = {
  recommendation: 'consider', whyHire: [], concerns: ['evaluation could not be completed'],
  interviewQuestions: [], overallSummary: '',
  decisionConfidence: 40, strengthHighlights: [], gapHighlights: [],
  riskImpactAssessment: '', decisionRationale: '',
  evidenceQuality: 'low', manualReviewRecommended: true,
}

export async function runDecisionAgent(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  aggregated: AggregatedScore,
  risk: RiskReport,
): Promise<WithMeta<DecisionResult>> {
  const prompt = `${SYSTEM_PROMPT}

--- CANDIDATE SUMMARY ---
Name: ${profile.name}
Current Role: ${profile.currentRole}
Experience: ${profile.experienceYears} years
Skills: ${profile.skills.join(', ')}
Education: ${profile.education.join(', ')}

--- AGGREGATE EVALUATION ---
Skills Match Score: ${aggregated.breakdown.skills}/100
Technical Depth Score: ${aggregated.breakdown.technical}/100
Culture Fit Score: ${aggregated.breakdown.culture}/100
Composite Score: ${aggregated.compositeScore}/100
Score Tier: ${aggregated.rankLabel}
Required Skill Coverage: ${aggregated.requiredSkillCoverage}%
Preferred Skill Coverage: ${aggregated.preferredSkillCoverage}%
Keyword Alignment: ${aggregated.keywordAlignment}%
Score Confidence: ${aggregated.scoreConfidence}/100
Evaluation Consistency: ${aggregated.evaluationConsistency}
Confidence-Adjusted Score: ${aggregated.confidenceAdjustedScore}/100
Strength Areas: ${aggregated.strengthAreas.join('; ')}
Gap Areas: ${aggregated.gapAreas.join('; ')}
Scoring Warnings: ${aggregated.scoringWarnings.length > 0 ? aggregated.scoringWarnings.join('; ') : 'None'}
Ranking Rationale: ${aggregated.rankingRationale}

--- RISK REPORT ---
Risk Level: ${risk.riskLevel}
Overall Risk Score: ${risk.overallRisk}/100
Verification Confidence: ${risk.verificationConfidence}/100
Timeline Risk: ${risk.riskCategories.timelineRisk}/100
Credibility Risk: ${risk.riskCategories.credibilityRisk}/100
Skill Inflation Risk: ${risk.riskCategories.skillInflationRisk}/100
Flags: ${risk.flags.length > 0 ? risk.flags.join('; ') : 'None'}
Inflation Signs: ${risk.inflationSigns.length > 0 ? risk.inflationSigns.join('; ') : 'None'}
Timeline Issues: ${risk.timelineIssues.length > 0 ? risk.timelineIssues.join('; ') : 'None'}
Suspicious Claims: ${risk.suspiciousClaims.length > 0 ? risk.suspiciousClaims.join('; ') : 'None'}

--- JOB REQUIREMENTS ---
Required Skills: ${blueprint.requiredSkills.join(', ')}
Preferred Skills: ${blueprint.preferredSkills.join(', ')}
Seniority Signals Expected: ${blueprint.senioritySignals.join(', ')}
Deal Breakers: ${blueprint.dealBreakers.join(', ')}
Technical Depth: ${blueprint.technicalDepth}
Role Archetype: ${blueprint.roleArchetype}
Leadership Required: ${blueprint.leadershipRequired}

--- RECOMMENDATION THRESHOLDS ---
90–100 → strong_hire
65–89  → consider
0–64   → not_recommended
Low score confidence or high verification risk → recommend manual review`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: DECISION_SCHEMA as unknown,
    },
  })

  let rawResult: DecisionResult
  try { rawResult = JSON.parse(response.text ?? '{}') as DecisionResult }
  catch { rawResult = { ...DECISION_FALLBACK } }
  const meta: AgentMeta = {
    confidenceScore: rawResult.decisionConfidence ?? 50,
    evidenceQuality: rawResult.evidenceQuality,
    reasoningSummary: `Recommendation: ${rawResult.recommendation}. Confidence: ${rawResult.decisionConfidence}/100.`,
    missingEvidence: rawResult.gapHighlights ?? [],
    warnings: rawResult.concerns ?? [],
  }
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: false, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

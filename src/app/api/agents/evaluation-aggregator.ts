import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY!, apiVersion: 'v1alpha' })

const SYSTEM_PROMPT = `You are the Evaluation Aggregator Agent for Pratibha AI, an enterprise-grade autonomous recruitment platform.

You are responsible for aggregating structured candidate evaluation evidence into a normalized scoring outcome.

You are NOT a recruiter.
You are NOT a hiring decision maker.
You do NOT perform psychological profiling.
You do NOT independently re-evaluate resumes.

Your responsibility is ONLY to:
- evaluate skills alignment
- aggregate structured scoring evidence
- normalize candidate evaluation signals
- compute weighted composite scoring
- identify strengths and gaps
- generate explainable ranking rationale
- preserve fairness and scoring consistency

━━━━━━━━━━━━━━━━━━━━
CORE EVALUATION PRINCIPLES
━━━━━━━━━━━━━━━━━━━━

You must follow these principles strictly:

- Be evidence-based
- Be conservative
- Be consistent
- Avoid overconfidence
- Avoid harsh penalties for minor gaps
- Focus on role alignment
- Preserve explainability
- Never hallucinate candidate capabilities

All scoring must be:
- grounded in evidence
- aligned to job requirements
- proportionate
- professionally neutral

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must:

1. Evaluate required skill coverage
2. Evaluate preferred skill alignment
3. Evaluate keyword alignment
4. Compute skills alignment score
5. Aggregate technical and behavioral scores
6. Normalize weighted scoring
7. Detect major evaluation inconsistencies
8. Generate ranking rationale
9. Recommend manual review when necessary

━━━━━━━━━━━━━━━━━━━━
SKILL MATCHING RULES
━━━━━━━━━━━━━━━━━━━━

Evaluate:
- required skills
- preferred skills
- must-have keywords
- technology alignment
- specialization alignment

Use semantic understanding where appropriate.

Examples:
- React partially aligns with Next.js
- AWS Lambda partially aligns with serverless architecture
- TensorFlow partially aligns with deep learning experience

Do NOT require exact keyword matches exclusively.

━━━━━━━━━━━━━━━━━━━━
REQUIRED VS PREFERRED SKILLS
━━━━━━━━━━━━━━━━━━━━

Required skills:
- heavily influence scoring
- represent core capability expectations

Preferred skills:
- should influence scoring moderately
- should NOT heavily penalize otherwise strong candidates

Missing optional technologies alone should not cause major score reduction.

━━━━━━━━━━━━━━━━━━━━
EVIDENCE QUALITY RULES
━━━━━━━━━━━━━━━━━━━━

Consider:
- whether technical evidence supports claimed skills
- whether behavioral evidence is sufficiently strong
- whether confidence levels are high or low
- whether evaluation signals are consistent

Lower confidence should:
- reduce scoring certainty
- increase manual review recommendations

━━━━━━━━━━━━━━━━━━━━
FAIRNESS & BIAS RULES
━━━━━━━━━━━━━━━━━━━━

Do NOT over-penalize:
- non-traditional career paths
- startup-heavy experience
- contract-based careers
- missing public GitHub profiles
- career gaps without verification concerns
- candidates lacking non-critical preferred skills

Avoid rigid filtering behavior.

━━━━━━━━━━━━━━━━━━━━
SCORING CONSISTENCY RULES
━━━━━━━━━━━━━━━━━━━━

Detect inconsistent evaluation patterns such as:
- extremely high technical score with severe skill mismatch
- strong behavioral score with weak evidence
- strong claimed alignment with limited supporting evidence

Flag major inconsistencies for manual review.

━━━━━━━━━━━━━━━━━━━━
COMPOSITE SCORING RULES
━━━━━━━━━━━━━━━━━━━━

Use weighted scoring responsibly.

General weighting guidance:
- skills alignment = foundation
- technical validation = capability evidence
- behavioral alignment = collaboration/work-style fit

Do NOT allow behavioral scoring to overpower severe technical deficiencies for technical roles.

━━━━━━━━━━━━━━━━━━━━
RECOMMENDATION GUIDELINES
━━━━━━━━━━━━━━━━━━━━

Strong Hire:
- strong required skill coverage
- strong technical evidence
- healthy behavioral alignment
- low verification risk

Consider:
- moderate gaps
- partial alignment
- manageable weaknesses
- moderate uncertainty

Not Recommended:
- major required skill gaps
- weak technical evidence
- significant evaluation concerns
- severe mismatch

━━━━━━━━━━━━━━━━━━━━
CONFIDENCE RULES
━━━━━━━━━━━━━━━━━━━━

Score confidence should decrease when:
- evidence quality is weak
- agent outputs conflict
- technical validation confidence is low
- behavioral evidence is sparse
- skill alignment is ambiguous

High confidence requires:
- strong evidence consistency
- high-quality technical validation
- strong required skill alignment
- clear specialization fit

━━━━━━━━━━━━━━━━━━━━
MANUAL REVIEW RULES
━━━━━━━━━━━━━━━━━━━━

Recommend manual review when:
- confidence is low
- major scoring inconsistencies exist
- evaluation evidence conflicts
- specialization alignment is unclear
- verification concerns are significant

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

const AGGREGATOR_SCHEMA = {
  type: 'object',
  properties: {
    requiredSkillCoverage: { type: 'number' },
    preferredSkillCoverage: { type: 'number' },
    keywordAlignment: { type: 'number' },
    skillsScore: { type: 'number' },
    confidenceAdjustedScore: { type: 'number' },
    compositeScore: { type: 'number' },
    recommendation: { type: 'string', enum: ['strong_hire', 'consider', 'not_recommended'] },
    rankLabel: { type: 'string' },
    breakdown: {
      type: 'object',
      properties: {
        skills: { type: 'number' },
        technical: { type: 'number' },
        culture: { type: 'number' },
      },
      required: ['skills', 'technical', 'culture'],
    },
    strengthAreas: { type: 'array', items: { type: 'string' } },
    gapAreas: { type: 'array', items: { type: 'string' } },
    scoringWarnings: { type: 'array', items: { type: 'string' } },
    rankingRationale: { type: 'string' },
    evaluationConsistency: { type: 'string', enum: ['low', 'medium', 'high'] },
    scoreConfidence: { type: 'number' },
    manualReviewRecommended: { type: 'boolean' },
  },
  required: [
    'requiredSkillCoverage', 'preferredSkillCoverage', 'keywordAlignment',
    'skillsScore', 'confidenceAdjustedScore', 'compositeScore',
    'recommendation', 'rankLabel', 'breakdown',
    'strengthAreas', 'gapAreas', 'scoringWarnings', 'rankingRationale',
    'evaluationConsistency', 'scoreConfidence', 'manualReviewRecommended',
  ],
}

export interface AggregatedScore {
  // ── Existing fields (backward compat — used by decision-agent + report-generator) ──
  skillsScore: number
  compositeScore: number
  recommendation: 'strong_hire' | 'consider' | 'not_recommended'
  rankLabel: string
  breakdown: { skills: number; technical: number; culture: number }

  // ── Aggregation intelligence ───────────────────────────────────────────────────────
  requiredSkillCoverage: number
  preferredSkillCoverage: number
  keywordAlignment: number
  confidenceAdjustedScore: number
  strengthAreas: string[]
  gapAreas: string[]
  scoringWarnings: string[]
  rankingRationale: string
  evaluationConsistency: 'low' | 'medium' | 'high'
  scoreConfidence: number
  manualReviewRecommended: boolean
}

const AGGREGATOR_FALLBACK: AggregatedScore = {
  skillsScore: 50, compositeScore: 50, recommendation: 'consider', rankLabel: 'Consider',
  breakdown: { skills: 50, technical: 50, culture: 50 },
  requiredSkillCoverage: 50, preferredSkillCoverage: 50, keywordAlignment: 50,
  confidenceAdjustedScore: 50, strengthAreas: [], gapAreas: [], scoringWarnings: ['parsing failed'],
  rankingRationale: '', evaluationConsistency: 'low', scoreConfidence: 40, manualReviewRecommended: true,
}

export async function runEvaluationAggregator(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  technicalScore: number,
  cultureScore: number,
  weights?: { skills: number; technical: number; culture: number },
): Promise<WithMeta<AggregatedScore>> {
  const w = weights ?? blueprint.priorityWeights ?? { skills: 40, technical: 35, culture: 25 }

  const prompt = `${SYSTEM_PROMPT}

--- CANDIDATE SKILLS ---
Skills: ${profile.skills.join(', ')}
Seniority: ${profile.candidateSeniority}
Experience Years: ${profile.experienceYears}

--- JOB SKILL REQUIREMENTS ---
Required Skills: ${blueprint.requiredSkills.join(', ')}
Preferred Skills: ${blueprint.preferredSkills.join(', ')}
Must-Have Keywords: ${blueprint.mustHaveKeywords.join(', ')}
Deal Breakers: ${blueprint.dealBreakers.join(', ')}
Technical Depth Expected: ${blueprint.technicalDepth}

--- UPSTREAM AGENT SCORES ---
Technical Depth Score: ${technicalScore} / 100
Culture Fit Score: ${cultureScore} / 100

--- SCORING WEIGHTS ---
Skills Weight: ${w.skills}%
Technical Weight: ${w.technical}%
Culture Weight: ${w.culture}%

--- COMPOSITE FORMULA ---
compositeScore = (skillsScore × ${w.skills / 100}) + (${technicalScore} × ${w.technical / 100}) + (${cultureScore} × ${w.culture / 100})

--- RECOMMENDATION THRESHOLDS ---
90–100 → strong_hire / "Strong Hire"
65–89  → consider / "Consider"
0–64   → not_recommended / "Not Recommended"`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: AGGREGATOR_SCHEMA as unknown,
    },
  })

  let rawResult: AggregatedScore
  try { rawResult = JSON.parse(response.text ?? '{}') as AggregatedScore }
  catch { rawResult = { ...AGGREGATOR_FALLBACK } }
  const meta: AgentMeta = {
    confidenceScore: rawResult.scoreConfidence ?? 50,
    evidenceQuality: rawResult.evaluationConsistency as 'high' | 'medium' | 'low',
    reasoningSummary: `Composite score: ${rawResult.compositeScore}/100. Recommendation: ${rawResult.rankLabel}.`,
    missingEvidence: rawResult.gapAreas ?? [],
    warnings: rawResult.scoringWarnings ?? [],
  }
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: false, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

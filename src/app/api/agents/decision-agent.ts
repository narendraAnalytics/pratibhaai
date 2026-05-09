import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'
import type { AggregatedScore } from './evaluation-aggregator'
import type { RiskReport } from './verification-risk'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export interface DecisionResult {
  recommendation: 'strong_hire' | 'consider' | 'not_recommended'
  whyHire: string[]
  concerns: string[]
  interviewQuestions: string[]
  overallSummary: string
}

export async function runDecisionAgent(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  aggregated: AggregatedScore,
  risk: RiskReport,
): Promise<DecisionResult> {
  const prompt = `You are the Decision Agent for Pratibha AI, an autonomous recruitment platform.

You are the final reasoning layer in the pipeline. All other agents have already run and produced structured scores. Your job is to synthesize their findings into a clear, explainable hiring recommendation that a hiring manager can act on.

--- CANDIDATE SUMMARY ---
Name: ${profile.name}
Current Role: ${profile.currentRole}
Experience: ${profile.experienceYears} years
Skills: ${profile.skills.join(', ')}
Education: ${profile.education.join(', ')}

--- AGGREGATE SCORES ---
Skills Match Score: ${aggregated.breakdown.skills}/100
Technical Depth Score: ${aggregated.breakdown.technical}/100
Culture Fit Score: ${aggregated.breakdown.culture}/100
Composite Score: ${aggregated.compositeScore}/100
Score Tier: ${aggregated.rankLabel}

--- RISK REPORT ---
Risk Level: ${risk.riskLevel}
Overall Risk Score: ${risk.overallRisk}/100
Flags: ${risk.flags.length > 0 ? risk.flags.join('; ') : 'None'}
Inflation Signs: ${risk.inflationSigns.length > 0 ? risk.inflationSigns.join('; ') : 'None'}
Timeline Issues: ${risk.timelineIssues.length > 0 ? risk.timelineIssues.join('; ') : 'None'}

--- JOB REQUIREMENTS ---
Required Skills: ${blueprint.requiredSkills.join(', ')}
Seniority Signals Expected: ${blueprint.senioritySignals.join(', ')}
Deal Breakers: ${blueprint.dealBreakers.join(', ')}
Technical Depth: ${blueprint.technicalDepth}

--- YOUR TASK ---
Based on all the above, produce the final hiring decision:

1. recommendation — must be one of: "strong_hire", "consider", "not_recommended"
   - Use the composite score as the primary signal (90+ = strong_hire, 65–89 = consider, 0–64 = not_recommended)
   - Downgrade the recommendation if risk is "high" or deal breakers are violated
   - Upgrade only if there are exceptional signals that the scores may have underweighted

2. whyHire — 3 to 5 specific, evidence-based reasons this candidate is a good fit. Be concrete, reference their actual background.

3. concerns — 2 to 4 honest concerns or gaps. If the resume is clean and scores are high, note minor gaps only. Never fabricate concerns.

4. interviewQuestions — exactly 3 targeted interview questions based on this candidate's specific gaps, risks, or areas to probe deeper. Make them specific to this person, not generic.

5. overallSummary — 2–3 sentences. A concise, direct summary a hiring manager would read first. Mention the composite score, the recommendation, and the single most important reason.

Return ONLY valid JSON — no markdown, no explanation, no extra text:
{
  "recommendation": "consider",
  "whyHire": [
    "5 years of production TypeScript experience directly matching required skills",
    "Led 3 cross-functional product launches — strong ownership signal for a senior role"
  ],
  "concerns": [
    "No public GitHub activity — technical depth unverified beyond resume claims",
    "Frequent company switches (4 in 5 years) may indicate low retention risk"
  ],
  "interviewQuestions": [
    "Walk me through a system you designed end-to-end — what were the hardest trade-offs?",
    "You've changed companies frequently — what would make you stay for 3+ years here?",
    "Your resume mentions leading a team of 12 — describe your management style and a conflict you resolved."
  ],
  "overallSummary": "Strong technical profile with a composite score of 74/100, placing this candidate in the Consider tier. Solid skills alignment and leadership indicators are offset by unverified GitHub activity and a high job-change frequency worth probing."
}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '{}'
  return extractJSON(text) as unknown as DecisionResult
}

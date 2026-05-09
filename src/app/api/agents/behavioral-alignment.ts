import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

const SYSTEM_PROMPT = `You are the Behavioral Alignment Agent for Pratibha AI, an enterprise-grade autonomous recruitment platform.

You are responsible for evaluating professional behavioral alignment using:
- resume evidence
- career progression signals
- leadership indicators
- collaboration indicators
- ownership patterns
- work-style evidence

You are NOT a recruiter.
You are NOT a hiring decision maker.
You do NOT rank candidates.
You do NOT perform psychological profiling.
You do NOT infer protected characteristics.

Your responsibility is ONLY to:
- analyze observable professional behavioral signals
- assess culture and work-style alignment
- identify leadership and collaboration evidence
- evaluate communication-related professional indicators
- detect potential behavioral mismatches based on explicit evidence

━━━━━━━━━━━━━━━━━━━━
CORE EVALUATION PRINCIPLES
━━━━━━━━━━━━━━━━━━━━

You must follow these principles strictly:

- Be evidence-based
- Be conservative
- Avoid speculation
- Never hallucinate behavioral traits
- Never infer personality disorders
- Never infer emotional state
- Never infer protected characteristics
- Only evaluate professional behavior evidence explicitly present in the resume

All findings must be:
- factual
- professionally worded
- concise
- evidence-supported

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
- introversion/extroversion
- emotional stability
- intelligence level

You are NOT a psychological assessment system.

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must analyze:

1. Leadership Signals
2. Ownership Indicators
3. Collaboration Evidence
4. Career Progression
5. Professional Communication Signals
6. Adaptability Indicators
7. Work-Style Alignment
8. Team Environment Compatibility
9. Professional Stability Signals
10. Culture Alignment

━━━━━━━━━━━━━━━━━━━━
LEADERSHIP ANALYSIS RULES
━━━━━━━━━━━━━━━━━━━━

Look for explicit evidence such as:
- team leadership
- mentoring
- project ownership
- cross-functional coordination
- stakeholder management
- architecture ownership
- strategic responsibilities
- promotion progression

Do NOT assume leadership capability without evidence.

━━━━━━━━━━━━━━━━━━━━
COLLABORATION ANALYSIS RULES
━━━━━━━━━━━━━━━━━━━━

Evaluate:
- cross-team collaboration
- communication-oriented project work
- stakeholder interaction
- collaborative project descriptions
- mentoring or coaching references

Only use explicit evidence from:
- responsibilities
- achievements
- project descriptions
- career progression

━━━━━━━━━━━━━━━━━━━━
CAREER PROGRESSION ANALYSIS
━━━━━━━━━━━━━━━━━━━━

Analyze:
- increasing responsibility
- title progression
- ownership growth
- domain specialization growth
- leadership expansion

Do NOT automatically penalize:
- startup movement
- consulting careers
- contract work
- non-traditional career paths
- career gaps without context

Frequent role changes alone are NOT sufficient evidence of poor alignment.

━━━━━━━━━━━━━━━━━━━━
COMMUNICATION STYLE RULES
━━━━━━━━━━━━━━━━━━━━

Communication analysis must ONLY be inferred from:
- resume wording
- project descriptions
- leadership descriptions
- collaboration evidence
- professional writing tone

Do NOT infer:
- personality
- emotional traits
- charisma
- social ability

Use professional descriptors only such as:
- structured
- collaborative
- execution-focused
- stakeholder-oriented
- technically concise
- metrics-driven

━━━━━━━━━━━━━━━━━━━━
CULTURE ALIGNMENT RULES
━━━━━━━━━━━━━━━━━━━━

Compare observable candidate evidence against:
- culture keywords
- work-style expectations
- leadership expectations
- collaboration expectations

Examples:
- startup environments
- enterprise environments
- remote-first collaboration
- fast-paced execution
- ownership-heavy cultures

Do NOT assume culture fit without supporting evidence.

━━━━━━━━━━━━━━━━━━━━
SCORING GUIDELINES
━━━━━━━━━━━━━━━━━━━━

0–30:
- major alignment concerns
- limited collaboration evidence
- weak professional behavioral signals

31–60:
- partial alignment
- moderate evidence
- some uncertainty

61–80:
- strong alignment
- good collaboration and ownership signals
- healthy progression indicators

81–100:
- exceptional leadership and ownership evidence
- highly aligned work-style indicators
- strong communication and collaboration signals

━━━━━━━━━━━━━━━━━━━━
CONFIDENCE RULES
━━━━━━━━━━━━━━━━━━━━

Behavioral confidence should decrease when:
- resume detail is sparse
- leadership evidence is unclear
- collaboration evidence is limited
- chronology is incomplete
- responsibilities are vague

High confidence requires:
- detailed accomplishments
- explicit leadership evidence
- clear communication indicators
- strong progression evidence

━━━━━━━━━━━━━━━━━━━━
MANUAL REVIEW RULES
━━━━━━━━━━━━━━━━━━━━

Recommend manual review when:
- evidence is insufficient
- behavioral signals are ambiguous
- leadership expectations are unclear
- work-style alignment cannot be confidently determined

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

const BEHAVIORAL_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number' },
    leadershipSignals: { type: 'array', items: { type: 'string' } },
    collaborationSignals: { type: 'array', items: { type: 'string' } },
    ownershipSignals: { type: 'array', items: { type: 'string' } },
    adaptabilitySignals: { type: 'array', items: { type: 'string' } },
    strengths: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    careerProgressionAssessment: { type: 'string' },
    communicationStyle: { type: 'string' },
    cultureAlignmentSummary: { type: 'string' },
    workStyleIndicators: {
      type: 'object',
      properties: {
        autonomy: { type: 'string', enum: ['low', 'medium', 'high'] },
        collaboration: { type: 'string', enum: ['low', 'medium', 'high'] },
        leadership: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['autonomy', 'collaboration', 'leadership'],
    },
    workEnvironmentFit: { type: 'array', items: { type: 'string' } },
    behavioralConfidence: { type: 'number' },
    manualReviewRecommended: { type: 'boolean' },
  },
  required: [
    'score', 'leadershipSignals', 'collaborationSignals', 'ownershipSignals', 'adaptabilitySignals',
    'strengths', 'concerns', 'careerProgressionAssessment', 'communicationStyle',
    'cultureAlignmentSummary', 'workStyleIndicators', 'workEnvironmentFit',
    'behavioralConfidence', 'manualReviewRecommended',
  ],
}

export interface BehavioralAlignmentResult {
  // ── Existing fields (backward compat — used by evaluation-aggregator + report-generator) ──
  score: number
  strengths: string[]
  concerns: string[]
  communicationStyle: string

  // ── Behavioral intelligence ────────────────────────────────────────────────────────────────
  leadershipSignals: string[]
  collaborationSignals: string[]
  ownershipSignals: string[]
  adaptabilitySignals: string[]
  careerProgressionAssessment: string
  cultureAlignmentSummary: string
  workStyleIndicators: {
    autonomy: 'low' | 'medium' | 'high'
    collaboration: 'low' | 'medium' | 'high'
    leadership: 'low' | 'medium' | 'high'
  }
  workEnvironmentFit: string[]
  behavioralConfidence: number
  manualReviewRecommended: boolean
}

export async function runBehavioralAlignment(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  resumeText: string,
): Promise<BehavioralAlignmentResult> {
  const prompt = `${SYSTEM_PROMPT}

--- CANDIDATE PROFILE ---
Name: ${profile.name}
Current Role: ${profile.currentRole}
Seniority: ${profile.candidateSeniority}
Experience: ${profile.experienceYears} years
Summary: ${profile.summary}
Companies: ${profile.companies.join(', ')}
Leadership Experience: ${profile.careerSignals.leadershipExperience}
Startup Experience: ${profile.careerSignals.startupExperience}
Enterprise Experience: ${profile.careerSignals.enterpriseExperience}
Frequent Job Changes: ${profile.careerSignals.frequentJobChanges}

--- CULTURE & BEHAVIOR EXPECTATIONS ---
Culture Keywords: ${blueprint.cultureKeywords.join(', ')}
Seniority Signals: ${blueprint.senioritySignals.join(', ')}
Leadership Required: ${blueprint.leadershipRequired}
Client-Facing Role: ${blueprint.clientFacingRole}
Communication Importance: ${blueprint.communicationImportance}
Role Archetype: ${blueprint.roleArchetype}

--- RESUME CONTENT (first 3000 characters) ---
${resumeText.slice(0, 3000)}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: BEHAVIORAL_SCHEMA as unknown,
    },
  })

  return JSON.parse(response.text ?? '{}') as BehavioralAlignmentResult
}

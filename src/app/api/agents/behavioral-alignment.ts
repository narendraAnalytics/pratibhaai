import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY!, apiVersion: 'v1alpha' })

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
WORK-STYLE INTELLIGENCE LAYER
━━━━━━━━━━━━━━━━━━━━

LEARNING AGILITY SIGNALS — detect from career history and project descriptions:
- continuousLearningEvidence: true if certifications, courses, new tech adoption mentioned across career
- roleEvolutionEvidence: true if each role shows expanded scope, new domains, or different tech stack
- crossDomainAdaptability: true if candidate moved across different product/industry domains successfully
- modernTechnologyAdoption: true if evidence of adopting AI tools, LLMs, or 2024+ technologies in work

AI WORK READINESS — detect from skills, projects, role descriptions:
- aiToolingExposure: true if GitHub Copilot, ChatGPT, AI-assisted coding, LLM tools mentioned in work context
- automationCollaborationSignals: true if workflow automation, AI pipelines, or agentic tools referenced
- adaptabilityToAIWorkflows: 'high' if actively building/using AI; 'medium' if aware and experimenting; 'low' if no evidence

LEADERSHIP ASSESSMENT:
- leadershipDepth: 'high' = managed teams with strategic ownership (OKRs, hiring, roadmap); 'medium' = tech lead/IC leadership with cross-team impact; 'low' = individual contributor only
- mentoringEvidence: true if junior mentoring, pair programming, knowledge sharing, code review leadership mentioned
- strategicOwnershipEvidence: true if product strategy, architectural decisions, or business-level ownership described
- stakeholderManagementEvidence: true if executive stakeholders, cross-org coordination, or client relationships mentioned

CAREER TRAJECTORY:
- progressionStrength (0–100): 90+ = consistent upward growth with expanded scope each role; 50 = lateral/stable; 20 = declining or unclear
- responsibilityGrowth: true if each successive role shows measurably more ownership than previous
- domainExpansion: true if candidate successfully expanded into new technical or business domains across career

TEAM DYNAMICS INDICATORS:
- crossFunctionalExposure: true if worked across product/design/data/business teams explicitly
- distributedTeamExperience: true if remote teams, global collaboration, async communication mentioned
- clientFacingCollaboration: true if client meetings, customer discovery, partner communication, or sales support mentioned

BEHAVIORAL INTERVIEW FOCUS — flag where live interview evidence is needed:
- leadershipClarificationNeeded: true if leadership claimed but supporting detail is thin or vague
- collaborationValidationNeeded: true if collaboration signals are present but non-specific
- adaptabilityValidationNeeded: true if adaptability signals are absent or candidate history shows very narrow focus

ENVIRONMENT FIT CONFIDENCE (0–100 per environment):
- startupFit: 80+ if startup experience + high autonomy + ownership signals + generalist evidence
- enterpriseFit: 80+ if large company experience + process adherence + cross-functional coordination
- remoteFit: 80+ if remote work mentioned, async communication, distributed team experience
- fastPacedFit: 80+ if short delivery cycles, multiple simultaneous projects, startup/agency background

EVIDENCE CONFIDENCE (0–100 per behavioral domain):
- leadershipEvidence: 100 = explicit team size, title progression, and strategic decisions; 0 = claimed but no detail
- collaborationEvidence: 100 = multiple cross-team projects with named collaborators or outcomes; 0 = vague mentions
- communicationEvidence: 100 = stakeholder reports, presentation evidence, documentation ownership; 0 = absent
- ownershipEvidence: 100 = end-to-end product/feature ownership with measurable outcomes; 0 = task execution only

EXECUTION SIGNALS:
- longTermOwnershipEvidence: true if candidate stayed 18+ months in a role with growing responsibilities
- deliveryConsistencyEvidence: true if shipped projects, launched products, or delivered measurable outcomes mentioned
- initiativeTakingEvidence: true if "led", "initiated", "proposed", "created from scratch", "drove adoption" type language with real context

SEMANTIC CULTURE PROFILE — assign 1–4 culture archetypes from this list based on evidence:
- 'execution-driven': focus on delivery, metrics, velocity, shipping
- 'innovation-heavy': R&D, new products, experimentation, ideation
- 'research-oriented': depth over breadth, publications, exploration
- 'process-oriented': documentation, standards, reliability, compliance
- 'customer-facing': client relations, user empathy, market feedback
- 'ownership-heavy': autonomous decisions, product thinking, full-stack responsibility
- 'collaboration-first': team building, consensus, cross-functional coordination
Only assign archetypes with strong supporting evidence. Leave empty if insufficient evidence.

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
    learningAgilitySignals: {
      type: 'object',
      properties: {
        continuousLearningEvidence: { type: 'boolean' },
        roleEvolutionEvidence: { type: 'boolean' },
        crossDomainAdaptability: { type: 'boolean' },
        modernTechnologyAdoption: { type: 'boolean' },
      },
    },
    aiWorkReadiness: {
      type: 'object',
      properties: {
        aiToolingExposure: { type: 'boolean' },
        automationCollaborationSignals: { type: 'boolean' },
        adaptabilityToAIWorkflows: { type: 'string' },
      },
    },
    leadershipAssessment: {
      type: 'object',
      properties: {
        leadershipDepth: { type: 'string' },
        mentoringEvidence: { type: 'boolean' },
        strategicOwnershipEvidence: { type: 'boolean' },
        stakeholderManagementEvidence: { type: 'boolean' },
      },
    },
    careerTrajectory: {
      type: 'object',
      properties: {
        progressionStrength: { type: 'number' },
        responsibilityGrowth: { type: 'boolean' },
        domainExpansion: { type: 'boolean' },
      },
    },
    teamDynamicsIndicators: {
      type: 'object',
      properties: {
        crossFunctionalExposure: { type: 'boolean' },
        distributedTeamExperience: { type: 'boolean' },
        clientFacingCollaboration: { type: 'boolean' },
      },
    },
    behavioralInterviewFocus: {
      type: 'object',
      properties: {
        leadershipClarificationNeeded: { type: 'boolean' },
        collaborationValidationNeeded: { type: 'boolean' },
        adaptabilityValidationNeeded: { type: 'boolean' },
      },
    },
    environmentFitConfidence: {
      type: 'object',
      properties: {
        startupFit: { type: 'number' },
        enterpriseFit: { type: 'number' },
        remoteFit: { type: 'number' },
        fastPacedFit: { type: 'number' },
      },
    },
    evidenceConfidence: {
      type: 'object',
      properties: {
        leadershipEvidence: { type: 'number' },
        collaborationEvidence: { type: 'number' },
        communicationEvidence: { type: 'number' },
        ownershipEvidence: { type: 'number' },
      },
    },
    executionSignals: {
      type: 'object',
      properties: {
        longTermOwnershipEvidence: { type: 'boolean' },
        deliveryConsistencyEvidence: { type: 'boolean' },
        initiativeTakingEvidence: { type: 'boolean' },
      },
    },
    semanticCultureProfile: { type: 'array', items: { type: 'string' } },
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

  // ── Work-Style Intelligence Layer ─────────────────────────────────
  learningAgilitySignals: {
    continuousLearningEvidence: boolean
    roleEvolutionEvidence: boolean
    crossDomainAdaptability: boolean
    modernTechnologyAdoption: boolean
  }
  aiWorkReadiness: {
    aiToolingExposure: boolean
    automationCollaborationSignals: boolean
    adaptabilityToAIWorkflows: 'low' | 'medium' | 'high'
  }
  leadershipAssessment: {
    leadershipDepth: 'low' | 'medium' | 'high'
    mentoringEvidence: boolean
    strategicOwnershipEvidence: boolean
    stakeholderManagementEvidence: boolean
  }
  careerTrajectory: {
    progressionStrength: number
    responsibilityGrowth: boolean
    domainExpansion: boolean
  }
  teamDynamicsIndicators: {
    crossFunctionalExposure: boolean
    distributedTeamExperience: boolean
    clientFacingCollaboration: boolean
  }
  behavioralInterviewFocus: {
    leadershipClarificationNeeded: boolean
    collaborationValidationNeeded: boolean
    adaptabilityValidationNeeded: boolean
  }
  environmentFitConfidence: {
    startupFit: number
    enterpriseFit: number
    remoteFit: number
    fastPacedFit: number
  }
  evidenceConfidence: {
    leadershipEvidence: number
    collaborationEvidence: number
    communicationEvidence: number
    ownershipEvidence: number
  }
  executionSignals: {
    longTermOwnershipEvidence: boolean
    deliveryConsistencyEvidence: boolean
    initiativeTakingEvidence: boolean
  }
  semanticCultureProfile: string[]
}

const BEHAVIORAL_FALLBACK: BehavioralAlignmentResult = {
  score: 50, leadershipSignals: [], collaborationSignals: [], ownershipSignals: [], adaptabilitySignals: [],
  strengths: [], concerns: ['parsing failed'],
  careerProgressionAssessment: '', communicationStyle: '', cultureAlignmentSummary: '',
  workStyleIndicators: { autonomy: 'medium', collaboration: 'medium', leadership: 'low' },
  workEnvironmentFit: [], behavioralConfidence: 40, manualReviewRecommended: true,
  learningAgilitySignals: { continuousLearningEvidence: false, roleEvolutionEvidence: false, crossDomainAdaptability: false, modernTechnologyAdoption: false },
  aiWorkReadiness: { aiToolingExposure: false, automationCollaborationSignals: false, adaptabilityToAIWorkflows: 'low' },
  leadershipAssessment: { leadershipDepth: 'low', mentoringEvidence: false, strategicOwnershipEvidence: false, stakeholderManagementEvidence: false },
  careerTrajectory: { progressionStrength: 50, responsibilityGrowth: false, domainExpansion: false },
  teamDynamicsIndicators: { crossFunctionalExposure: false, distributedTeamExperience: false, clientFacingCollaboration: false },
  behavioralInterviewFocus: { leadershipClarificationNeeded: true, collaborationValidationNeeded: true, adaptabilityValidationNeeded: true },
  environmentFitConfidence: { startupFit: 50, enterpriseFit: 50, remoteFit: 50, fastPacedFit: 50 },
  evidenceConfidence: { leadershipEvidence: 0, collaborationEvidence: 0, communicationEvidence: 0, ownershipEvidence: 0 },
  executionSignals: { longTermOwnershipEvidence: false, deliveryConsistencyEvidence: false, initiativeTakingEvidence: false },
  semanticCultureProfile: [],
}

export async function runBehavioralAlignment(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  resumeText: string,
): Promise<WithMeta<BehavioralAlignmentResult>> {
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

  let rawResult: BehavioralAlignmentResult
  try { rawResult = JSON.parse(response.text ?? '{}') as BehavioralAlignmentResult }
  catch { rawResult = { ...BEHAVIORAL_FALLBACK } }
  const bc = rawResult.behavioralConfidence ?? 50
  const meta: AgentMeta = {
    confidenceScore: bc,
    evidenceQuality: bc >= 70 ? 'high' : bc >= 40 ? 'medium' : 'low',
    reasoningSummary: `Behavioral score: ${rawResult.score}/100. Communication: ${rawResult.communicationStyle}.`,
    missingEvidence: [],
    warnings: rawResult.concerns ?? [],
  }
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: false, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

import { GoogleGenAI } from '@google/genai'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY!, apiVersion: 'v1alpha' })

export interface HiringBlueprint {
  // Core extraction (existing fields — used by all downstream agents)
  requiredSkills: string[]
  preferredSkills: string[]
  mustHaveKeywords: string[]
  dealBreakers: string[]
  senioritySignals: string[]
  technicalDepth: 'low' | 'medium' | 'high'
  cultureKeywords: string[]

  // Role intelligence (new)
  roleArchetype: 'builder' | 'maintainer' | 'researcher' | 'leadership' | 'execution' | 'platform-engineering' | 'client-facing'
  minimumExperienceYears: number
  preferredExperienceYears: number
  leadershipRequired: boolean
  clientFacingRole: boolean

  // Signal importance weights (new)
  githubImportance: 'low' | 'medium' | 'high'
  portfolioImportance: 'low' | 'medium' | 'high'
  communicationImportance: 'low' | 'medium' | 'high'
  educationImportance: 'low' | 'medium' | 'high'

  // Scoring weights — used by evaluation aggregator (new)
  priorityWeights: { skills: number; technical: number; culture: number }

  // Downstream evaluation guidance (new)
  evaluationGuidance: {
    prioritizeGithub: boolean
    prioritizeLeadership: boolean
    prioritizeStability: boolean
    prioritizeEducation: boolean
  }

  // JD quality / ambiguity detection (new)
  ambiguityFlags: string[]
  missingCriticalInfo: string[]
  jobDescriptionQuality: 'low' | 'medium' | 'high'
  planningConfidence: number
  riskSensitivity: 'low' | 'medium' | 'high'

  // Semantic intelligence layer
  inferredSkills: string[]
  skillSynonyms: Record<string, string[]>
  hiringRiskFlags: string[]
  recommendedAssessments: string[]
  recruiterRecommendations: string[]
  proofOfWorkRequirements: {
    githubRequired: boolean
    liveProjectsRequired: boolean
    openSourceValuable: boolean
    certificationsValuable: boolean
  }
  aiLiteracyRequirements: {
    required: boolean
    level: 'none' | 'basic' | 'working' | 'advanced'
  }
  complianceSensitivity: {
    fairnessRisk: 'low' | 'medium' | 'high'
    humanReviewMandatory: boolean
  }
}

const JOB_INTEL_FALLBACK: HiringBlueprint = {
  requiredSkills: [], preferredSkills: [], mustHaveKeywords: [], dealBreakers: [],
  senioritySignals: [], technicalDepth: 'medium', cultureKeywords: [],
  roleArchetype: 'builder', minimumExperienceYears: 0, preferredExperienceYears: 2,
  leadershipRequired: false, clientFacingRole: false,
  githubImportance: 'medium', portfolioImportance: 'medium',
  communicationImportance: 'medium', educationImportance: 'low',
  priorityWeights: { skills: 40, technical: 35, culture: 25 },
  evaluationGuidance: { prioritizeGithub: false, prioritizeLeadership: false, prioritizeStability: false, prioritizeEducation: false },
  ambiguityFlags: ['parsing failed'], missingCriticalInfo: ['job description could not be parsed'],
  jobDescriptionQuality: 'low', planningConfidence: 50, riskSensitivity: 'medium',
  inferredSkills: [],
  skillSynonyms: {},
  hiringRiskFlags: ['parsing failed — risk analysis unavailable'],
  recommendedAssessments: ['general technical interview'],
  recruiterRecommendations: ['verify job description quality before proceeding'],
  proofOfWorkRequirements: { githubRequired: false, liveProjectsRequired: false, openSourceValuable: false, certificationsValuable: false },
  aiLiteracyRequirements: { required: false, level: 'none' },
  complianceSensitivity: { fairnessRisk: 'medium', humanReviewMandatory: false },
}

export async function runJobIntelligence(job: {
  title: string
  department?: string | null
  description: string
  skills?: string[] | null
  locationType?: string | null
  jobType?: string | null
  experienceLevel?: string | null
}): Promise<WithMeta<HiringBlueprint>> {
  const prompt = `You are the Job Intelligence Agent for Pratibha AI, an autonomous enterprise-grade recruitment platform.

You are responsible for transforming raw job descriptions into structured hiring intelligence that downstream agents will use to evaluate candidates.

You are NOT a recruiter.
You are NOT a hiring decision maker.
You do NOT evaluate candidates.
You ONLY analyze the job requirements and generate a structured Hiring Blueprint.

Your output directly affects:
- candidate scoring
- technical validation
- culture-fit analysis
- risk detection
- final ranking decisions

Accuracy, consistency, and conservative reasoning are critical.

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must:
1. Analyze the complete job description
2. Extract explicit technical requirements
3. Infer implicit hiring expectations
4. Identify required vs preferred qualifications
5. Detect seniority expectations and experience thresholds
6. Determine technical complexity
7. Infer culture and work-style expectations
8. Detect ambiguity or missing hiring information
9. Configure downstream evaluation priorities
10. Return deterministic structured JSON

━━━━━━━━━━━━━━━━━━━━
EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━

- Prefer conservative extraction — when in doubt, leave out
- Never hallucinate technologies, requirements, or certifications
- Never invent qualifications not implied by the JD
- Only infer information strongly implied by the context
- Distinguish clearly between mandatory and optional requirements

If the JD is vague or incomplete:
- flag ambiguity in ambiguityFlags
- identify missing critical information in missingCriticalInfo
- set jobDescriptionQuality to 'low' and planningConfidence below 70

━━━━━━━━━━━━━━━━━━━━
ROLE ARCHETYPE INFERENCE
━━━━━━━━━━━━━━━━━━━━

Infer the dominant archetype from strong JD evidence only:
- builder — new product/feature development, startup-style
- maintainer — legacy systems, stability, ops-heavy
- researcher — R&D, ML/AI research, publications
- leadership — team lead, manager, director, head-of
- execution — delivery-focused, process-driven
- platform-engineering — infra, DevOps, SRE, cloud
- client-facing — customer success, sales engineering, solutions

━━━━━━━━━━━━━━━━━━━━
TECHNICAL DEPTH GUIDELINES
━━━━━━━━━━━━━━━━━━━━

LOW: junior/internship, basic CRUD, limited architecture ownership
MEDIUM: independent feature ownership, moderate production exposure, framework expertise
HIGH: system design, scalability, distributed systems, AI/ML, architecture leadership

━━━━━━━━━━━━━━━━━━━━
SCORING WEIGHT GUIDELINES
━━━━━━━━━━━━━━━━━━━━

skills + technical + culture must always sum to 100.

Senior Engineer / Architect / ML / Data / Platform roles:
  skills: 30, technical: 50, culture: 20

Management / Leadership / HR / Operations / Client-facing roles:
  skills: 35, technical: 25, culture: 40

Standard / Mid-level / Full-stack / Execution roles:
  skills: 40, technical: 35, culture: 25

━━━━━━━━━━━━━━━━━━━━
DOWNSTREAM EVALUATION GUIDANCE
━━━━━━━━━━━━━━━━━━━━

Set evaluationGuidance flags based on role evidence:
- prioritizeGithub: true when technical depth is high or role is builder/platform-engineering
- prioritizeLeadership: true when role is leadership or leadershipRequired
- prioritizeStability: true when role is maintainer or riskSensitivity is high
- prioritizeEducation: true when JD explicitly requires degree or certification

riskSensitivity: set to 'high' for fintech, healthcare, government, security-critical roles

━━━━━━━━━━━━━━━━━━━━
SEMANTIC INTELLIGENCE LAYER
━━━━━━━━━━━━━━━━━━━━

INFERRED SKILLS — extract skills strongly implied by context even if not listed:
- "build scalable APIs" → system design, scalability engineering, backend architecture
- "optimize distributed systems" → distributed computing, cloud-native engineering
- "lead cross-functional teams" → stakeholder management, program management
- "ship ML models to production" → MLOps, model serving, LLMOps
Only infer when evidence is strong. Do not hallucinate.

SKILL SYNONYMS — map canonical skill names to common equivalents found in resumes:
- "Node.js" → ["Backend JavaScript", "Express.js", "NestJS"]
- "React" → ["ReactJS", "React.js", "Frontend JavaScript"]
- "LLMOps" → ["GenAI Infrastructure", "AI Deployment", "ML Platform"]
Only include synonyms for skills actually present in requiredSkills or preferredSkills.

HIRING RISK FLAGS — detect problems in the JD:
- "unrealistic experience expectations" — e.g. 5+ years for a 3-year-old technology
- "too many required skills" — more than 10 hard requirements
- "contradictory requirements" — e.g. senior IC + people management simultaneously
- "under-scoped senior role" — senior title but junior-level responsibilities
- "vague success metrics" — no measurable outcomes defined
- "unclear ownership" — no team size, reporting structure, or scope mentioned
Leave empty array if JD is well-written.

RECOMMENDED ASSESSMENTS — based on technicalDepth and roleArchetype:
- HIGH technical depth → "system design interview", "architecture discussion"
- builder/platform-engineering → "live coding challenge", "code review exercise"
- ML/AI roles → "ML case study", "model evaluation exercise"
- leadership → "leadership panel", "people management scenario"
- client-facing → "communication assessment", "stakeholder scenario"
Always include at least one relevant assessment.

PROOF OF WORK:
- githubRequired: true when technicalDepth is 'high' OR githubImportance is 'high'
- liveProjectsRequired: true when portfolioImportance is 'high'
- openSourceValuable: true when roleArchetype is 'builder' or 'platform-engineering'
- certificationsValuable: true when educationImportance is 'high' or compliance domain detected

AI LITERACY — set required: true when JD mentions AI tools, LLMs, Copilot, automation, or GenAI workflows.
Level: 'basic' for general awareness, 'working' for daily AI tool use, 'advanced' for building AI systems.

COMPLIANCE SENSITIVITY:
- fairnessRisk: 'high' for fintech, healthcare, government, HR tech, lending, insurance
- fairnessRisk: 'medium' for enterprise B2B, legal, education
- humanReviewMandatory: true when fairnessRisk is 'high'

RECRUITER RECOMMENDATIONS — actionable guidance derived from JD weaknesses:
- "JD lists more than 10 required skills — consider reducing to top 5 must-haves"
- "Experience requirement may be unrealistic for this skill set"
- "Add measurable success criteria to improve candidate alignment"
- "Clarify team size and reporting structure"
- "Consider lowering experience threshold to widen qualified candidate pool"
Leave empty array if JD is well-written.

━━━━━━━━━━━━━━━━━━━━
JOB CONTEXT
━━━━━━━━━━━━━━━━━━━━

Title: ${job.title}
Department: ${job.department ?? 'Not specified'}
Location Type: ${job.locationType ?? 'Not specified'}
Job Type: ${job.jobType ?? 'Not specified'}
Experience Level: ${job.experienceLevel ?? 'Not specified'}
Skills Listed: ${job.skills?.join(', ') ?? 'Not specified'}
Full Description:
${job.description}

━━━━━━━━━━━━━━━━━━━━
OUTPUT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON. No markdown, no explanations, no code blocks.
The JSON must be deterministic, machine-readable, and schema-safe.`

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          requiredSkills: { type: 'array', items: { type: 'string' } },
          preferredSkills: { type: 'array', items: { type: 'string' } },
          mustHaveKeywords: { type: 'array', items: { type: 'string' } },
          dealBreakers: { type: 'array', items: { type: 'string' } },
          senioritySignals: { type: 'array', items: { type: 'string' } },
          technicalDepth: { type: 'string' },
          cultureKeywords: { type: 'array', items: { type: 'string' } },
          roleArchetype: { type: 'string' },
          minimumExperienceYears: { type: 'number' },
          preferredExperienceYears: { type: 'number' },
          leadershipRequired: { type: 'boolean' },
          clientFacingRole: { type: 'boolean' },
          githubImportance: { type: 'string' },
          portfolioImportance: { type: 'string' },
          communicationImportance: { type: 'string' },
          educationImportance: { type: 'string' },
          priorityWeights: {
            type: 'object',
            properties: {
              skills: { type: 'number' },
              technical: { type: 'number' },
              culture: { type: 'number' },
            },
          },
          evaluationGuidance: {
            type: 'object',
            properties: {
              prioritizeGithub: { type: 'boolean' },
              prioritizeLeadership: { type: 'boolean' },
              prioritizeStability: { type: 'boolean' },
              prioritizeEducation: { type: 'boolean' },
            },
          },
          ambiguityFlags: { type: 'array', items: { type: 'string' } },
          missingCriticalInfo: { type: 'array', items: { type: 'string' } },
          jobDescriptionQuality: { type: 'string' },
          planningConfidence: { type: 'number' },
          riskSensitivity: { type: 'string' },
          inferredSkills: { type: 'array', items: { type: 'string' } },
          skillSynonyms: {
            type: 'object',
            additionalProperties: { type: 'array', items: { type: 'string' } },
          },
          hiringRiskFlags: { type: 'array', items: { type: 'string' } },
          recommendedAssessments: { type: 'array', items: { type: 'string' } },
          recruiterRecommendations: { type: 'array', items: { type: 'string' } },
          proofOfWorkRequirements: {
            type: 'object',
            properties: {
              githubRequired: { type: 'boolean' },
              liveProjectsRequired: { type: 'boolean' },
              openSourceValuable: { type: 'boolean' },
              certificationsValuable: { type: 'boolean' },
            },
          },
          aiLiteracyRequirements: {
            type: 'object',
            properties: {
              required: { type: 'boolean' },
              level: { type: 'string' },
            },
          },
          complianceSensitivity: {
            type: 'object',
            properties: {
              fairnessRisk: { type: 'string' },
              humanReviewMandatory: { type: 'boolean' },
            },
          },
        },
      },
    },
  })

  let rawResult: HiringBlueprint
  try { rawResult = JSON.parse(response.text ?? '{}') as HiringBlueprint }
  catch { rawResult = { ...JOB_INTEL_FALLBACK } }
  const meta: AgentMeta = {
    confidenceScore: rawResult.planningConfidence ?? 50,
    evidenceQuality: rawResult.jobDescriptionQuality as 'high' | 'medium' | 'low',
    reasoningSummary: `Role archetype: ${rawResult.roleArchetype}. Technical depth: ${rawResult.technicalDepth}.`,
    missingEvidence: rawResult.missingCriticalInfo ?? [],
    warnings: rawResult.ambiguityFlags ?? [],
  }
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: false, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

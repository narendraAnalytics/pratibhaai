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

import { GoogleGenAI } from '@google/genai'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY!, apiVersion: 'v1alpha' })

const SYSTEM_PROMPT = `You are the Candidate Extraction Agent for Pratibha AI, an enterprise-grade autonomous recruitment platform.

You are responsible for converting raw resume text into structured candidate intelligence.

You are NOT a recruiter.
You are NOT a hiring decision maker.
You do NOT score candidates.
You do NOT rank candidates.
You ONLY extract structured factual information from resumes.

Your output becomes the foundation for:
- technical validation
- fraud detection
- culture-fit analysis
- candidate ranking
- final hiring decisions

Accuracy, consistency, and conservative extraction are critical.

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must:

1. Parse raw resume text carefully
2. Extract factual candidate information
3. Normalize extracted data consistently
4. Detect missing or ambiguous information
5. Avoid hallucinations completely
6. Produce deterministic structured JSON
7. Preserve downstream scoring reliability

━━━━━━━━━━━━━━━━━━━━
EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━

You must follow these rules strictly:

- Extract ONLY information explicitly present in the resume
- Never hallucinate missing details
- Never fabricate:
  - company names
  - dates
  - skills
  - certifications
  - URLs
  - job titles
  - degrees
- If information is missing:
  - use null for scalar fields
  - use empty arrays for list fields
- Prefer conservative extraction over guessing
- Ignore decorative resume language and focus on factual data
- Normalize technology naming consistently

━━━━━━━━━━━━━━━━━━━━
SKILL NORMALIZATION RULES
━━━━━━━━━━━━━━━━━━━━

Normalize equivalent skill names into industry-standard naming.

Examples:
- NodeJS → Node.js
- JS → JavaScript
- TS → TypeScript
- ReactJS → React
- Postgres → PostgreSQL

Do not create fake skills during normalization.

The "skills" field must contain the union of all technicalSkills + frameworks + tools + databases + cloudPlatforms — this is the flat list used by downstream scoring agents.

━━━━━━━━━━━━━━━━━━━━
RESUME HANDLING RULES
━━━━━━━━━━━━━━━━━━━━

Resumes may contain:
- OCR errors
- broken formatting
- tables
- multi-column layouts
- duplicated sections
- incomplete employment dates
- inconsistent ordering

If formatting is ambiguous:
- prioritize accuracy
- avoid assumptions
- lower extractionConfidence accordingly

━━━━━━━━━━━━━━━━━━━━
EMPLOYMENT EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━

For employment history:

- Extract companies in reverse chronological order
- Extract role, company, duration, startDate if available, endDate if available
- Detect leadership indicators: team lead, manager, architect, mentor, founder
- Populate the flat "companies" array (company names only) for downstream compat
- For experienceYears: estimate total professional experience conservatively; avoid double-counting overlapping dates

━━━━━━━━━━━━━━━━━━━━
EDUCATION EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━

For education:
- Extract degree, field of study, institution, graduation year if available
- Never assume degree completion if unclear
- Populate the flat "education" array as formatted strings: "B.S. Computer Science — MIT 2018" (for downstream compat)
- Also populate educationDetails with the structured records

━━━━━━━━━━━━━━━━━━━━
LINK EXTRACTION RULES
━━━━━━━━━━━━━━━━━━━━

Extract full URLs only if explicitly present.

Supported: GitHub, LinkedIn, Portfolio, Personal website.

If absent: return null. Never generate guessed URLs.

━━━━━━━━━━━━━━━━━━━━
SUMMARY RULES
━━━━━━━━━━━━━━━━━━━━

Generate a concise factual professional summary.

The summary must:
- be neutral
- avoid exaggeration
- avoid evaluation language
- avoid hiring recommendations
- focus on: experience, technologies, domain exposure, leadership indicators

Do NOT say candidate is "excellent", "strong", or "recommended".

━━━━━━━━━━━━━━━━━━━━
ANTI-HALLUCINATION CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━

Never infer employment dates not explicitly present.
Never fabricate company names.
Never assume degree completion if unclear.
Never invent GitHub or LinkedIn URLs.
Never add skills not explicitly mentioned in the resume.

━━━━━━━━━━━━━━━━━━━━
CONFIDENCE & QUALITY ASSESSMENT
━━━━━━━━━━━━━━━━━━━━

extractionConfidence (0–100):
- Clean modern resume → 90–98
- Partially formatted resume → 70–89
- OCR scanned or fragmented resume → 40–69
- Severely corrupted or ambiguous → below 40

resumeQuality assesses:
- formattingClarity: how clean and readable the resume structure is
- completeness: how many expected sections are present
- professionalism: tone, consistency, and presentation quality

missingCriticalFields: list field names that are absent but expected (e.g. "email", "experienceYears").`

const CANDIDATE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    location: { type: 'string' },
    currentRole: { type: 'string' },
    currentCompany: { type: 'string' },

    skills: { type: 'array', items: { type: 'string' }, description: 'Union of all skills — technicalSkills + frameworks + tools + databases + cloudPlatforms' },
    technicalSkills: { type: 'array', items: { type: 'string' } },
    softSkills: { type: 'array', items: { type: 'string' } },
    frameworks: { type: 'array', items: { type: 'string' } },
    cloudPlatforms: { type: 'array', items: { type: 'string' } },
    databases: { type: 'array', items: { type: 'string' } },
    tools: { type: 'array', items: { type: 'string' } },

    experienceYears: { type: 'number' },
    candidateSeniority: { type: 'string', enum: ['junior', 'mid', 'senior', 'lead', 'staff', 'principal'] },
    companies: { type: 'array', items: { type: 'string' }, description: 'Flat list of employer names in reverse chronological order' },
    employmentHistory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          role: { type: 'string' },
          duration: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
        },
        required: ['company', 'role', 'duration'],
      },
    },

    education: { type: 'array', items: { type: 'string' }, description: 'Formatted strings e.g. "B.S. Computer Science — MIT 2018"' },
    educationDetails: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          degree: { type: 'string' },
          field: { type: 'string' },
          institution: { type: 'string' },
          graduationYear: { type: 'string' },
        },
        required: ['degree', 'field', 'institution'],
      },
    },

    githubUrl: { type: 'string' },
    linkedinUrl: { type: 'string' },
    portfolioUrl: { type: 'string' },

    certifications: { type: 'array', items: { type: 'string' } },
    projects: { type: 'array', items: { type: 'string' } },

    careerSignals: {
      type: 'object',
      properties: {
        leadershipExperience: { type: 'boolean' },
        startupExperience: { type: 'boolean' },
        enterpriseExperience: { type: 'boolean' },
        frequentJobChanges: { type: 'boolean' },
      },
      required: ['leadershipExperience', 'startupExperience', 'enterpriseExperience', 'frequentJobChanges'],
    },

    summary: { type: 'string' },
    resumeQuality: {
      type: 'object',
      properties: {
        formattingClarity: { type: 'string', enum: ['low', 'medium', 'high'] },
        completeness: { type: 'string', enum: ['low', 'medium', 'high'] },
        professionalism: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['formattingClarity', 'completeness', 'professionalism'],
    },
    missingCriticalFields: { type: 'array', items: { type: 'string' } },
    extractionConfidence: { type: 'number', description: '0–100 confidence in extraction quality' },
  },
  required: [
    'name', 'email', 'currentRole',
    'skills', 'technicalSkills', 'softSkills', 'frameworks', 'cloudPlatforms', 'databases', 'tools',
    'experienceYears', 'candidateSeniority', 'companies', 'employmentHistory',
    'education', 'educationDetails',
    'certifications', 'projects', 'careerSignals',
    'summary', 'resumeQuality', 'missingCriticalFields', 'extractionConfidence',
  ],
}

export interface EmploymentRecord {
  company: string
  role: string
  duration: string
  startDate: string | null
  endDate: string | null
}

export interface EducationRecord {
  degree: string
  field: string
  institution: string
  graduationYear: string | null
}

export interface CareerSignals {
  leadershipExperience: boolean
  startupExperience: boolean
  enterpriseExperience: boolean
  frequentJobChanges: boolean
}

export interface ResumeQuality {
  formattingClarity: 'low' | 'medium' | 'high'
  completeness: 'low' | 'medium' | 'high'
  professionalism: 'low' | 'medium' | 'high'
}

export interface CandidateProfile {
  // ── Identity ──────────────────────────────────────────────────────────
  name: string
  email: string
  phone: string | null
  location: string | null
  currentRole: string
  currentCompany: string | null

  // ── Skills ────────────────────────────────────────────────────────────
  skills: string[]          // union of all skills — downstream agents use .join(', ')
  technicalSkills: string[]
  softSkills: string[]
  frameworks: string[]
  cloudPlatforms: string[]
  databases: string[]
  tools: string[]

  // ── Experience ────────────────────────────────────────────────────────
  experienceYears: number
  candidateSeniority: 'junior' | 'mid' | 'senior' | 'lead' | 'staff' | 'principal'
  companies: string[]       // flat list for downstream compat — .join(', ')
  employmentHistory: EmploymentRecord[]

  // ── Education ─────────────────────────────────────────────────────────
  education: string[]       // formatted strings for downstream compat — .join(', ')
  educationDetails: EducationRecord[]

  // ── Links ─────────────────────────────────────────────────────────────
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null

  // ── Enrichment ────────────────────────────────────────────────────────
  certifications: string[]
  projects: string[]
  careerSignals: CareerSignals

  // ── Quality & Confidence ──────────────────────────────────────────────
  summary: string
  resumeQuality: ResumeQuality
  missingCriticalFields: string[]
  extractionConfidence: number
}

const CANDIDATE_FALLBACK: CandidateProfile = {
  name: '', email: '', phone: null, location: null, currentRole: '', currentCompany: null,
  skills: [], technicalSkills: [], softSkills: [], frameworks: [], cloudPlatforms: [], databases: [], tools: [],
  experienceYears: 0, candidateSeniority: 'junior', companies: [], employmentHistory: [],
  education: [], educationDetails: [],
  githubUrl: null, linkedinUrl: null, portfolioUrl: null,
  certifications: [], projects: [],
  careerSignals: { leadershipExperience: false, startupExperience: false, enterpriseExperience: false, frequentJobChanges: false },
  summary: 'Resume could not be parsed.',
  resumeQuality: { formattingClarity: 'low', completeness: 'low', professionalism: 'low' },
  missingCriticalFields: ['name', 'email', 'skills', 'experienceYears'],
  extractionConfidence: 0,
}

function labelResumeSections(text: string): string {
  const SECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /^(experience|work experience|employment|work history)/im, label: '[EXPERIENCE]' },
    { pattern: /^(education|academic|qualification)/im, label: '[EDUCATION]' },
    { pattern: /^(skills|technical skills|core competencies)/im, label: '[SKILLS]' },
    { pattern: /^(projects|personal projects|key projects)/im, label: '[PROJECTS]' },
    { pattern: /^(certifications?|certificates?|credentials)/im, label: '[CERTIFICATIONS]' },
    { pattern: /^(summary|objective|profile|about)/im, label: '[SUMMARY]' },
  ]
  return text.split('\n').map(line => {
    const trimmed = line.trim()
    if (!trimmed) return line
    for (const { pattern, label } of SECTION_PATTERNS) {
      if (pattern.test(trimmed)) return `\n${label}\n${line}`
    }
    return line
  }).join('\n')
}

export async function runCandidateExtraction(resumeText: string): Promise<WithMeta<CandidateProfile>> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nResume to analyze:\n\n${labelResumeSections(resumeText)}` }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: CANDIDATE_SCHEMA as unknown,
    },
  })

  const text = response.text ?? '{}'
  let rawResult: CandidateProfile
  try { rawResult = JSON.parse(text) as CandidateProfile }
  catch { rawResult = { ...CANDIDATE_FALLBACK } }
  const eq = rawResult.resumeQuality?.completeness as 'high' | 'medium' | 'low' ?? 'low'
  const meta: AgentMeta = {
    confidenceScore: rawResult.extractionConfidence ?? 50,
    evidenceQuality: eq,
    reasoningSummary: `Extracted ${rawResult.skills?.length ?? 0} skills over ${rawResult.experienceYears ?? 0} years experience.`,
    missingEvidence: rawResult.missingCriticalFields ?? [],
    warnings: rawResult.missingCriticalFields ?? [],
  }
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: false, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

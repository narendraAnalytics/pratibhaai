import { GoogleGenAI } from '@google/genai'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'
async function extractPdfAnnotationLinks(buf: Buffer): Promise<string[]> {
  try {
    // Dynamic import of legacy build — defers evaluation so DOMMatrix (browser-only) is never
    // accessed at module load time. The legacy build polyfills browser APIs for Node.js.
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs')
    GlobalWorkerOptions.workerSrc = ''
    const data = new Uint8Array(buf)
    const pdf = await (getDocument({ data }) as { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getAnnotations: () => Promise<Array<{ subtype: string; url?: string }>> }> }> }).promise
    const urls: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const annotations = await page.getAnnotations()
      for (const annot of annotations) {
        if (annot.subtype === 'Link' && annot.url) urls.push(annot.url)
      }
    }
    return [...new Set(urls)]
  } catch {
    return []
  }
}

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

missingCriticalFields: list field names that are absent but expected (e.g. "email", "experienceYears").

━━━━━━━━━━━━━━━━━━━━
INTELLIGENCE LAYER
━━━━━━━━━━━━━━━━━━━━

TIMELINE ANALYSIS — analyze employment dates carefully:
- overlappingJobs: true if any two roles have concurrent date ranges
- unexplainedGaps: true if any gap between roles exceeds 6 months with no explanation
- totalCareerDurationMonths: sum of all non-overlapping employment months
- timelineConfidence: 0–100 based on how complete and consistent dates are (100 = all dates present and consistent)

FIELD CONFIDENCE — score each section 0–100 based on data completeness and clarity:
- skills: 100 if 5+ skills present and clearly listed; lower if sparse or extracted from prose
- employmentHistory: 100 if all roles have company + role + dates; lower for missing dates or vague entries
- education: 100 if degree + institution + year present; 50 if only institution; 20 if vague
- links: 100 if GitHub or LinkedIn URL explicitly present; 0 if absent

CAREER PROGRESSION — analyze role sequence for trajectory:
- upwardTrajectory: true if titles show clear growth (Junior → Mid → Senior → Lead)
- stableGrowth: true if each role is at same or higher level with reasonable tenure (1.5+ years)
- roleProgressionQuality: 'high' = clear upward growth, 'medium' = lateral but consistent, 'low' = declining or chaotic

SKILL CLUSTERING — assign each skill from the skills[] array to one cluster:
- frontend: React, Vue, Angular, CSS, HTML, Tailwind, Next.js, TypeScript (UI-layer)
- backend: Node.js, Python, Java, Go, REST, GraphQL, Express, Django, Spring, databases
- ai_ml: TensorFlow, PyTorch, Scikit-learn, LLM, Gemini, OpenAI, Hugging Face, MLOps, LangChain
- cloud_devops: AWS, GCP, Azure, Docker, Kubernetes, CI/CD, Terraform, GitHub Actions
Skills can appear in multiple clusters if applicable.

DOMAIN EXPOSURE — detect industry domains from employers, project descriptions, and context:
- Examples: 'fintech', 'healthcare', 'e-commerce', 'SaaS', 'edtech', 'cybersecurity', 'AI/ML', 'logistics', 'gaming'
- Leave empty if no domain signals present. Never hallucinate domains.

PROOF OF WORK SIGNALS — detect evidence of real work output:
- githubPresent: true if a GitHub URL appears anywhere in the resume text
- portfolioPresent: true if a portfolio/personal website URL appears
- liveProjectsMentioned: true if resume mentions deployed apps, live URLs, or production systems
- openSourceMentioned: true if open source contributions, PRs, or OSS projects mentioned
- technicalWritingMentioned: true if blog posts, articles, documentation, or talks mentioned

AUTHENTICITY SIGNALS — detect AI-generated or inflated resumes:
- repetitiveBuzzwords: true if 5+ of these appear: "innovative", "passionate", "dynamic", "leverage", "synergy", "results-driven", "proactive", "self-starter", "thought leader", "visionary"
- excessiveSkillStacking: true if skills[] contains more than 20 items with no supporting employment evidence
- suspiciousExperienceDensity: true if claimed experienceYears is inconsistent with employment history (e.g. claims 8 years but history only shows 3)

ATS COMPATIBILITY — assess resume format quality:
- readable: true if text is cleanly extracted (no OCR noise, no broken encoding, logical section order)
- parsingRisk: 'low' = clean structured resume, 'medium' = some formatting issues, 'high' = tables/columns/images/OCR artifacts detected`

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

    timelineAnalysis: {
      type: 'object',
      properties: {
        overlappingJobs: { type: 'boolean' },
        unexplainedGaps: { type: 'boolean' },
        totalCareerDurationMonths: { type: 'number' },
        timelineConfidence: { type: 'number' },
      },
    },
    fieldConfidence: {
      type: 'object',
      properties: {
        skills: { type: 'number' },
        employmentHistory: { type: 'number' },
        education: { type: 'number' },
        links: { type: 'number' },
      },
    },
    careerProgression: {
      type: 'object',
      properties: {
        upwardTrajectory: { type: 'boolean' },
        stableGrowth: { type: 'boolean' },
        roleProgressionQuality: { type: 'string' },
      },
    },
    skillClusters: {
      type: 'object',
      properties: {
        frontend: { type: 'array', items: { type: 'string' } },
        backend: { type: 'array', items: { type: 'string' } },
        ai_ml: { type: 'array', items: { type: 'string' } },
        cloud_devops: { type: 'array', items: { type: 'string' } },
      },
    },
    domainExposure: { type: 'array', items: { type: 'string' } },
    proofOfWorkSignals: {
      type: 'object',
      properties: {
        githubPresent: { type: 'boolean' },
        portfolioPresent: { type: 'boolean' },
        liveProjectsMentioned: { type: 'boolean' },
        openSourceMentioned: { type: 'boolean' },
        technicalWritingMentioned: { type: 'boolean' },
      },
    },
    authenticitySignals: {
      type: 'object',
      properties: {
        repetitiveBuzzwords: { type: 'boolean' },
        excessiveSkillStacking: { type: 'boolean' },
        suspiciousExperienceDensity: { type: 'boolean' },
      },
    },
    atsCompatibility: {
      type: 'object',
      properties: {
        readable: { type: 'boolean' },
        parsingRisk: { type: 'string' },
      },
    },
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

export interface TimelineAnalysis {
  overlappingJobs: boolean
  unexplainedGaps: boolean
  totalCareerDurationMonths: number
  timelineConfidence: number
}

export interface FieldConfidence {
  skills: number
  employmentHistory: number
  education: number
  links: number
}

export interface CareerProgression {
  upwardTrajectory: boolean
  stableGrowth: boolean
  roleProgressionQuality: 'low' | 'medium' | 'high'
}

export interface SkillClusters {
  frontend: string[]
  backend: string[]
  ai_ml: string[]
  cloud_devops: string[]
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

  // ── Intelligence Layer ────────────────────────────────────────────
  timelineAnalysis: TimelineAnalysis
  fieldConfidence: FieldConfidence
  careerProgression: CareerProgression
  skillClusters: SkillClusters
  domainExposure: string[]
  proofOfWorkSignals: {
    githubPresent: boolean
    portfolioPresent: boolean
    liveProjectsMentioned: boolean
    openSourceMentioned: boolean
    technicalWritingMentioned: boolean
  }
  authenticitySignals: {
    repetitiveBuzzwords: boolean
    excessiveSkillStacking: boolean
    suspiciousExperienceDensity: boolean
  }
  atsCompatibility: {
    readable: boolean
    parsingRisk: 'low' | 'medium' | 'high'
  }
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
  timelineAnalysis: { overlappingJobs: false, unexplainedGaps: false, totalCareerDurationMonths: 0, timelineConfidence: 0 },
  fieldConfidence: { skills: 0, employmentHistory: 0, education: 0, links: 0 },
  careerProgression: { upwardTrajectory: false, stableGrowth: false, roleProgressionQuality: 'low' },
  skillClusters: { frontend: [], backend: [], ai_ml: [], cloud_devops: [] },
  domainExposure: [],
  proofOfWorkSignals: { githubPresent: false, portfolioPresent: false, liveProjectsMentioned: false, openSourceMentioned: false, technicalWritingMentioned: false },
  authenticitySignals: { repetitiveBuzzwords: false, excessiveSkillStacking: false, suspiciousExperienceDensity: false },
  atsCompatibility: { readable: false, parsingRisk: 'high' },
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

export async function runCandidateExtraction(resumeText: string, pdfBuffer?: Buffer): Promise<WithMeta<CandidateProfile>> {
  const annotationLinks = pdfBuffer ? await extractPdfAnnotationLinks(pdfBuffer) : []
  const hyperlinksSection = annotationLinks.length
    ? `\n\n--- EMBEDDED HYPERLINKS DETECTED IN PDF (treat these as ground-truth URLs) ---\n${annotationLinks.join('\n')}`
    : ''

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nResume to analyze:\n\n${labelResumeSections(resumeText)}${hyperlinksSection}` }] }],
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

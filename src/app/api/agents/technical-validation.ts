import { GoogleGenAI } from '@google/genai'
import axios from 'axios'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'
import { withRetry } from './utils/retry'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

const SYSTEM_PROMPT = `You are the Technical Validation Agent for Pratibha AI, an enterprise-grade autonomous recruitment platform.

You are responsible for evaluating the technical capability evidence of candidates using:
- resume data
- GitHub activity
- portfolio evidence
- technical project indicators

You are NOT a recruiter.
You are NOT a hiring decision maker.
You do NOT rank candidates.
You do NOT make final hiring recommendations.

Your responsibility is ONLY to:
- assess technical depth
- validate technical credibility
- analyze engineering signals
- compare demonstrated skills against role requirements
- identify technical strengths and weaknesses
- generate evidence-based technical assessments

━━━━━━━━━━━━━━━━━━━━
CORE VALIDATION PRINCIPLES
━━━━━━━━━━━━━━━━━━━━

You must follow these principles strictly:

- Be evidence-based
- Be conservative
- Be technically objective
- Never hallucinate technical expertise
- Never assume skill mastery without evidence
- Never overvalue GitHub popularity metrics
- Focus on demonstrated engineering capability

Do NOT:
- equate stars with engineering skill
- penalize candidates solely for lacking public GitHub activity
- assume all strong engineers maintain open-source projects

━━━━━━━━━━━━━━━━━━━━
PRIMARY RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must analyze:

1. Technical Skill Alignment
2. Engineering Depth
3. Project Complexity
4. Technology Relevance
5. Architecture Signals
6. Production Engineering Signals
7. Technical Consistency
8. Active Development Signals
9. Specialization Areas
10. Technical Maturity

━━━━━━━━━━━━━━━━━━━━
GITHUB ANALYSIS RULES
━━━━━━━━━━━━━━━━━━━━

When GitHub data is available:

Analyze:
- repository relevance
- technology alignment
- contribution consistency
- project recency
- engineering complexity
- architecture indicators
- documentation quality
- production-readiness signals

Look for evidence of:
- real implementation work
- scalable systems
- testing practices
- CI/CD workflows
- containerization
- infrastructure knowledge
- deployment awareness

Do NOT rely heavily on:
- follower counts
- stars alone
- repository quantity alone

Quality matters more than popularity.

━━━━━━━━━━━━━━━━━━━━
TECHNICAL DEPTH ANALYSIS
━━━━━━━━━━━━━━━━━━━━

Evaluate:
- whether claimed technologies appear supported
- whether project complexity matches seniority claims
- whether architecture exposure exists
- whether production engineering experience exists
- whether system design capability is evident

Examples of strong technical signals:
- scalable architectures
- API design
- distributed systems
- infrastructure automation
- testing frameworks
- deployment pipelines
- AI/ML implementation depth
- cloud-native engineering

━━━━━━━━━━━━━━━━━━━━
TECHNOLOGY ALIGNMENT RULES
━━━━━━━━━━━━━━━━━━━━

Compare demonstrated technical evidence against:
- required skills
- preferred skills
- must-have keywords
- expected technical depth

You must identify:
- strong alignment
- partial alignment
- unsupported skill claims
- specialization mismatches

━━━━━━━━━━━━━━━━━━━━
SPECIALIZATION DETECTION
━━━━━━━━━━━━━━━━━━━━

Infer dominant specialization areas such as:
- frontend engineering
- backend systems
- machine learning
- DevOps
- cloud engineering
- data engineering
- mobile development
- infrastructure/platform engineering
- AI research
- full-stack engineering

Use only evidence strongly supported by:
- repositories
- technologies
- project descriptions
- work history

━━━━━━━━━━━━━━━━━━━━
GITHUB ABSENCE POLICY
━━━━━━━━━━━━━━━━━━━━

Candidates without GitHub activity must NOT be heavily penalized automatically.

Many strong engineers:
- work on private enterprise systems
- work under NDA
- contribute internally
- avoid public open-source work

If GitHub is absent:
- rely more heavily on resume evidence
- reduce confidence moderately
- avoid aggressive negative scoring

━━━━━━━━━━━━━━━━━━━━
TECHNICAL SCORING GUIDELINES
━━━━━━━━━━━━━━━━━━━━

0–30:
- major technical gaps
- insufficient supporting evidence
- weak alignment

31–60:
- partial alignment
- moderate capability
- may require mentoring or upskilling

61–80:
- strong practical alignment
- solid engineering capability
- likely productive quickly

81–100:
- exceptional technical depth
- strong architecture signals
- advanced engineering maturity
- highly aligned specialization

━━━━━━━━━━━━━━━━━━━━
CONFIDENCE RULES
━━━━━━━━━━━━━━━━━━━━

Technical confidence should decrease when:
- GitHub data is limited
- repositories are outdated
- project evidence is weak
- technical descriptions are vague
- resume claims lack supporting evidence

High confidence requires:
- clear implementation evidence
- active technical work
- strong alignment with role requirements
- technically detailed projects

━━━━━━━━━━━━━━━━━━━━
MANUAL REVIEW RULES
━━━━━━━━━━━━━━━━━━━━

Recommend manual review when:
- evidence is ambiguous
- highly specialized domains are involved
- GitHub is unavailable for senior roles
- technical claims exceed visible evidence
- project complexity is unclear

━━━━━━━━━━━━━━━━━━━━
ENGINEERING INTELLIGENCE LAYER
━━━━━━━━━━━━━━━━━━━━

PROOF-OF-WORK SCORE (0–100) — core enterprise metric, weighted composite:
- 30 pts: active original repositories (non-forks) with real implementation work
- 25 pts: deployment / production evidence (live apps, cloud platforms, CI/CD)
- 25 pts: architecture maturity (system design, scalability, distributed systems)
- 20 pts: open source contribution consistency and quality
- Score 80+ only for candidates with clear evidence across multiple dimensions

ENGINEERING MATURITY — detect from repo topics, descriptions, filenames:
- testingEvidence: true if test directories, Jest/pytest/testing frameworks, TDD patterns mentioned
- cicdEvidence: true if GitHub Actions, CircleCI, Jenkins, .github/workflows detected
- containerizationEvidence: true if Docker, Kubernetes, docker-compose mentioned
- deploymentEvidence: true if Vercel, AWS, GCP, Heroku, Railway, fly.io, or deployment config detected
- infrastructureEvidence: true if Terraform, Pulumi, Ansible, IaC patterns detected

SYSTEM DESIGN SIGNALS — detect from repo descriptions and project context:
- distributedSystemsEvidence: true if message queues, event streaming, Kafka, RabbitMQ, microservices pattern
- microservicesEvidence: true if service mesh, API gateway, multiple service repos, service decomposition
- scalabilityEvidence: true if caching (Redis), load balancing, CDN, sharding, horizontal scaling mentioned
- architectureComplexity: 'high' if 3+ of above; 'medium' if 1–2; 'low' if none

AI/ML ENGINEERING SIGNALS — detect from languages, repos, descriptions:
- mlProjectsDetected: true if TensorFlow, PyTorch, Scikit-learn, XGBoost, Keras, Jupyter notebooks detected
- llmProjectsDetected: true if LangChain, LlamaIndex, OpenAI SDK, Anthropic SDK, Gemini SDK, RAG, vector DB detected
- aiDeploymentEvidence: true if model serving (FastAPI + model, BentoML, Triton, HuggingFace Spaces) detected
- modelOpsEvidence: true if MLflow, Weights & Biases, experiment tracking, model registry detected

TECHNICAL AUTHENTICITY — compare resume claims vs GitHub evidence:
- claimsSupportedByProjects: true if claimed specializations match actual repository languages and topics
- unsupportedAdvancedClaims: list specific gaps, e.g. "Claims distributed systems expertise — no relevant repos found"

REPOSITORY QUALITY (each 0–100):
- averageRepoQuality: score across top 5 repos based on README presence, description, recent commits, non-trivial code
- bestProjectScore: score of the single strongest repo (complexity + deployment + documentation)
- documentationQuality: proportion of repos with meaningful README and inline docs
- codeOrganizationSignals: evidence of clean structure (src/, tests/, config/, proper separation)

PRODUCTION SIGNALS:
- liveAppsDetected: true if deployed URLs, live demo links, or production system descriptions found
- deploymentPlatformsDetected: list detected platforms (e.g. ["Vercel", "AWS", "GCP"])
- apiDevelopmentEvidence: true if REST API, GraphQL, gRPC, FastAPI, Express API repos detected
- monitoringLoggingEvidence: true if Sentry, Datadog, Prometheus, logging libraries, observability tools detected

EVIDENCE CONFIDENCE (0–100 per domain):
- githubEvidence: 100 = active profile with 5+ relevant repos; 0 = no GitHub or all forks
- projectEvidence: 100 = detailed project descriptions with technical specifics; 0 = empty repos
- architectureEvidence: 100 = clear system design patterns across multiple repos; 0 = only tutorial projects
- productionEvidence: 100 = deployed apps with real users/traffic signals; 0 = no deployment evidence

ACTIVITY TRENDS:
- consistencyScore (0–100): regular commits spread across months vs single burst of activity
- recentActivityStrength (0–100): activity in last 6 months; 100 = highly active, 0 = no recent pushes
- longTermContributionPattern: 'high' = 2+ years of steady commits; 'medium' = 1–2 years; 'low' = < 1 year or bursty

LEARNING VELOCITY:
- modernTechAdoption: true if repos from 2024+ use modern frameworks (Next.js 14+, LLMs, edge computing, etc.)
- technologyEvolutionEvidence: true if progression from older to newer tech stack visible across repo history
- adaptabilityScore (0–100): breadth of different technology domains explored with genuine implementations

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

const TECHNICAL_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number' },
    technologyAlignmentScore: { type: 'number' },
    githubActivityLevel: { type: 'string', enum: ['inactive', 'low', 'moderate', 'high'] },
    projectComplexity: { type: 'string', enum: ['low', 'medium', 'high'] },
    productionReadiness: { type: 'string', enum: ['low', 'medium', 'high'] },
    openSourceContributionLevel: { type: 'string', enum: ['none', 'low', 'moderate', 'high'] },
    specializationAreas: { type: 'array', items: { type: 'string' } },
    technicalStrengths: { type: 'array', items: { type: 'string' } },
    technicalWeaknesses: { type: 'array', items: { type: 'string' } },
    architectureSignals: { type: 'array', items: { type: 'string' } },
    languagesDetected: { type: 'array', items: { type: 'string' } },
    repoCount: { type: 'number' },
    githubAnalysis: { type: 'string' },
    techDepthAssessment: { type: 'string' },
    technicalConfidence: { type: 'number' },
    manualReviewRecommended: { type: 'boolean' },
    proofOfWorkScore: { type: 'number' },
    engineeringMaturity: {
      type: 'object',
      properties: {
        testingEvidence: { type: 'boolean' },
        cicdEvidence: { type: 'boolean' },
        containerizationEvidence: { type: 'boolean' },
        deploymentEvidence: { type: 'boolean' },
        infrastructureEvidence: { type: 'boolean' },
      },
    },
    systemDesignSignals: {
      type: 'object',
      properties: {
        distributedSystemsEvidence: { type: 'boolean' },
        microservicesEvidence: { type: 'boolean' },
        scalabilityEvidence: { type: 'boolean' },
        architectureComplexity: { type: 'string' },
      },
    },
    aiEngineeringSignals: {
      type: 'object',
      properties: {
        mlProjectsDetected: { type: 'boolean' },
        llmProjectsDetected: { type: 'boolean' },
        aiDeploymentEvidence: { type: 'boolean' },
        modelOpsEvidence: { type: 'boolean' },
      },
    },
    technicalAuthenticity: {
      type: 'object',
      properties: {
        claimsSupportedByProjects: { type: 'boolean' },
        unsupportedAdvancedClaims: { type: 'array', items: { type: 'string' } },
      },
    },
    repositoryQuality: {
      type: 'object',
      properties: {
        averageRepoQuality: { type: 'number' },
        bestProjectScore: { type: 'number' },
        documentationQuality: { type: 'number' },
        codeOrganizationSignals: { type: 'number' },
      },
    },
    productionSignals: {
      type: 'object',
      properties: {
        liveAppsDetected: { type: 'boolean' },
        deploymentPlatformsDetected: { type: 'array', items: { type: 'string' } },
        apiDevelopmentEvidence: { type: 'boolean' },
        monitoringLoggingEvidence: { type: 'boolean' },
      },
    },
    evidenceConfidence: {
      type: 'object',
      properties: {
        githubEvidence: { type: 'number' },
        projectEvidence: { type: 'number' },
        architectureEvidence: { type: 'number' },
        productionEvidence: { type: 'number' },
      },
    },
    activityTrends: {
      type: 'object',
      properties: {
        consistencyScore: { type: 'number' },
        recentActivityStrength: { type: 'number' },
        longTermContributionPattern: { type: 'string' },
      },
    },
    learningVelocity: {
      type: 'object',
      properties: {
        modernTechAdoption: { type: 'boolean' },
        technologyEvolutionEvidence: { type: 'boolean' },
        adaptabilityScore: { type: 'number' },
      },
    },
  },
  required: [
    'score', 'technologyAlignmentScore', 'githubActivityLevel', 'projectComplexity',
    'productionReadiness', 'openSourceContributionLevel', 'specializationAreas',
    'technicalStrengths', 'technicalWeaknesses', 'architectureSignals', 'languagesDetected',
    'repoCount', 'githubAnalysis', 'techDepthAssessment', 'technicalConfidence', 'manualReviewRecommended',
  ],
}

export interface TechnicalValidationResult {
  // ── Existing fields (backward compat — used by evaluation-aggregator + report-generator) ──
  score: number
  githubAnalysis: string
  techDepthAssessment: string
  repoCount: number
  languagesDetected: string[]

  // ── Technical intelligence ─────────────────────────────────────────────────────────────────
  technologyAlignmentScore: number
  githubActivityLevel: 'inactive' | 'low' | 'moderate' | 'high'
  projectComplexity: 'low' | 'medium' | 'high'
  productionReadiness: 'low' | 'medium' | 'high'
  openSourceContributionLevel: 'none' | 'low' | 'moderate' | 'high'
  specializationAreas: string[]
  technicalStrengths: string[]
  technicalWeaknesses: string[]
  architectureSignals: string[]
  technicalConfidence: number
  manualReviewRecommended: boolean

  // ── Engineering Intelligence Layer ────────────────────────────────
  proofOfWorkScore: number
  engineeringMaturity: {
    testingEvidence: boolean
    cicdEvidence: boolean
    containerizationEvidence: boolean
    deploymentEvidence: boolean
    infrastructureEvidence: boolean
  }
  systemDesignSignals: {
    distributedSystemsEvidence: boolean
    microservicesEvidence: boolean
    scalabilityEvidence: boolean
    architectureComplexity: 'low' | 'medium' | 'high'
  }
  aiEngineeringSignals: {
    mlProjectsDetected: boolean
    llmProjectsDetected: boolean
    aiDeploymentEvidence: boolean
    modelOpsEvidence: boolean
  }
  technicalAuthenticity: {
    claimsSupportedByProjects: boolean
    unsupportedAdvancedClaims: string[]
  }
  repositoryQuality: {
    averageRepoQuality: number
    bestProjectScore: number
    documentationQuality: number
    codeOrganizationSignals: number
  }
  productionSignals: {
    liveAppsDetected: boolean
    deploymentPlatformsDetected: string[]
    apiDevelopmentEvidence: boolean
    monitoringLoggingEvidence: boolean
  }
  evidenceConfidence: {
    githubEvidence: number
    projectEvidence: number
    architectureEvidence: number
    productionEvidence: number
  }
  activityTrends: {
    consistencyScore: number
    recentActivityStrength: number
    longTermContributionPattern: 'low' | 'medium' | 'high'
  }
  learningVelocity: {
    modernTechAdoption: boolean
    technologyEvolutionEvidence: boolean
    adaptabilityScore: number
  }
}

async function fetchGitHubSummary(githubUrl: string): Promise<{ summary: string; fallbackUsed: boolean }> {
  try {
    const username = githubUrl.replace(/https?:\/\/github\.com\//, '').split('/')[0]
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    }

    const { result: [userRes, reposRes] } = await withRetry(
      () => Promise.all([
        axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 8000 }),
        axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers, timeout: 8000 }),
      ]),
      3,
    )

    const user = userRes.data as { public_repos: number; followers: number; created_at: string }
    const repos = reposRes.data as Array<{
      name: string
      language: string | null
      stargazers_count: number
      description: string | null
      fork: boolean
      pushed_at: string | null
      topics: string[]
    }>

    const ownRepos = repos.filter(r => !r.fork)
    const forkCount = repos.length - ownRepos.length
    const languages = [...new Set(ownRepos.map(r => r.language).filter(Boolean))]
    const lastPushed = ownRepos[0]?.pushed_at?.slice(0, 7) ?? 'unknown'

    const topRepos = ownRepos.slice(0, 5).map(r => {
      const topics = r.topics?.length ? ` [${r.topics.slice(0, 3).join(', ')}]` : ''
      const desc = r.description ? ` — ${r.description.slice(0, 60)}` : ''
      return `  • ${r.name} (${r.language ?? 'unknown'}, ⭐${r.stargazers_count})${topics}${desc}`
    })

    const summary = `GitHub Profile (@${username}):
- Public repositories: ${user.public_repos} (${ownRepos.length} original, ${forkCount} forks)
- Followers: ${user.followers}
- Account created: ${user.created_at?.slice(0, 4) ?? 'unknown'}
- Last push activity: ${lastPushed}
- Languages detected: ${languages.join(', ') || 'none'}
- Top 5 repos:
${topRepos.join('\n')}`

    return { summary, fallbackUsed: false }
  } catch {
    return { summary: 'GitHub profile could not be fetched (may be private or URL invalid)', fallbackUsed: true }
  }
}

const TECH_FALLBACK: TechnicalValidationResult = {
  score: 50, technologyAlignmentScore: 50,
  githubActivityLevel: 'inactive', projectComplexity: 'low', productionReadiness: 'low',
  openSourceContributionLevel: 'none',
  specializationAreas: [], technicalStrengths: [], technicalWeaknesses: ['evaluation failed'],
  architectureSignals: [], languagesDetected: [],
  repoCount: 0, githubAnalysis: '', techDepthAssessment: '',
  technicalConfidence: 40, manualReviewRecommended: true,
  proofOfWorkScore: 30,
  engineeringMaturity: { testingEvidence: false, cicdEvidence: false, containerizationEvidence: false, deploymentEvidence: false, infrastructureEvidence: false },
  systemDesignSignals: { distributedSystemsEvidence: false, microservicesEvidence: false, scalabilityEvidence: false, architectureComplexity: 'low' },
  aiEngineeringSignals: { mlProjectsDetected: false, llmProjectsDetected: false, aiDeploymentEvidence: false, modelOpsEvidence: false },
  technicalAuthenticity: { claimsSupportedByProjects: false, unsupportedAdvancedClaims: [] },
  repositoryQuality: { averageRepoQuality: 0, bestProjectScore: 0, documentationQuality: 0, codeOrganizationSignals: 0 },
  productionSignals: { liveAppsDetected: false, deploymentPlatformsDetected: [], apiDevelopmentEvidence: false, monitoringLoggingEvidence: false },
  evidenceConfidence: { githubEvidence: 0, projectEvidence: 0, architectureEvidence: 0, productionEvidence: 0 },
  activityTrends: { consistencyScore: 0, recentActivityStrength: 0, longTermContributionPattern: 'low' },
  learningVelocity: { modernTechAdoption: false, technologyEvolutionEvidence: false, adaptabilityScore: 0 },
}

export async function runTechnicalValidation(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
): Promise<WithMeta<TechnicalValidationResult>> {
  const { summary: githubSummary, fallbackUsed: githubFallback } = profile.githubUrl
    ? await fetchGitHubSummary(profile.githubUrl)
    : { summary: 'No GitHub URL provided by the candidate.', fallbackUsed: false }

  const prompt = `${SYSTEM_PROMPT}

--- CANDIDATE TECHNICAL PROFILE ---
Name: ${profile.name}
Current Role: ${profile.currentRole}
Seniority: ${profile.candidateSeniority}
Years of Experience: ${profile.experienceYears}
Skills Claimed: ${profile.skills.join(', ')}
Past Companies: ${profile.companies.join(', ')}

--- GITHUB ACTIVITY ---
${githubSummary}

--- JOB TECHNICAL REQUIREMENTS ---
Required Skills: ${blueprint.requiredSkills.join(', ')}
Preferred Skills: ${blueprint.preferredSkills.join(', ')}
Technical Depth Expected: ${blueprint.technicalDepth}
Must-Have Keywords: ${blueprint.mustHaveKeywords.join(', ')}
GitHub Importance: ${blueprint.githubImportance}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: TECHNICAL_SCHEMA as unknown,
    },
  })

  let rawResult: TechnicalValidationResult
  try { rawResult = JSON.parse(response.text ?? '{}') as TechnicalValidationResult }
  catch { rawResult = { ...TECH_FALLBACK } }
  const ghToEq: Record<string, 'high' | 'medium' | 'low'> = { high: 'high', moderate: 'medium', low: 'low', inactive: 'low' }
  const meta: AgentMeta = {
    confidenceScore: rawResult.technicalConfidence ?? 50,
    evidenceQuality: ghToEq[rawResult.githubActivityLevel] ?? 'low',
    reasoningSummary: `GitHub activity: ${rawResult.githubActivityLevel}. Technical score: ${rawResult.score}/100.`,
    missingEvidence: [],
    warnings: rawResult.technicalWeaknesses ?? [],
  }
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: githubFallback, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

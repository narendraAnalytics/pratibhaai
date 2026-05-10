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
    model: 'gemini-3-flash-preview',
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

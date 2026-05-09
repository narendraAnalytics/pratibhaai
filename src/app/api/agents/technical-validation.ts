import { GoogleGenAI } from '@google/genai'
import axios from 'axios'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export interface TechnicalValidationResult {
  score: number
  githubAnalysis: string
  techDepthAssessment: string
  repoCount: number
  languagesDetected: string[]
}

async function fetchGitHubSummary(githubUrl: string): Promise<string> {
  try {
    const username = githubUrl.replace(/https?:\/\/github\.com\//, '').split('/')[0]
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    }

    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 8000 }),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, { headers, timeout: 8000 }),
    ])

    const user = userRes.data as { public_repos: number; followers: number; created_at: string }
    const repos = reposRes.data as Array<{ name: string; language: string | null; stargazers_count: number; description: string | null; fork: boolean }>
    const ownRepos = repos.filter(r => !r.fork)
    const languages = [...new Set(ownRepos.map(r => r.language).filter(Boolean))]

    return `GitHub Profile (@${username}):
- Public repositories: ${user.public_repos}
- Followers: ${user.followers}
- Account created: ${user.created_at?.slice(0, 4) ?? 'unknown'}
- Top 5 repos: ${ownRepos.slice(0, 5).map(r => `${r.name} (${r.language ?? 'unknown'}, ⭐${r.stargazers_count})`).join(' | ')}
- Languages detected: ${languages.join(', ') || 'none'}`
  } catch {
    return 'GitHub profile could not be fetched (may be private or URL invalid)'
  }
}

export async function runTechnicalValidation(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
): Promise<TechnicalValidationResult> {
  const githubSummary = profile.githubUrl
    ? await fetchGitHubSummary(profile.githubUrl)
    : 'No GitHub URL provided by the candidate.'

  const prompt = `You are the Technical Validation Agent for Pratibha AI, an autonomous recruitment platform.

Your role is to assess how technically strong this candidate is for the given role. You evaluate their claimed skills against their actual demonstrated output (GitHub activity) and overall experience depth.

--- CANDIDATE TECHNICAL PROFILE ---
Skills Claimed: ${profile.skills.join(', ')}
Years of Experience: ${profile.experienceYears}
Current Role: ${profile.currentRole}
Past Companies: ${profile.companies.join(', ')}

--- GITHUB ACTIVITY ---
${githubSummary}

--- JOB TECHNICAL REQUIREMENTS ---
Required Skills: ${blueprint.requiredSkills.join(', ')}
Preferred Skills: ${blueprint.preferredSkills.join(', ')}
Technical Depth Expected: ${blueprint.technicalDepth}
Must-Have Keywords: ${blueprint.mustHaveKeywords.join(', ')}

--- YOUR TASK ---
Score this candidate's technical depth on a scale of 0–100 where:
- 0–30: Significant skill gap, not ready for this role
- 31–60: Partial match, may need upskilling
- 61–80: Good match, can do the job
- 81–100: Excellent match, strong technical depth

Provide:
1. score — 0 to 100
2. githubAnalysis — what the GitHub activity tells you (or note if unavailable)
3. techDepthAssessment — your overall assessment of their technical depth for this role
4. repoCount — number of own (non-fork) repos identified (0 if no GitHub)
5. languagesDetected — programming languages seen in GitHub repos

Return ONLY valid JSON — no markdown, no explanation, no extra text:
{
  "score": 74,
  "githubAnalysis": "Candidate has 18 repos with active contributions in TypeScript and Python...",
  "techDepthAssessment": "Strong frontend background with production-grade projects. Limited backend exposure.",
  "repoCount": 12,
  "languagesDetected": ["TypeScript", "JavaScript", "Python"]
}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '{}'
  return extractJSON(text) as unknown as TechnicalValidationResult
}

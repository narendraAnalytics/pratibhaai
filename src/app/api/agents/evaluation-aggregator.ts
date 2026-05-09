import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export interface AggregatedScore {
  skillsScore: number
  compositeScore: number
  recommendation: 'strong_hire' | 'consider' | 'not_recommended'
  rankLabel: string
  breakdown: { skills: number; technical: number; culture: number }
}

export async function runEvaluationAggregator(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  technicalScore: number,
  cultureScore: number,
  weights?: { skills: number; technical: number; culture: number },
): Promise<AggregatedScore> {
  const prompt = `You are the Evaluation Aggregator Agent for Pratibha AI, an autonomous recruitment platform.

Your role is to compute a precise Skills Match Score by comparing the candidate's skills against the job's requirements. Other agents have already assessed technical depth and culture fit — your job is to score skills alignment only.

--- CANDIDATE SKILLS ---
${profile.skills.join(', ')}

--- JOB SKILL REQUIREMENTS ---
Required Skills (must have): ${blueprint.requiredSkills.join(', ')}
Preferred Skills (nice to have): ${blueprint.preferredSkills.join(', ')}
Must-Have Keywords: ${blueprint.mustHaveKeywords.join(', ')}

--- SCORING GUIDE ---
Score 0–100 based on:
- Full match on all required skills → 85–100
- Missing 1–2 required skills but strong preferred coverage → 65–84
- Missing several required skills → 40–64
- Major skills gap → 0–39

Return ONLY valid JSON — no markdown, no explanation:
{ "skillsScore": 82 }`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '{}'
  const { skillsScore } = extractJSON(text) as { skillsScore: number }

  const w = weights ?? { skills: 40, technical: 35, culture: 25 }
  const compositeScore = Math.round(
    (skillsScore * (w.skills / 100)) +
    (technicalScore * (w.technical / 100)) +
    (cultureScore * (w.culture / 100))
  )

  const recommendation: AggregatedScore['recommendation'] =
    compositeScore >= 90 ? 'strong_hire' :
    compositeScore >= 65 ? 'consider' :
    'not_recommended'

  const rankLabel =
    compositeScore >= 90 ? 'Strong Hire' :
    compositeScore >= 65 ? 'Consider' :
    'Not Recommended'

  return {
    skillsScore,
    compositeScore,
    recommendation,
    rankLabel,
    breakdown: { skills: skillsScore, technical: technicalScore, culture: cultureScore },
  }
}

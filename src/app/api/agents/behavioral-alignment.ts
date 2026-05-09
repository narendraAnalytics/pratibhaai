import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export interface BehavioralAlignmentResult {
  score: number
  strengths: string[]
  concerns: string[]
  communicationStyle: string
}

export async function runBehavioralAlignment(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  resumeText: string,
): Promise<BehavioralAlignmentResult> {
  const prompt = `You are the Behavioral Alignment Agent for Pratibha AI, an autonomous recruitment platform.

Your role is to assess how well a candidate aligns with the soft skills, culture fit, and behavioral expectations of the role. Technical skills are handled by other agents — you focus exclusively on: communication style, leadership indicators, teamwork signals, ownership mindset, adaptability, and cultural alignment.

--- CANDIDATE PROFILE ---
Name: ${profile.name}
Current Role: ${profile.currentRole}
Experience: ${profile.experienceYears} years
Summary: ${profile.summary}
Companies: ${profile.companies.join(', ')}

--- RESUME CONTENT (first 3000 characters) ---
${resumeText.slice(0, 3000)}

--- CULTURE & BEHAVIOR EXPECTATIONS ---
Culture Keywords to match: ${blueprint.cultureKeywords.join(', ')}
Seniority Signals: ${blueprint.senioritySignals.join(', ')}
Job Type: ${blueprint.technicalDepth} technical depth environment

--- YOUR TASK ---
Evaluate the candidate's behavioral profile on a scale of 0–100:
- 0–30: Clear culture mismatch or concerning behavioral signals
- 31–60: Some alignment but notable gaps
- 61–80: Good cultural fit, minor concerns
- 81–100: Excellent alignment, strong behavioral indicators

Look for:
- Evidence of leadership, ownership, and initiative
- Collaboration and communication indicators
- Career progression patterns (promotions, growing responsibility)
- Any behavioral red flags (frequent job hopping without growth, etc.)

Provide:
1. score — 0 to 100
2. strengths — specific behavioral strengths observed
3. concerns — behavioral concerns or gaps (be specific, not generic)
4. communicationStyle — how this candidate likely communicates based on their resume

Return ONLY valid JSON — no markdown, no explanation, no extra text:
{
  "score": 78,
  "strengths": ["Clear career progression", "Led cross-functional teams", "Shipped product independently"],
  "concerns": ["Frequent role changes (3 companies in 2 years)"],
  "communicationStyle": "Direct and results-oriented, emphasis on metrics and delivery"
}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '{}'
  return extractJSON(text) as unknown as BehavioralAlignmentResult
}

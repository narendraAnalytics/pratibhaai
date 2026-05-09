import { GoogleGenAI } from '@google/genai'
import type { CandidateProfile } from './candidate-extraction'
import type { HiringBlueprint } from './job-intelligence'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export interface RiskReport {
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  inflationSigns: string[]
  timelineIssues: string[]
  overallRisk: number
}

export async function runVerificationRisk(
  profile: CandidateProfile,
  blueprint: HiringBlueprint,
  resumeText: string,
): Promise<RiskReport> {
  const prompt = `You are the Verification & Risk Agent for Pratibha AI, an autonomous recruitment platform.

Your role is to critically examine a candidate's resume for red flags, exaggerations, credential inflation, and timeline inconsistencies. You are the trust-verification layer — your findings protect the hiring organization from making bad hires based on misleading information.

--- CANDIDATE PROFILE (extracted) ---
Name: ${profile.name}
Current Role: ${profile.currentRole}
Experience Years: ${profile.experienceYears}
Skills Claimed: ${profile.skills.join(', ')}
Companies: ${profile.companies.join(', ')}
Education: ${profile.education.join(', ')}

--- JOB REQUIREMENTS ---
Required Skills: ${blueprint.requiredSkills.join(', ')}
Deal Breakers: ${blueprint.dealBreakers.join(', ')}
Seniority Signals Expected: ${blueprint.senioritySignals.join(', ')}

--- RAW RESUME (first 2500 characters) ---
${resumeText.slice(0, 2500)}

--- YOUR TASK ---
Analyze for:
1. flags — any direct red flags (gaps in employment, vague descriptions, missing specifics)
2. inflationSigns — skills or titles that appear inflated or inconsistent with actual experience described
3. timelineIssues — overlapping dates, suspicious gaps, impossible timelines
4. riskLevel — overall risk: "low", "medium", or "high"
5. overallRisk — a numeric score 0–100 (0 = no risk, 100 = severe risk)

Be critical but fair. If the resume is clean, say so explicitly with empty arrays.

Return ONLY valid JSON — no markdown, no explanation, no extra text:
{
  "riskLevel": "low",
  "flags": ["Employment gap of 14 months in 2021 unexplained"],
  "inflationSigns": ["Claims 'led team of 20' but only 2 years total experience"],
  "timelineIssues": [],
  "overallRisk": 18
}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '{}'
  return extractJSON(text) as unknown as RiskReport
}

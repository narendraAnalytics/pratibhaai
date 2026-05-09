import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export interface CandidateProfile {
  name: string
  email: string
  skills: string[]
  experienceYears: number
  currentRole: string
  companies: string[]
  education: string[]
  githubUrl: string | null
  linkedinUrl: string | null
  summary: string
}

export async function runCandidateExtraction(resumeText: string): Promise<CandidateProfile> {
  const prompt = `You are the Candidate Extraction Agent for Pratibha AI, an autonomous recruitment platform.

Your role is to carefully parse a raw resume text and extract a structured Candidate Profile. This profile is the foundation for all downstream scoring agents — accuracy here directly affects hiring decisions.

--- INSTRUCTIONS ---
- Extract only what is explicitly stated in the resume. Do not infer or hallucinate.
- For fields not present (e.g., no GitHub URL), use null — never make up values.
- For experienceYears, calculate total professional experience in years (approximate).
- For skills, list every technical skill, tool, language, and framework mentioned.
- For companies, list all employers in reverse chronological order.
- For education, include degree, field, and institution as a single string per entry.
- For githubUrl and linkedinUrl, extract the full URL if present, otherwise null.
- Write a concise, professional summary of the candidate's overall profile.

--- RESUME TEXT ---
${resumeText}

Return ONLY valid JSON — no markdown, no explanation, no extra text:
{
  "name": "Full Name",
  "email": "email@example.com",
  "skills": ["TypeScript", "React", "Node.js"],
  "experienceYears": 5,
  "currentRole": "Senior Frontend Engineer",
  "companies": ["Acme Corp", "StartupXYZ"],
  "education": ["B.S. Computer Science — MIT 2018"],
  "githubUrl": "https://github.com/username",
  "linkedinUrl": "https://linkedin.com/in/username",
  "summary": "Experienced full-stack engineer with 5 years..."
}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = response.text ?? '{}'
  return extractJSON(text) as unknown as CandidateProfile
}

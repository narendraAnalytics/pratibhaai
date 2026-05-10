import { GoogleGenAI } from '@google/genai'
import type { AgentMeta, AgentExecutionState, WithMeta } from './utils/types'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY!, apiVersion: 'v1alpha' })

export interface PipelinePlan {
  sessionId: string
  jobTitle: string
  totalCandidates: number
  agentsToRun: string[]
  priorityNotes: string
  estimatedComplexity: 'low' | 'medium' | 'high'
  riskLevel: 'low' | 'medium' | 'high'
  parallelExecution: boolean
  requiresHumanReview: boolean
  githubAnalysisRequired: boolean
  planningConfidence: number
  executionStrategy: {
    candidateProcessing: 'parallel' | 'sequential'
    batchSize: number
  }
  recommendedWeights: {
    skills: number
    technical: number
    culture: number
  }
}

const ORCHESTRATOR_FALLBACK: PipelinePlan = {
  sessionId: `pipe_fallback_${Date.now()}`,
  jobTitle: 'Unknown',
  totalCandidates: 0,
  agentsToRun: ['job-intelligence', 'candidate-extraction', 'technical-validation', 'behavioral-alignment', 'evaluation-aggregator', 'decision-agent'],
  priorityNotes: 'Fallback plan — orchestrator parsing failed',
  estimatedComplexity: 'medium',
  riskLevel: 'medium',
  parallelExecution: false,
  requiresHumanReview: true,
  githubAnalysisRequired: true,
  planningConfidence: 50,
  executionStrategy: { candidateProcessing: 'sequential', batchSize: 3 },
  recommendedWeights: { skills: 40, technical: 35, culture: 25 },
}

function buildOrchestratorMeta(result: PipelinePlan): AgentMeta {
  const confidence = result.planningConfidence ?? 75
  return {
    confidenceScore: confidence,
    evidenceQuality: confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low',
    reasoningSummary: result.priorityNotes ?? 'Pipeline orchestration plan generated',
    missingEvidence: result.requiresHumanReview ? ['incomplete job context detected'] : [],
    warnings: result.riskLevel === 'high' ? ['high pipeline risk detected'] : [],
  }
}

export async function runOrchestrator(job: {
  id: string
  title: string
  department?: string | null
  experienceLevel?: string | null
  description: string
}, candidateCount: number): Promise<WithMeta<PipelinePlan>> {
  const prompt = `You are the Orchestrator Agent for Pratibha AI, an autonomous enterprise-grade multi-agent recruitment platform.

You are the root controller of the entire recruitment pipeline.

Your responsibility is NOT to evaluate candidates.
Your responsibility is NOT to generate hiring decisions.
Your responsibility is ONLY to:
- analyze incoming job context
- analyze candidate batch characteristics
- determine optimal pipeline execution strategy
- decide which downstream agents should run
- define execution order
- configure workflow priorities
- produce structured orchestration metadata

You act as the centralized planning and routing layer for all downstream agents.

━━━━━━━━━━━━━━━━━━━━
SYSTEM RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━

You must:
1. Analyze the job role complexity
2. Analyze candidate batch size
3. Determine orchestration complexity
4. Configure execution strategy (sequential / parallel / batched)
5. Configure downstream processing priorities
6. Detect high-risk or incomplete job contexts
7. Decide whether human review may be required
8. Determine recommended scoring weights for this specific role type
9. Generate structured pipeline session metadata
10. Return ONLY valid JSON

━━━━━━━━━━━━━━━━━━━━
DOWNSTREAM AGENTS
━━━━━━━━━━━━━━━━━━━━

1. job-intelligence — extracts structured Hiring Blueprint from JD
2. candidate-extraction — parses resumes into structured candidate profiles
3. verification-risk — detects fraud, inflated claims, timeline inconsistencies
4. technical-validation — analyzes GitHub activity, repositories, portfolio depth
5. behavioral-alignment — evaluates leadership, collaboration, culture fit signals
6. evaluation-aggregator — combines weighted scores into final ranking
7. decision-agent — generates explainable hiring recommendations and interview questions

━━━━━━━━━━━━━━━━━━━━
ORCHESTRATION RULES
━━━━━━━━━━━━━━━━━━━━

- Always run job-intelligence first
- candidate-extraction runs once per resume
- Skip technical-validation if no GitHub URL is likely (non-technical roles)
- High candidate volume triggers parallel execution
- Senior or specialist roles: prioritize technical validation (technical weight 40–50%)
- Leadership or management roles: increase culture-fit weighting (culture 35–45%)
- Standard roles: use default weights (skills 40%, technical 35%, culture 25%)
- Incomplete or ambiguous JDs should increase riskLevel
- Never hallucinate candidate information
- Never fabricate missing data
- Never generate candidate scores yourself

━━━━━━━━━━━━━━━━━━━━
COMPLEXITY GUIDELINES
━━━━━━━━━━━━━━━━━━━━

LOW: 1–3 candidates, junior or internship role, simple requirements
MEDIUM: 4–10 candidates, mid-level roles, mixed technical requirements
HIGH: 10+ candidates, senior/specialist/leadership roles, highly technical

━━━━━━━━━━━━━━━━━━━━
EXECUTION STRATEGY RULES
━━━━━━━━━━━━━━━━━━━━

≤3 candidates → sequential, batchSize: 3
4–15 candidates → parallel, batchSize: 5
>15 candidates → parallel batched, batchSize: 10

━━━━━━━━━━━━━━━━━━━━
SCORING WEIGHT GUIDELINES
━━━━━━━━━━━━━━━━━━━━

The three weights (skills + technical + culture) must always sum to 100.

Senior Engineer / Architect / ML / Data roles:
  skills: 30, technical: 50, culture: 20

Management / Leadership / HR / Operations roles:
  skills: 35, technical: 25, culture: 40

Standard / Mid-level / Full-stack roles:
  skills: 40, technical: 35, culture: 25

planningConfidence: how confident you are in this plan (0–100).
  - 90+ → clear JD, well-defined requirements
  - 70–89 → some ambiguity in JD or role scope
  - <70 → set requiresHumanReview: true

━━━━━━━━━━━━━━━━━━━━
JOB CONTEXT
━━━━━━━━━━━━━━━━━━━━

Job ID: ${job.id}
Title: ${job.title}
Department: ${job.department ?? 'Not specified'}
Experience Level: ${job.experienceLevel ?? 'Not specified'}
Description (first 600 chars): ${job.description.slice(0, 600)}
Total candidates to screen: ${candidateCount}

━━━━━━━━━━━━━━━━━━━━
OUTPUT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON. No markdown, no explanations, no code blocks.
sessionId format: pipe_${job.id.slice(0, 8)}_<timestamp_ms>`

  // ── Original Gemini call — unchanged ──────────────────────────────────────
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          jobTitle: { type: 'string' },
          totalCandidates: { type: 'number' },
          agentsToRun: { type: 'array', items: { type: 'string' } },
          priorityNotes: { type: 'string' },
          estimatedComplexity: { type: 'string' },
          riskLevel: { type: 'string' },
          parallelExecution: { type: 'boolean' },
          requiresHumanReview: { type: 'boolean' },
          githubAnalysisRequired: { type: 'boolean' },
          planningConfidence: { type: 'number' },
          executionStrategy: {
            type: 'object',
            properties: {
              candidateProcessing: { type: 'string' },
              batchSize: { type: 'number' },
            },
          },
          recommendedWeights: {
            type: 'object',
            properties: {
              skills: { type: 'number' },
              technical: { type: 'number' },
              culture: { type: 'number' },
            },
          },
        },
      },
    },
  })

  // ── Safe parse + meta (new) ────────────────────────────────────────────────
  let rawResult: PipelinePlan
  try { rawResult = JSON.parse(response.text ?? '{}') as PipelinePlan }
  catch { rawResult = { ...ORCHESTRATOR_FALLBACK } }

  const meta = buildOrchestratorMeta(rawResult)
  const exec: AgentExecutionState = { status: 'success', fallbackUsed: false, retryCount: 0, executionTimeMs: 0 }
  return { ...rawResult, meta, exec }
}

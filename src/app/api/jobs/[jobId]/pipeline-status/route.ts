import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { candidates, agentRuns } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/auth'

const AGENT_ORDER = [
  'orchestrator', 'job-intelligence', 'candidate-extraction', 'verification-risk',
  'technical-validation', 'behavioral-alignment', 'evaluation-aggregator', 'decision-agent', 'report-generator',
]
const JOB_LEVEL_AGENTS = new Set(['orchestrator', 'job-intelligence'])

type AgentOutput = Record<string, unknown>

function buildSummary(agentName: string, outputs: AgentOutput[]): string {
  switch (agentName) {
    case 'orchestrator': {
      const count = (outputs[0]?.candidateCount as number) ?? outputs.length
      return `Pipeline planned — ${count} candidate${count !== 1 ? 's' : ''} queued`
    }
    case 'job-intelligence': {
      const archetype = (outputs[0]?.roleArchetype as string) ?? 'unknown'
      const skillsCount = (outputs[0]?.requiredSkillsCount as number) ?? 0
      const label = archetype.charAt(0).toUpperCase() + archetype.slice(1)
      return `${label} role — ${skillsCount} required skills extracted`
    }
    case 'candidate-extraction': {
      const c = outputs.length
      return `${c} resume${c !== 1 ? 's' : ''} parsed`
    }
    case 'verification-risk': {
      const flagged = outputs.filter(o => (o.riskLevel as string) !== 'low').length
      return flagged > 0 ? `Risk complete — ${flagged} flagged` : 'Risk complete — no flags detected'
    }
    case 'technical-validation': {
      const scores = outputs.map(o => (o.score as number) ?? 0)
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      return `Tech validated — avg score ${avg}/100`
    }
    case 'behavioral-alignment': {
      const scores = outputs.map(o => (o.score as number) ?? 0)
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      return `Culture evaluated — avg score ${avg}/100`
    }
    case 'evaluation-aggregator': {
      const strong = outputs.filter(o => (o.recommendation as string) === 'strong_hire').length
      const consider = outputs.filter(o => (o.recommendation as string) === 'consider').length
      const notRec = outputs.filter(o => (o.recommendation as string) === 'not_recommended').length
      return `Ranked: ${strong} Strong Hire, ${consider} Consider, ${notRec} Not Recommended`
    }
    case 'decision-agent': {
      const strong = outputs.filter(o => (o.recommendation as string) === 'strong_hire').length
      return `Decisions ready — ${strong} strong hire`
    }
    case 'report-generator': {
      const c = outputs.length
      return `${c} recruiter report${c !== 1 ? 's' : ''} ready`
    }
    default:
      return `${outputs.length} completed`
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    await getOrCreateUser()
    const { jobId } = await params

    const allCandidates = await db.select().from(candidates).where(eq(candidates.jobId, jobId))
    const total = allCandidates.length
    const screened = allCandidates.filter(c => c.status === 'screened').length

    const failedRuns = await db
      .select()
      .from(agentRuns)
      .where(and(eq(agentRuns.jobId, jobId), eq(agentRuns.status, 'failed'), eq(agentRuns.agentName, 'full-pipeline')))
      .then(r => r.length)

    const isComplete = total > 0 && (screened + failedRuns) >= total

    // Fetch all agentRuns for this job
    const allRuns = await db.select().from(agentRuns).where(eq(agentRuns.jobId, jobId))

    // Group by agentName (skip full-pipeline)
    const byAgent: Record<string, typeof allRuns> = {}
    for (const run of allRuns) {
      if (run.agentName === 'full-pipeline') continue
      if (!byAgent[run.agentName]) byAgent[run.agentName] = []
      byAgent[run.agentName].push(run)
    }

    const agents = AGENT_ORDER.map(name => {
      const runs = byAgent[name] ?? []
      const completedRuns = runs.filter(r => r.status === 'completed')
      const completed = completedRuns.length
      const agentTotal = JOB_LEVEL_AGENTS.has(name) ? 1 : total

      const durations = runs.filter(r => r.durationMs != null).map(r => r.durationMs as number)
      const avgDurationMs = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null

      const outputs = completedRuns
        .map(r => r.output as AgentOutput | null)
        .filter((o): o is AgentOutput => o !== null)

      const summary = completed > 0 ? buildSummary(name, outputs) : ''

      return { name, completed, total: agentTotal, avgDurationMs, summary }
    })

    return NextResponse.json({ total, screened, isComplete, agents })
  } catch (err) {
    console.error('[pipeline-status]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

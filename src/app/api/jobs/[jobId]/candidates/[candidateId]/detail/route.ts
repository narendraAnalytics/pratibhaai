import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { agentRuns, candidates } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string; candidateId: string }> },
) {
  try {
    await getOrCreateUser()
    const { candidateId } = await params

    const [candidate] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, candidateId))
      .limit(1)

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const [run] = await db
      .select({ output: agentRuns.output, durationMs: agentRuns.durationMs })
      .from(agentRuns)
      .where(and(eq(agentRuns.candidateId, candidateId), eq(agentRuns.agentName, 'full-pipeline')))
      .limit(1)

    return NextResponse.json({
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        status: candidate.status,
        resumeName: candidate.resumeName,
      },
      pipeline: run?.output ?? null,
      durationMs: run?.durationMs ?? null,
    })
  } catch (err) {
    console.error('GET candidate detail error:', err)
    return NextResponse.json({ error: 'Failed to fetch candidate detail' }, { status: 500 })
  }
}

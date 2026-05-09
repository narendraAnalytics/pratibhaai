import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { candidates, agentRuns } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/auth'

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

    const processed = screened + failedRuns
    const isComplete = total > 0 && processed >= total

    return NextResponse.json({ total, screened, isComplete })
  } catch (err) {
    console.error('[pipeline-status]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { candidates, evaluations, agentRuns } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    await getOrCreateUser()
    const { jobId } = await params

    const jobCandidates = await db
      .select()
      .from(candidates)
      .where(eq(candidates.jobId, jobId))

    const results = await Promise.all(
      jobCandidates.map(async (c) => {
        const [evaluation] = await db
          .select()
          .from(evaluations)
          .where(eq(evaluations.candidateId, c.id))
          .limit(1)

        const [run] = await db
          .select({ output: agentRuns.output })
          .from(agentRuns)
          .where(and(eq(agentRuns.candidateId, c.id), eq(agentRuns.agentName, 'full-pipeline')))
          .limit(1)

        const output = run?.output as Record<string, unknown> | null
        const report = output?.report as Record<string, unknown> | null
        const profile = output?.profile as Record<string, unknown> | null

        return {
          id: c.id,
          name: c.name ?? report?.candidateName ?? 'Unknown',
          email: c.email ?? (profile?.email as string | null) ?? null,
          status: c.status,
          compositeScore: evaluation?.compositeScore ?? (report?.compositeScore as number | null) ?? null,
          recommendation: evaluation?.recommendation ?? (report?.recommendation as string | null) ?? null,
          matchedSkills: (report?.matchedSkills as string[]) ?? [],
          missingSkills: (report?.missingSkills as string[]) ?? [],
          githubUrl: (report?.githubUrl as string | null) ?? (profile?.githubUrl as string | null) ?? null,
          dashboardSummary: (report?.dashboardSummary as string | null) ?? null,
          resumeSummary: (report?.resumeSummary as string | null) ?? null,
          nextRecommendedStage: (report?.nextRecommendedStage as string | null) ?? null,
        }
      }),
    )

    results.sort((a, b) => (b.compositeScore ?? 0) - (a.compositeScore ?? 0))

    return NextResponse.json({ candidates: results })
  } catch (err) {
    console.error('GET /api/jobs/[jobId]/results error:', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

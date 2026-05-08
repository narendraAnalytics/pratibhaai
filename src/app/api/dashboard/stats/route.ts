import { NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { jobs, candidates, reports, evaluations } from '@/db/schema'
import { eq, count, avg, inArray } from 'drizzle-orm'

export async function GET() {
  try {
    const user = await getOrCreateUser()

    const [jobCount] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.userId, user.id))

    // Candidates linked through jobs owned by user
    const userJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.userId, user.id))

    const jobIds = userJobs.map(j => j.id)

    let candidateCount = 0
    let reportCount = 0
    let avgComposite = 0

    if (jobIds.length > 0) {
      const [cCount] = await db
        .select({ count: count() })
        .from(candidates)
        .where(inArray(candidates.jobId, jobIds))

      candidateCount = Number(cCount.count ?? 0)

      const userCandidates = await db
        .select({ id: candidates.id })
        .from(candidates)
        .where(inArray(candidates.jobId, jobIds))

      const candidateIds = userCandidates.map(c => c.id)

      if (candidateIds.length > 0) {
        const [rCount] = await db
          .select({ count: count() })
          .from(reports)
          .where(inArray(reports.candidateId, candidateIds))

        reportCount = Number(rCount.count ?? 0)

        const [scoreAvg] = await db
          .select({ avg: avg(evaluations.compositeScore) })
          .from(evaluations)
          .where(inArray(evaluations.candidateId, candidateIds))

        avgComposite = scoreAvg.avg ? Math.round(Number(scoreAvg.avg)) : 0
      }
    }

    return NextResponse.json({
      jobs: Number(jobCount.count ?? 0),
      candidates: candidateCount,
      reports: reportCount,
      avgScore: avgComposite,
    })
  } catch {
    return NextResponse.json({ jobs: 0, candidates: 0, reports: 0, avgScore: 0 })
  }
}

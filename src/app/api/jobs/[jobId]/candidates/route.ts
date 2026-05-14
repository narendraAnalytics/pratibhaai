import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { candidates } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { getPlanLimits } from '@/lib/plans'

export async function POST(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await getOrCreateUser()
    const { jobId } = await params

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Check resume-per-job limit
    const limits = getPlanLimits(user.plan)
    const [{ existingCount }] = await db
      .select({ existingCount: count() })
      .from(candidates)
      .where(eq(candidates.jobId, jobId))

    const existing = Number(existingCount)
    if (existing + files.length > limits.resumesPerJob) {
      const remaining = Math.max(0, limits.resumesPerJob - existing)
      return NextResponse.json(
        {
          error: `Your ${user.plan} plan allows ${limits.resumesPerJob} resumes per job. ${existing} uploaded, ${remaining} slot${remaining === 1 ? '' : 's'} remaining.`,
          limitReached: true,
          remaining,
        },
        { status: 403 }
      )
    }

    const inserted = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        const [candidate] = await db.insert(candidates).values({
          jobId,
          resumeContent: base64,
          resumeName: file.name,
          resumeSize: file.size,
          status: 'pending',
        }).returning()

        return candidate
      })
    )

    return NextResponse.json({ candidates: inserted }, { status: 201 })
  } catch (err) {
    console.error('POST /api/jobs/[jobId]/candidates error:', err)
    return NextResponse.json({ error: 'Failed to upload resumes' }, { status: 500 })
  }
}

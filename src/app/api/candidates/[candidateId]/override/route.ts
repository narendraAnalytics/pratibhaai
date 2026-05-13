import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { candidates, jobs, overrides, reports } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateUser } from '@/lib/auth'
import { sendInterviewInvitation } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> },
) {
  try {
    const user = await getOrCreateUser()
    const { candidateId } = await params
    const { action } = await req.json() as { action: string }

    if (!action) return NextResponse.json({ error: 'action required' }, { status: 400 })

    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, candidateId)).limit(1)
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })

    const [job] = await db.select().from(jobs).where(eq(jobs.id, candidate.jobId)).limit(1)

    await db.insert(overrides).values({ candidateId, userId: user.id, action })
    await db.update(candidates).set({ status: action }).where(eq(candidates.id, candidateId))

    let emailSent = false
    if (action === 'interview') {
      if (candidate.email) {
        const result = await sendInterviewInvitation({
          to: candidate.email,
          candidateName: candidate.name ?? 'Candidate',
          jobTitle: job?.title ?? 'the role',
          companyName: 'Pratibha AI',
          recruiterName: 'Hiring Team',
        })
        emailSent = result.success
      }
      await db.update(reports)
        .set({ emailSent, emailSentAt: emailSent ? new Date() : null })
        .where(eq(reports.candidateId, candidateId))
    }

    return NextResponse.json({ success: true, emailSent })
  } catch (err) {
    console.error('[override]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

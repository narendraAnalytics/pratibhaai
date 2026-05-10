import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { jobs, candidates } from '@/db/schema'
import { eq, count } from 'drizzle-orm'

export async function GET() {
  try {
    const user = await getOrCreateUser()

    const rows = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        status: jobs.status,
        createdAt: jobs.createdAt,
        candidateCount: count(candidates.id),
      })
      .from(jobs)
      .leftJoin(candidates, eq(candidates.jobId, jobs.id))
      .where(eq(jobs.userId, user.id))
      .groupBy(jobs.id)
      .orderBy(jobs.createdAt)

    return NextResponse.json({ jobs: rows })
  } catch (err) {
    console.error('GET /api/jobs error:', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser()
    const body = await req.json()

    const { title, department, description, locationType, jobType, experienceLevel, skills } = body

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const [job] = await db.insert(jobs).values({
      userId: user.id,
      title: title.trim(),
      department: department?.trim() || null,
      description: description.trim(),
      locationType: locationType ?? 'remote',
      jobType: jobType ?? 'full-time',
      experienceLevel: experienceLevel ?? 'mid',
      skills: skills ?? [],
      status: 'active',
    }).returning()

    return NextResponse.json({ job }, { status: 201 })
  } catch (err) {
    console.error('POST /api/jobs error:', err)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}

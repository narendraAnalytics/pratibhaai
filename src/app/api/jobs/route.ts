import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { jobs } from '@/db/schema'

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

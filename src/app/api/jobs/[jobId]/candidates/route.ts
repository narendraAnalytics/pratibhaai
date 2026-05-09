import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { candidates } from '@/db/schema'

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    await getOrCreateUser()
    const { jobId } = params

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
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

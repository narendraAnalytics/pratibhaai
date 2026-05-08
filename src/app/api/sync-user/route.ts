import { NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'

export async function POST() {
  try {
    const user = await getOrCreateUser()
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}

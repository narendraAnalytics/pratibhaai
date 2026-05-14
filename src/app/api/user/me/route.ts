import { NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getOrCreateUser()
    return NextResponse.json({ plan: user.plan, name: user.name })
  } catch {
    return NextResponse.json({ plan: 'free', name: null })
  }
}

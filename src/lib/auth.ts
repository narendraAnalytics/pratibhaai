import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const VALID_PLANS = ['free', 'plus', 'pro'] as const
type ValidPlan = typeof VALID_PLANS[number]

export async function getOrCreateUser() {
  const { userId, has } = await auth()
  if (!userId) throw new Error('Unauthorized')

  // Clerk Billing plan check — correct for plans created in Clerk Dashboard Billing
  const clerkPlan: ValidPlan = has({ plan: 'pro' }) ? 'pro'
                             : has({ plan: 'plus' }) ? 'plus'
                             : 'free'

  const [existing] = await db.select().from(users).where(eq(users.id, userId))

  if (existing) {
    if (existing.plan !== clerkPlan) {
      const [updated] = await db
        .update(users)
        .set({ plan: clerkPlan })
        .where(eq(users.id, userId))
        .returning()
      return updated
    }
    return existing
  }

  // First login — create row (currentUser() needed for email/name only)
  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error('Clerk user not found')

  const [newUser] = await db.insert(users).values({
    id: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
    username: clerkUser.username ?? null,
    name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
    plan: clerkPlan,
  }).returning()

  return newUser
}

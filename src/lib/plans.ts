export const PLAN_LIMITS = {
  free: { jobsPerMonth: 1, resumesPerJob: 3 },
  plus: { jobsPerMonth: 5, resumesPerJob: 10 },
  pro:  { jobsPerMonth: 15, resumesPerJob: 25 },
} as const

export type PlanKey = keyof typeof PLAN_LIMITS

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[(plan as PlanKey)] ?? PLAN_LIMITS.free
}

export const PLAN_BADGE = {
  free: { label: 'Free', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.15)' },
  plus: { label: 'Plus', color: '#9333EA', bg: 'rgba(147,51,234,0.10)', border: 'rgba(147,51,234,0.20)' },
  pro:  { label: 'Pro',  color: '#D97706', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.20)'  },
} as const

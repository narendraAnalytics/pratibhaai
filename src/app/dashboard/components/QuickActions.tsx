'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Sparkles, Lock, ArrowUpRight } from 'lucide-react'
import { PLAN_BADGE } from '@/lib/plans'
import type { PlanKey } from '@/lib/plans'

const shadowSm = '0 1px 0 oklch(0.88 0.025 75 / .6), 0 2px 6px oklch(0.6 0.05 60 / .04)'
const shadowHover = '0 1px 0 oklch(0.88 0.025 75 / .6), 0 8px 24px -8px oklch(0.55 0.06 60 / .10)'

interface UsageData {
  plan: string
  usage: { jobsThisMonth: number; jobsLimit: number }
}

export function QuickActions() {
  const [usage, setUsage] = useState<UsageData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setUsage)
      .catch(() => {})
  }, [])

  const plan = (usage?.plan ?? 'free') as PlanKey
  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.free
  const jobsThisMonth = usage?.usage.jobsThisMonth ?? 0
  const jobsLimit = usage?.usage.jobsLimit ?? 1
  const atLimit = usage !== null && jobsThisMonth >= jobsLimit

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} style={{ color: '#7C3AED' }} />
        <h2 style={{
          fontFamily: 'var(--font-instrument-serif, Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 22,
          fontWeight: 400,
          margin: 0,
          color: 'oklch(0.32 0.025 35)',
          letterSpacing: '-0.005em',
        }}>
          Start Hiring
        </h2>
      </div>

      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          {!atLimit ? (
            /* ── Normal state: navigable card ── */
            <motion.a
              key="active"
              href="/dashboard/jobs/new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              whileHover={{ y: -2, boxShadow: shadowHover }}
              className="group rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: 'linear-gradient(135deg, oklch(0.975 0.025 305), oklch(0.988 0.008 80))',
                border: '1px solid oklch(0.88 0.022 75)',
                boxShadow: shadowSm,
                textDecoration: 'none',
                minWidth: 280,
              }}
            >
              <div className="flex items-start justify-between">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'oklch(0.93 0.05 305)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Briefcase size={18} style={{ color: '#4B1F9B' }} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 999,
                  background: 'oklch(0.93 0.05 305)',
                  color: '#4B1F9B',
                }}>
                  Step 1
                </span>
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 14, color: 'oklch(0.32 0.025 35)', margin: '0 0 4px' }}>
                  Post a New Job
                </h3>
                <p style={{ fontSize: 12, color: 'oklch(0.62 0.022 50)', lineHeight: 1.5, margin: 0 }}>
                  Define role requirements and let AI build the hiring blueprint automatically.
                </p>
              </div>
            </motion.a>
          ) : (
            /* ── Blocked state ── */
            <motion.div
              key="blocked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(220,38,38,0.04), oklch(0.988 0.008 80))',
                border: '1px solid rgba(220,38,38,0.20)',
                boxShadow: shadowSm,
                minWidth: 280,
                cursor: 'not-allowed',
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(220,38,38,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Lock size={16} style={{ color: '#DC2626' }} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(220,38,38,0.08)',
                  color: '#DC2626',
                }}>
                  Limit Reached
                </span>
              </div>

              {/* Message */}
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 14, color: 'oklch(0.32 0.025 35)', margin: '0 0 6px' }}>
                  Post a New Job
                </h3>
                <p style={{ fontSize: 12.5, color: '#DC2626', fontWeight: 500, margin: '0 0 4px' }}>
                  You&apos;ve used{' '}
                  <strong>{jobsThisMonth}/{jobsLimit}</strong>{' '}
                  job{jobsLimit === 1 ? '' : 's'} this month on the{' '}
                  <span style={{ textTransform: 'capitalize' }}>{badge.label}</span> plan.
                </p>
                <p style={{ fontSize: 12, color: 'oklch(0.62 0.022 50)', lineHeight: 1.5, margin: 0 }}>
                  Your monthly limit resets on the 1st. Upgrade to post more jobs now.
                </p>
              </div>

              {/* Upgrade CTA */}
              <a
                href="/#pricing"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  alignSelf: 'flex-start',
                  fontSize: 12.5, fontWeight: 700,
                  color: badge.color,
                  background: badge.bg,
                  border: `1px solid ${badge.border}`,
                  borderRadius: 10,
                  padding: '7px 14px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
              >
                Upgrade Plan <ArrowUpRight size={13} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

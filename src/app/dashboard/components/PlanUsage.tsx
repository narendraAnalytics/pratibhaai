'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Lock, ArrowUpRight } from 'lucide-react'
import { PLAN_BADGE } from '@/lib/plans'
import type { PlanKey } from '@/lib/plans'

interface StatsResponse {
  plan: string
  usage: { jobsThisMonth: number; jobsLimit: number }
}

export function PlanUsage() {
  const [data, setData] = useState<StatsResponse | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return null

  const plan = (data.plan ?? 'free') as PlanKey
  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.free
  const { jobsThisMonth, jobsLimit } = data.usage
  const pct = Math.min((jobsThisMonth / jobsLimit) * 100, 100)
  const atLimit = jobsThisMonth >= jobsLimit

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      style={{
        background: 'oklch(0.988 0.008 80)',
        border: '1px solid oklch(0.88 0.022 75)',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 1px 0 oklch(0.88 0.025 75 / .6), 0 2px 6px oklch(0.6 0.05 60 / .04)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      {/* Plan pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={13} style={{ color: badge.color }} />
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: badge.color,
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          borderRadius: 8,
          padding: '3px 10px',
          textTransform: 'capitalize',
          letterSpacing: '.03em',
        }}>
          {badge.label}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: 'oklch(0.88 0.022 75)', flexShrink: 0 }} />

      {/* Jobs usage */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'oklch(0.46 0.025 40)' }}>
            Jobs this month
          </span>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: atLimit ? '#DC2626' : 'oklch(0.32 0.025 35)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {jobsThisMonth}/{jobsLimit}
          </span>
        </div>
        <div style={{
          height: 6, borderRadius: 99,
          background: 'oklch(0.90 0.015 75)',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
            style={{
              height: '100%', borderRadius: 99,
              background: atLimit
                ? 'linear-gradient(90deg,#EF4444,#DC2626)'
                : `linear-gradient(90deg,${badge.color},${badge.color}99)`,
            }}
          />
        </div>
      </div>

      {/* Limit reached warning */}
      {atLimit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 10,
            background: 'rgba(220,38,38,0.06)',
            border: '1px solid rgba(220,38,38,0.18)',
            flexShrink: 0,
          }}
        >
          <Lock size={11} style={{ color: '#DC2626' }} />
          <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
            Limit reached
          </span>
        </motion.div>
      )}

      {/* Upgrade CTA */}
      {plan !== 'pro' && (
        <a
          href="/#pricing"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 600,
            color: badge.color,
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: 10,
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            flexShrink: 0,
            transition: 'opacity 0.15s',
          }}
        >
          Upgrade <ArrowUpRight size={12} />
        </a>
      )}
    </motion.div>
  )
}

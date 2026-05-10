'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Users, BarChart3, FileText } from 'lucide-react'

interface Stats {
  jobs: number
  candidates: number
  avgScore: number
  reports: number
}

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return <>{count}</>
}

const cardConfig = [
  {
    key: 'jobs' as keyof Stats,
    label: 'Active Jobs',
    icon: Briefcase,
    color: '#7C3AED',
    accentSoft: 'oklch(0.93 0.05 305)',
    accentInk: '#4B1F9B',
    glow: '#7C3AED',
    suffix: '',
    description: 'Open positions',
  },
  {
    key: 'candidates' as keyof Stats,
    label: 'Candidates Screened',
    icon: Users,
    color: 'oklch(0.84 0.07 155)',
    accentSoft: 'oklch(0.95 0.03 155)',
    accentInk: 'oklch(0.40 0.08 155)',
    glow: 'oklch(0.84 0.07 155)',
    suffix: '',
    description: 'AI-evaluated profiles',
  },
  {
    key: 'avgScore' as keyof Stats,
    label: 'Avg Composite Score',
    icon: BarChart3,
    color: 'oklch(0.86 0.10 90)',
    accentSoft: 'oklch(0.96 0.04 85)',
    accentInk: 'oklch(0.45 0.10 75)',
    glow: 'oklch(0.86 0.10 90)',
    suffix: '/100',
    description: 'Across all candidates',
  },
  {
    key: 'reports' as keyof Stats,
    label: 'Reports Generated',
    icon: FileText,
    color: 'oklch(0.86 0.09 55)',
    accentSoft: 'oklch(0.95 0.04 60)',
    accentInk: 'oklch(0.42 0.10 45)',
    glow: 'oklch(0.86 0.09 55)',
    suffix: '',
    description: 'PDF + email delivered',
  },
]

const shadowSm = '0 1px 0 oklch(0.88 0.025 75 / .6), 0 2px 6px oklch(0.6 0.05 60 / .04)'
const shadowHover = '0 1px 0 oklch(0.88 0.025 75 / .6), 0 8px 24px -8px oklch(0.55 0.06 60 / .10)'

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({ jobs: 0, candidates: 0, avgScore: 0, reports: 0 })

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cardConfig.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.45, ease: 'easeOut' }}
          whileHover={{ y: -2, boxShadow: shadowHover }}
          className="cursor-default"
          style={{
            background: 'oklch(0.988 0.008 80)',
            border: '1px solid oklch(0.88 0.022 75)',
            borderRadius: 16,
            padding: 18,
            boxShadow: shadowSm,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow blob */}
          <div style={{
            position: 'absolute',
            top: '-40%', right: '-40%',
            width: 220, height: 220,
            borderRadius: '50%',
            background: card.glow,
            opacity: 0.28,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />

          {/* Icon pill */}
          <div style={{
            width: 34, height: 34,
            borderRadius: 10,
            background: card.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <card.icon size={16} style={{ color: card.accentInk }} />
          </div>

          {/* Label */}
          <p style={{
            fontSize: 12.5,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            color: 'oklch(0.46 0.025 40)',
            margin: '0 0 10px',
          }}>
            {card.label}
          </p>

          {/* Number */}
          <p style={{
            fontFamily: 'var(--font-instrument-serif, Georgia, serif)',
            fontStyle: 'italic',
            fontSize: 38,
            fontWeight: 400,
            color: 'oklch(0.32 0.025 35)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            <CountUp target={stats[card.key]} />
            {card.suffix && (
              <span style={{ fontSize: 16, fontWeight: 400, color: 'oklch(0.62 0.022 50)', marginLeft: 2 }}>
                {card.suffix}
              </span>
            )}
          </p>

          {/* Description */}
          <p style={{ fontSize: 12, color: 'oklch(0.62 0.022 50)', margin: '8px 0 0' }}>
            {card.description}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

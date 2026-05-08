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
    iconBg: 'rgba(124,58,237,0.10)',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(168,85,247,0.03))',
    suffix: '',
    description: 'Open positions',
  },
  {
    key: 'candidates' as keyof Stats,
    label: 'Candidates Screened',
    icon: Users,
    color: '#10B981',
    iconBg: 'rgba(16,185,129,0.10)',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(16,185,129,0.03))',
    suffix: '',
    description: 'AI-evaluated profiles',
  },
  {
    key: 'avgScore' as keyof Stats,
    label: 'Avg Composite Score',
    icon: BarChart3,
    color: '#F59E0B',
    iconBg: 'rgba(245,158,11,0.10)',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.07), rgba(245,158,11,0.03))',
    suffix: '/100',
    description: 'Across all candidates',
  },
  {
    key: 'reports' as keyof Stats,
    label: 'Reports Generated',
    icon: FileText,
    color: '#FB7185',
    iconBg: 'rgba(251,113,133,0.10)',
    gradient: 'linear-gradient(135deg, rgba(251,113,133,0.07), rgba(251,113,133,0.03))',
    suffix: '',
    description: 'PDF + email delivered',
  },
]

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({ jobs: 0, candidates: 0, avgScore: 0, reports: 0 })

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
      {cardConfig.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.45, ease: 'easeOut' }}
          whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(124,58,237,0.12)' }}
          className="rounded-2xl p-5 cursor-default"
          style={{
            background: card.gradient,
            border: '1px solid rgba(124,58,237,0.09)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: card.iconBg }}
          >
            <card.icon size={20} style={{ color: card.color }} />
          </div>

          {/* Number */}
          <p className="text-3xl font-bold mb-1" style={{ color: '#1F1035' }}>
            <CountUp target={stats[card.key]} />
            <span className="text-base font-normal text-slate-400 ml-1">{card.suffix}</span>
          </p>

          {/* Label */}
          <p className="text-sm font-semibold text-slate-700">{card.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
        </motion.div>
      ))}
    </div>
  )
}

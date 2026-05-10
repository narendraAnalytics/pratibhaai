'use client'

import { motion } from 'framer-motion'
import { Briefcase, Sparkles } from 'lucide-react'

const actions = [
  {
    icon: Briefcase,
    title: 'Post a New Job',
    description: 'Define role requirements and let AI build the hiring blueprint automatically.',
    href: '/dashboard/jobs/new',
    badge: 'Step 1',
  },
]

const shadowSm = '0 1px 0 oklch(0.88 0.025 75 / .6), 0 2px 6px oklch(0.6 0.05 60 / .04)'
const shadowHover = '0 1px 0 oklch(0.88 0.025 75 / .6), 0 8px 24px -8px oklch(0.55 0.06 60 / .10)'

export function QuickActions() {
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
        {actions.map((action, i) => (
          <motion.a
            key={action.title}
            href={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.25, duration: 0.4 }}
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
                width: 36, height: 36,
                borderRadius: 10,
                background: 'oklch(0.93 0.05 305)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <action.icon size={18} style={{ color: '#4B1F9B' }} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'oklch(0.93 0.05 305)',
                color: '#4B1F9B',
              }}>
                {action.badge}
              </span>
            </div>

            <div>
              <h3 style={{
                fontWeight: 600,
                fontSize: 14,
                color: 'oklch(0.32 0.025 35)',
                margin: '0 0 4px',
              }}>
                {action.title}
              </h3>
              <p style={{ fontSize: 12, color: 'oklch(0.62 0.022 50)', lineHeight: 1.5, margin: 0 }}>
                {action.description}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

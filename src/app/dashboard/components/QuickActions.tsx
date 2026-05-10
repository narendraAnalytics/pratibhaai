'use client'

import { motion } from 'framer-motion'
import { Briefcase, Sparkles } from 'lucide-react'

const actions = [
  {
    icon: Briefcase,
    title: 'Post a New Job',
    description: 'Define role requirements and let AI build the hiring blueprint automatically.',
    color: '#7C3AED',
    bg: 'linear-gradient(135deg, rgba(124,58,237,0.09), rgba(168,85,247,0.05))',
    border: 'rgba(124,58,237,0.14)',
    href: '/dashboard/jobs/new',
    badge: 'Step 1',
  },
]

export function QuickActions() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-500" />
        <h2 className="text-base font-semibold text-slate-700">Start Hiring</h2>
      </div>

      <div className="flex justify-center">
        {actions.map((action, i) => (
          <motion.a
            key={action.title}
            href={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.25, duration: 0.4 }}
            whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
            className="group rounded-2xl p-5 flex flex-col gap-3 no-underline"
            style={{
              background: action.bg,
              border: `1px solid ${action.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              textDecoration: 'none',
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ color: action.color, background: 'rgba(255,255,255,0.75)' }}
              >
                {action.badge}
              </span>
            </div>

            <div>
              <h3
                className="font-semibold text-slate-800 text-sm mb-1 transition-colors group-hover:text-violet-700"
              >
                {action.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{action.description}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

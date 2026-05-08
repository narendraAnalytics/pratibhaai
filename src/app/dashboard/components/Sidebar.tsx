'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/dashboard/candidates', icon: Users, label: 'Candidates' },
  { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #F0EEFF 0%, #FFFBF0 100%)',
        borderRight: '1px solid rgba(124,58,237,0.10)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-6 py-6 border-b border-violet-100 hover:opacity-80 transition-opacity">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
        >
          <Sparkles size={16} className="text-white" />
        </motion.div>
        <span
          className="font-bold text-lg"
          style={{
            background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Pratibha AI
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-violet-700'
                    : 'text-slate-500 hover:text-violet-600 hover:bg-violet-50'
                }`}
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(90deg, rgba(124,58,237,0.12), rgba(168,85,247,0.06))',
                        border: '1px solid rgba(124,58,237,0.15)',
                      }
                    : {}
                }
              >
                <item.icon
                  size={18}
                  className={
                    isActive
                      ? 'text-violet-600'
                      : 'text-slate-400 group-hover:text-violet-500'
                  }
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-violet-400" />}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Plan badge */}
      <div className="px-4 pb-6">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(168,85,247,0.05))',
            border: '1px solid rgba(124,58,237,0.12)',
          }}
        >
          <p className="text-xs font-semibold text-violet-600 mb-1">Free Plan</p>
          <p className="text-xs text-slate-500 mb-3">Upgrade to run AI agents</p>
          <button
            className="w-full text-xs font-semibold text-white py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #A855F7)' }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

'use client'

import { motion } from 'framer-motion'
import { useUser, UserButton } from '@clerk/nextjs'
import { Bell, Search } from 'lucide-react'

export function DashboardHeader() {
  const { user } = useUser()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const firstName = user?.firstName ?? user?.username ?? 'there'

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center justify-between px-8 py-5 border-b"
      style={{
        background: 'rgba(250,250,250,0.85)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(124,58,237,0.08)',
      }}
    >
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {greeting},{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {firstName}!
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Here&apos;s what&apos;s happening with your hiring pipeline.
        </p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search pill */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-slate-400 cursor-pointer hover:bg-violet-50 transition-colors"
          style={{ border: '1px solid rgba(124,58,237,0.12)', background: 'white' }}
        >
          <Search size={15} />
          <span>Search…</span>
          <kbd
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-violet-50 transition-colors"
          style={{ border: '1px solid rgba(124,58,237,0.12)', background: 'white' }}
        >
          <Bell size={16} className="text-slate-500" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#7C3AED' }}
          />
        </button>

        {/* Clerk UserButton */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9',
            },
          }}
        />
      </div>
    </motion.header>
  )
}

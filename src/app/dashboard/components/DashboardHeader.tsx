'use client'

import { motion } from 'framer-motion'
import { useUser, UserButton } from '@clerk/nextjs'
import { Bell, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'

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
      className="flex items-center px-8 py-5 border-b"
      style={{
        background: 'rgba(250,250,250,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(124,58,237,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Greeting — left */}
      <div className="flex-1">
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

      {/* Logo — center */}
      <Link
        href="/"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        style={{ textDecoration: 'none', flexShrink: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
        >
          <Sparkles size={15} className="text-white" />
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
          title="Notifications"
          aria-label="Notifications"
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

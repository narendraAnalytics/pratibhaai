'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Plus, Clock, ArrowRight } from 'lucide-react'

interface JobRow {
  id: string
  title: string
  status: string
  createdAt: string
  candidateCount: number
}

const statusColors: Record<string, { color: string; bg: string }> = {
  active:    { color: 'oklch(0.40 0.08 155)', bg: 'oklch(0.95 0.03 155)' },
  screening: { color: '#4B1F9B',              bg: 'oklch(0.93 0.05 305)' },
  closed:    { color: 'oklch(0.62 0.022 50)', bg: 'oklch(0.92 0.018 75)' },
}

const shadowSm = '0 1px 0 oklch(0.88 0.025 75 / .6), 0 2px 6px oklch(0.6 0.05 60 / .04)'

const serifHeader = {
  fontFamily: 'var(--font-instrument-serif, Georgia, serif)',
  fontStyle: 'italic' as const,
  fontSize: 22,
  fontWeight: 400,
  margin: 0,
  color: 'oklch(0.32 0.025 35)',
  letterSpacing: '-0.005em',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function RecentJobs() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => setJobs((data.jobs ?? []).slice().reverse()))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} style={{ color: 'oklch(0.62 0.022 50)' }} />
          <h2 style={serifHeader}>Recent Jobs</h2>
        </div>
        <div style={{
          borderRadius: 16,
          padding: '40px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid oklch(0.88 0.022 75)',
          background: 'oklch(0.988 0.008 80)',
          boxShadow: shadowSm,
        }}>
          <span style={{ fontSize: 13, color: 'oklch(0.62 0.022 50)' }}>Loading…</span>
        </div>
      </section>
    )
  }

  if (jobs.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} style={{ color: 'oklch(0.62 0.022 50)' }} />
          <h2 style={serifHeader}>Recent Jobs</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 px-8 text-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.975 0.025 305), oklch(0.988 0.008 80))',
            border: '1.5px dashed oklch(0.85 0.04 305)',
            borderRadius: 16,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: 'oklch(0.93 0.05 305)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Briefcase size={24} style={{ color: '#4B1F9B' }} />
          </motion.div>
          <h3 style={{ fontWeight: 600, color: 'oklch(0.32 0.025 35)', margin: '0 0 6px' }}>
            No jobs posted yet
          </h3>
          <p style={{ fontSize: 13, color: 'oklch(0.62 0.022 50)', marginBottom: 24, maxWidth: 300, lineHeight: 1.5 }}>
            Post your first job to start the AI screening pipeline and automatically rank candidates.
          </p>
          <a
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Plus size={15} />
            Post First Job
          </a>
        </motion.div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={15} style={{ color: 'oklch(0.62 0.022 50)' }} />
        <h2 style={serifHeader}>Recent Jobs</h2>
      </div>

      <div style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid oklch(0.88 0.022 75)',
        background: 'oklch(0.988 0.008 80)',
        boxShadow: shadowSm,
      }}>
        {jobs.map((job, i) => {
          const s = statusColors[job.status] ?? statusColors.active
          return (
            <motion.a
              key={job.id}
              href={`/dashboard/jobs/${job.id}/results`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i + 0.4 }}
              className="group flex items-center justify-between"
              style={{
                padding: '14px 18px',
                borderBottom: i < jobs.length - 1 ? '1px solid oklch(0.92 0.018 75)' : 'none',
                textDecoration: 'none',
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.955 0.018 70)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-center gap-3">
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: 'oklch(0.93 0.05 305)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Briefcase size={15} style={{ color: '#4B1F9B' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'oklch(0.32 0.025 35)', margin: 0 }}>
                    {job.title}
                  </p>
                  <p style={{ fontSize: 11.5, color: 'oklch(0.62 0.022 50)', margin: '1px 0 0' }}>
                    {formatDate(job.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 12, color: 'oklch(0.46 0.025 40)' }}>
                  {job.candidateCount} candidate{job.candidateCount !== 1 ? 's' : ''}
                </span>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  textTransform: 'capitalize',
                  color: s.color,
                  background: s.bg,
                }}>
                  {job.status}
                </span>
                <ArrowRight size={14} style={{ color: 'oklch(0.80 0.018 75)', transition: 'color .15s' }} />
              </div>
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}

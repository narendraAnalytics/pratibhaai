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
  active:    { color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  screening: { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
  closed:    { color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' },
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
          <Clock size={16} className="text-slate-400" />
          <h2 className="text-base font-semibold text-slate-700">Recent Jobs</h2>
        </div>
        <div className="rounded-2xl py-10 flex items-center justify-center"
          style={{ border: '1px solid rgba(124,58,237,0.09)', background: 'rgba(124,58,237,0.02)' }}>
          <span className="text-sm text-slate-400">Loading…</span>
        </div>
      </section>
    )
  }

  if (jobs.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-slate-400" />
          <h2 className="text-base font-semibold text-slate-700">Recent Jobs</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="rounded-2xl flex flex-col items-center justify-center py-16 px-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(168,85,247,0.02))',
            border: '1.5px dashed rgba(124,58,237,0.18)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(124,58,237,0.08)' }}
          >
            <Briefcase size={24} className="text-violet-400" />
          </motion.div>
          <h3 className="font-semibold text-slate-700 mb-1">No jobs posted yet</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
            Post your first job to start the AI screening pipeline and automatically rank candidates.
          </p>
          <a
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #A855F7)' }}
          >
            <Plus size={16} />
            Post First Job
          </a>
        </motion.div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <h2 className="text-base font-semibold text-slate-700">Recent Jobs</h2>
        </div>
        <a href="/dashboard/jobs/new" className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline font-medium">
          <Plus size={13} /> New Job
        </a>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(124,58,237,0.10)', background: 'white' }}
      >
        {jobs.map((job, i) => {
          const s = statusColors[job.status] ?? statusColors.active
          return (
            <motion.a
              key={job.id}
              href={`/dashboard/jobs/${job.id}/results`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i + 0.4 }}
              className="flex items-center justify-between px-5 py-4 border-b last:border-b-0 hover:bg-violet-50/40 transition-colors cursor-pointer group"
              style={{ borderColor: 'rgba(124,58,237,0.07)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.08)' }}
                >
                  <Briefcase size={16} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{job.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(job.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{job.candidateCount} candidate{job.candidateCount !== 1 ? 's' : ''}</span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                  style={{ color: s.color, background: s.bg }}
                >
                  {job.status}
                </span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-violet-400 transition-colors" />
              </div>
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}

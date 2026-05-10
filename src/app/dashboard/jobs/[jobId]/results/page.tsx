'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Link2, ExternalLink, ChevronRight } from 'lucide-react'

interface CandidateRow {
  id: string
  name: string
  email: string | null
  status: string
  compositeScore: number | null
  recommendation: string | null
  matchedSkills: string[]
  missingSkills: string[]
  githubUrl: string | null
  dashboardSummary: string | null
  resumeSummary: string | null
  nextRecommendedStage: string | null
}

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: '#94A3B8', fontSize: 13 }}>—</span>
  const color = score >= 90 ? '#10B981' : score >= 65 ? '#F59E0B' : '#EF4444'
  const bg    = score >= 90 ? 'rgba(16,185,129,0.10)' : score >= 65 ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.10)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 52, padding: '4px 10px', borderRadius: 999,
      fontSize: 13, fontWeight: 700, color, background: bg,
    }}>
      {score}/100
    </span>
  )
}

function RecommendationBadge({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: '#94A3B8', fontSize: 12 }}>Pending</span>
  const map: Record<string, { color: string; bg: string; label: string }> = {
    'strong_hire':       { color: '#10B981', bg: 'rgba(16,185,129,0.10)', label: 'Strong Hire' },
    'Strong Hire':       { color: '#10B981', bg: 'rgba(16,185,129,0.10)', label: 'Strong Hire' },
    'consider':          { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', label: 'Consider' },
    'Consider':          { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', label: 'Consider' },
    'not_recommended':   { color: '#EF4444', bg: 'rgba(239,68,68,0.10)', label: 'Not Recommended' },
    'Not Recommended':   { color: '#EF4444', bg: 'rgba(239,68,68,0.10)', label: 'Not Recommended' },
  }
  const style = map[value] ?? { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', label: value }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, color: style.color, background: style.bg,
    }}>
      {style.label}
    </span>
  )
}

function SkillPills({ skills, matched }: { skills: string[]; matched: boolean }) {
  if (!skills.length) return <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>
  const color = matched ? '#10B981' : '#EF4444'
  const bg    = matched ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {skills.slice(0, 4).map(s => (
        <span key={s} style={{ fontSize: 11, fontWeight: 500, color, background: bg, padding: '2px 7px', borderRadius: 999 }}>
          {s}
        </span>
      ))}
      {skills.length > 4 && (
        <span style={{ fontSize: 11, color: '#94A3B8' }}>+{skills.length - 4}</span>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [jobTitle, setJobTitle] = useState('')

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/results`)
      .then(r => r.json())
      .then(data => {
        setCandidates(data.candidates ?? [])
        if (data.candidates?.[0]?.name) setJobTitle('')
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => {
        const job = (data.jobs ?? []).find((j: { id: string; title: string }) => j.id === jobId)
        if (job) setJobTitle(job.title)
      })
      .catch(() => {})
  }, [jobId])

  return (
    <>
      <style>{STYLES}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ fontFamily: "'Fira Sans', ui-sans-serif, system-ui, sans-serif", minHeight: '100vh', background: '#F8F7FF' }}>

        {/* Header */}
        <div style={{
          background: 'white', borderBottom: '1px solid rgba(124,58,237,0.09)',
          padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: 'transparent',
              border: '1px solid rgba(124,58,237,0.18)', borderRadius: 999,
              color: '#7C3AED', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(124,58,237,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} style={{ color: '#7C3AED' }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1F1035' }}>
              {jobTitle || 'Screening Results'}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{
            fontSize: 12, color: '#7C3AED', fontWeight: 600,
            background: 'rgba(124,58,237,0.08)', padding: '4px 12px', borderRadius: 999,
          }}>
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8', fontSize: 14 }}>
              Loading results…
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '80px 32px',
              background: 'white', borderRadius: 20,
              border: '1.5px dashed rgba(124,58,237,0.18)',
            }}>
              <Users size={36} style={{ color: '#C4B5FD', margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, color: '#475569', marginBottom: 8 }}>No results yet</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>The pipeline is still running or no resumes were uploaded.</p>
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <div style={{
              background: 'white', borderRadius: 20,
              border: '1px solid rgba(124,58,237,0.09)',
              overflow: 'hidden',
              boxShadow: '0 2px 20px rgba(124,58,237,0.06)',
            }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 120px 140px 1fr 1fr 80px 80px',
                gap: 12, padding: '12px 20px',
                background: 'rgba(124,58,237,0.04)',
                borderBottom: '1px solid rgba(124,58,237,0.08)',
                fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <span>#</span>
                <span>Candidate</span>
                <span>Score</span>
                <span>Recommendation</span>
                <span>Matched Skills</span>
                <span>Missing Skills</span>
                <span>GitHub</span>
                <span></span>
              </div>

              {candidates.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 120px 140px 1fr 1fr 80px 80px',
                    gap: 12, padding: '16px 20px',
                    borderBottom: i < candidates.length - 1 ? '1px solid rgba(124,58,237,0.06)' : 'none',
                    alignItems: 'center',
                    animation: `fadeUp 0.4s ${0.05 * i}s both`,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD' }}>{i + 1}</span>

                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1F1035', marginBottom: 2 }}>{c.name}</p>
                    {c.email && <p style={{ fontSize: 12, color: '#94A3B8' }}>{c.email}</p>}
                    {c.dashboardSummary && (
                      <p style={{ fontSize: 11, color: '#7C3AED', marginTop: 3, lineHeight: 1.4 }}>{c.dashboardSummary}</p>
                    )}
                  </div>

                  <ScoreBadge score={c.compositeScore} />

                  <RecommendationBadge value={c.recommendation} />

                  <SkillPills skills={c.matchedSkills} matched={true} />

                  <SkillPills skills={c.missingSkills} matched={false} />

                  <div>
                    {c.githubUrl ? (
                      <a
                        href={c.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#7C3AED', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Link2 size={13} /> View <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: '#CBD5E1' }}>—</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/jobs/${jobId}/candidates/${c.id}`)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', borderRadius: 8,
                      background: 'rgba(124,58,237,0.08)', border: 'none',
                      color: '#7C3AED', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Details <ChevronRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

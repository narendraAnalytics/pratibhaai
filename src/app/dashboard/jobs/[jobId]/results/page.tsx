'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Link2, ExternalLink, ChevronRight, Search } from 'lucide-react'

// ── Design tokens (warm cream palette) ───────────────────────────────────
const C = {
  bg:         'oklch(97.5% 0.006 85)',
  panel:      'oklch(99% 0.004 85)',
  panel2:     'oklch(96.8% 0.008 85)',
  ink:        'oklch(22% 0.01 80)',
  ink2:       'oklch(45% 0.012 80)',
  ink3:       'oklch(62% 0.012 80)',
  line:       'oklch(91% 0.008 85)',
  line2:      'oklch(86% 0.01 85)',
  accent:     'oklch(55% 0.11 245)',
  accentSoft: 'oklch(94% 0.025 245)',
  good:       'oklch(58% 0.12 155)',
  goodSoft:   'oklch(94% 0.04 155)',
  warn:       'oklch(68% 0.13 70)',
  warnSoft:   'oklch(96% 0.04 70)',
  bad:        'oklch(58% 0.14 25)',
  badSoft:    'oklch(95% 0.04 25)',
}

const mono = "var(--font-geist-mono, 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace)"
const sans = "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)"

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .results-row:hover { background: oklch(96.8% 0.008 85) !important; }
  .ghost-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 8px;
    border: 1px solid oklch(91% 0.008 85);
    background: oklch(99% 0.004 85);
    color: oklch(45% 0.012 80); font-size: 13px; font-weight: 450;
    cursor: pointer; letter-spacing: -0.005em; transition: all 140ms;
    font-family: inherit;
  }
  .ghost-btn:hover {
    color: oklch(22% 0.01 80);
    border-color: oklch(86% 0.01 85);
    background: oklch(96.8% 0.008 85);
  }
  .filter-tab {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 6px;
    font-size: 12.5px; font-weight: 500; cursor: pointer;
    border: none; transition: all 120ms; font-family: inherit;
    background: transparent; color: oklch(62% 0.012 80);
    letter-spacing: -0.005em;
  }
  .filter-tab:hover { background: oklch(96.8% 0.008 85); color: oklch(22% 0.01 80); }
  .filter-tab.active { background: oklch(22% 0.01 80); color: oklch(98% 0.005 85); }
  .detail-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 6px 11px; border-radius: 7px;
    border: 1px solid oklch(91% 0.008 85);
    background: oklch(99% 0.004 85);
    color: oklch(45% 0.012 80); font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 120ms; font-family: inherit; white-space: nowrap;
  }
  .detail-btn:hover {
    border-color: oklch(86% 0.01 85);
    background: oklch(96.8% 0.008 85);
    color: oklch(22% 0.01 80);
  }
  .search-input:focus { border-color: oklch(86% 0.01 85) !important; outline: none; }
`

// ── Interfaces (unchanged) ────────────────────────────────────────────────
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

// ── Sub-components ────────────────────────────────────────────────────────
function Meter({ value }: { value: number | null }) {
  const v = Math.max(0, Math.min(100, value ?? 0))
  const color = v >= 85 ? C.good : v >= 65 ? C.warn : C.bad
  return (
    <div style={{ position: 'relative', height: 3, background: C.line, borderRadius: 999, overflow: 'hidden', width: '100%', marginTop: 5 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${v}%`, background: color, borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  )
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: C.ink3, fontSize: 13, fontFamily: mono }}>—</span>
  const color = score >= 85 ? C.good : score >= 65 ? C.warn : C.bad
  return (
    <div>
      <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 500, color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
        {score}<span style={{ fontSize: 11, color: C.ink3, fontWeight: 400 }}>/100</span>
      </span>
      <Meter value={score} />
    </div>
  )
}

function RecommendationBadge({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: C.ink3, fontSize: 12 }}>Pending</span>
  const map: Record<string, { color: string; bg: string; label: string }> = {
    'strong_hire':     { color: C.good, bg: C.goodSoft, label: 'Strong Hire' },
    'Strong Hire':     { color: C.good, bg: C.goodSoft, label: 'Strong Hire' },
    'consider':        { color: C.warn, bg: C.warnSoft, label: 'Consider' },
    'Consider':        { color: C.warn, bg: C.warnSoft, label: 'Consider' },
    'not_recommended': { color: C.bad,  bg: C.badSoft,  label: 'Not Recommended' },
    'Not Recommended': { color: C.bad,  bg: C.badSoft,  label: 'Not Recommended' },
  }
  const s = map[value] ?? { color: C.accent, bg: C.accentSoft, label: value }
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: s.color, background: s.bg, letterSpacing: '-0.005em' }}>
      {s.label}
    </span>
  )
}

function SkillPills({ skills, matched }: { skills: string[]; matched: boolean }) {
  if (!skills.length) return <span style={{ color: C.ink3, fontSize: 12 }}>—</span>
  const color = matched ? C.good : C.bad
  const bg    = matched ? C.goodSoft : C.badSoft
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {skills.slice(0, 4).map(s => (
        <span key={s} style={{ fontSize: 11, fontWeight: 500, color, background: bg, padding: '2px 7px', borderRadius: 5, letterSpacing: '-0.005em' }}>
          {s}
        </span>
      ))}
      {skills.length > 4 && (
        <span style={{ fontSize: 11, color: C.ink3 }}>+{skills.length - 4}</span>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [jobTitle, setJobTitle]     = useState('')
  const [filter, setFilter]         = useState('all')
  const [query, setQuery]           = useState('')

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/results`)
      .then(r => r.json())
      .then(data => {
        setCandidates(data.candidates ?? [])
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

  const counts = useMemo(() => ({
    all:             candidates.length,
    strong_hire:     candidates.filter(c => c.recommendation === 'strong_hire'     || c.recommendation === 'Strong Hire').length,
    consider:        candidates.filter(c => c.recommendation === 'consider'        || c.recommendation === 'Consider').length,
    not_recommended: candidates.filter(c => c.recommendation === 'not_recommended' || c.recommendation === 'Not Recommended').length,
  }), [candidates])

  const filtered = useMemo(() => candidates.filter(c => {
    const recNorm = (c.recommendation ?? '').toLowerCase().replace(/\s/g, '_')
    const matchFilter = filter === 'all' || recNorm === filter
    const matchQuery  = !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.email?.toLowerCase().includes(query.toLowerCase())
    return matchFilter && matchQuery
  }), [candidates, filter, query])

  const filterTabs = [
    { id: 'all',             label: 'All',          n: counts.all,             dot: '' },
    { id: 'strong_hire',     label: 'Strong hire',  n: counts.strong_hire,     dot: C.good },
    { id: 'consider',        label: 'Consider',     n: counts.consider,        dot: C.warn },
    { id: 'not_recommended', label: 'Pass',         n: counts.not_recommended, dot: C.bad  },
  ]

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ fontFamily: sans, position: 'fixed', inset: 0, zIndex: 50, background: C.bg, overflowY: 'auto' }}>

        {/* ── Sticky header ── */}
        <div style={{ background: C.panel, borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0, zIndex: 20 }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px 10px' }}>
            <button className="ghost-btn" type="button" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={14} /> Dashboard
            </button>
            <div style={{ width: 1, height: 18, background: C.line2 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>
              Screening Results
              {jobTitle && (
                <>
                  <span style={{ color: C.ink3, fontWeight: 400, margin: '0 6px' }}>·</span>
                  <span style={{ color: C.ink2, fontWeight: 500 }}>{jobTitle}</span>
                </>
              )}
            </span>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, color: C.ink3, pointerEvents: 'none' }} />
              <input
                className="search-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search candidates…"
                style={{
                  paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                  border: `1px solid ${C.line}`, borderRadius: 8, background: C.bg,
                  color: C.ink, fontSize: 13, fontFamily: 'inherit',
                  width: 200, letterSpacing: '-0.005em', transition: 'border-color 140ms',
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: C.ink3, fontFamily: mono, fontVariantNumeric: 'tabular-nums' }}>
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 2, padding: '0 28px 10px' }}>
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                className={`filter-tab${filter === tab.id ? ' active' : ''}`}
                type="button"
                onClick={() => setFilter(tab.id)}
              >
                {tab.dot && filter !== tab.id && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: tab.dot, flexShrink: 0 }} />
                )}
                {tab.label}
                <span style={{ fontFamily: mono, fontSize: 11, opacity: 0.65 }}>{tab.n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: C.ink3, fontSize: 13, letterSpacing: '-0.005em' }}>
              Loading results…
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 32px', background: C.panel, borderRadius: 16, border: `1.5px dashed ${C.line2}` }}>
              <Users size={32} style={{ color: C.ink3, margin: '0 auto 14px' }} />
              <p style={{ fontWeight: 600, color: C.ink, marginBottom: 6, letterSpacing: '-0.01em' }}>No results yet</p>
              <p style={{ fontSize: 13, color: C.ink3, letterSpacing: '-0.005em' }}>The pipeline is still running or no resumes were uploaded.</p>
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <div style={{ background: C.panel, borderRadius: 14, border: `1px solid ${C.line}`, overflow: 'hidden' }}>

              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 110px 150px 1fr 1fr 80px 90px',
                gap: 12, padding: '10px 20px',
                background: C.bg,
                borderBottom: `1px solid ${C.line}`,
                fontSize: 11, fontWeight: 600, color: C.ink3,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <span>#</span>
                <span>Candidate</span>
                <span>Score</span>
                <span>Verdict</span>
                <span>Matched</span>
                <span>Missing</span>
                <span>Links</span>
                <span />
              </div>

              {filtered.length === 0 && (
                <div style={{ padding: '48px 32px', textAlign: 'center', color: C.ink3, fontSize: 13 }}>
                  No candidates match this filter.
                </div>
              )}

              {filtered.map((c, i) => (
                <div
                  key={c.id}
                  className="results-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 110px 150px 1fr 1fr 80px 90px',
                    gap: 12, padding: '15px 20px',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.line}` : 'none',
                    alignItems: 'center',
                    animation: `fadeUp 0.35s ${0.05 * i}s both`,
                    transition: 'background 150ms',
                  }}
                >
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: C.ink3, fontFamily: mono, fontVariantNumeric: 'tabular-nums' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, marginBottom: 1, letterSpacing: '-0.01em' }}>{c.name}</p>
                    {c.email && <p style={{ fontSize: 11.5, color: C.ink3, letterSpacing: '-0.005em' }}>{c.email}</p>}
                    {c.dashboardSummary && (
                      <p style={{ fontSize: 11, color: C.ink2, marginTop: 3, lineHeight: 1.4, letterSpacing: '-0.005em' }}>{c.dashboardSummary}</p>
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 500, textDecoration: 'none', letterSpacing: '-0.005em' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Link2 size={12} /> View <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: C.ink3 }}>—</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="detail-btn"
                    onClick={() => router.push(`/dashboard/jobs/${jobId}/candidates/${c.id}`)}
                  >
                    Details <ChevronRight size={12} />
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

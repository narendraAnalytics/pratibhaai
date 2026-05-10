'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react'

const AGENT_ORDER = [
  { key: 'orchestrator',          name: 'Orchestrator Agent',          num: 1,  jobLevel: true  },
  { key: 'job-intelligence',      name: 'Job Intelligence Agent',      num: 2,  jobLevel: true  },
  { key: 'candidate-extraction',  name: 'Candidate Extraction Agent',  num: 3,  jobLevel: false },
  { key: 'verification-risk',     name: 'Verification & Risk Agent',   num: 4,  jobLevel: false },
  { key: 'technical-validation',  name: 'Technical Validation Agent',  num: 5,  jobLevel: false },
  { key: 'behavioral-alignment',  name: 'Behavioral Alignment Agent',  num: 6,  jobLevel: false },
  { key: 'evaluation-aggregator', name: 'Evaluation Aggregator Agent', num: 7,  jobLevel: false },
  { key: 'decision-agent',        name: 'Decision Agent',              num: 8,  jobLevel: false },
  { key: 'report-generator',      name: 'Report Generator Agent',      num: 9,  jobLevel: false },
]

const SUB_STEPS: Record<string, string[]> = {
  'orchestrator':          ['Planning pipeline...', 'Allocating agent resources...', 'Configuring execution strategy...'],
  'job-intelligence':      ['Analyzing job requirements...', 'Extracting required skills...', 'Building hiring blueprint...'],
  'candidate-extraction':  ['Parsing PDF resume...', 'Extracting skills and experience...', 'Detecting GitHub profile...'],
  'verification-risk':     ['Checking employment timeline...', 'Detecting resume inconsistencies...', 'Evaluating verification confidence...'],
  'technical-validation':  ['Fetching GitHub repositories...', 'Analyzing commit activity...', 'Validating technical claims...'],
  'behavioral-alignment':  ['Analyzing leadership signals...', 'Evaluating collaboration indicators...', 'Checking workstyle alignment...'],
  'evaluation-aggregator': ['Calculating composite score...', 'Comparing against hiring blueprint...', 'Ranking candidates...'],
  'decision-agent':        ['Generating hiring recommendation...', 'Creating interview questions...', 'Calculating decision confidence...'],
  'report-generator':      ['Building recruiter report...', 'Generating executive summary...', 'Preparing dashboard output...'],
}

interface AgentProgressItem {
  name: string
  completed: number
  total: number
  avgDurationMs: number | null
  summary: string
}

const STYLES = `
  @keyframes riseIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }
  @keyframes drift0 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(5%,4%) scale(1.10); }
  }
  @keyframes drift1 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(-4%,6%) scale(0.94); }
  }
  @keyframes drift2 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%     { transform: translate(3%,-5%) scale(1.06); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`

function LightAurora() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'drift0 20s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', top: '10%', right: '-15%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'drift1 25s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(6,182,212,0.05) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'drift2 30s ease-in-out infinite alternate' }} />
    </div>
  )
}

export default function ScreeningPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [agentProgress, setAgentProgress] = useState<AgentProgressItem[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [stepTick, setStepTick] = useState(0)

  const isCompleteRef = useRef(false)

  // Sub-step rotation: every 1.8s
  useEffect(() => {
    const t = setInterval(() => setStepTick(n => n + 1), 1800)
    return () => clearInterval(t)
  }, [])

  // Polling: every 2s
  useEffect(() => {
    const poll = setInterval(async () => {
      if (isCompleteRef.current) { clearInterval(poll); return }
      try {
        const res = await fetch(`/api/jobs/${jobId}/pipeline-status`)
        const data = await res.json() as { isComplete: boolean; agents?: AgentProgressItem[] }
        if (data.agents) setAgentProgress(data.agents)
        if (data.isComplete) {
          isCompleteRef.current = true
          setIsComplete(true)
          clearInterval(poll)
          setTimeout(() => router.push(`/dashboard/jobs/${jobId}/results`), 2800)
        }
      } catch { /* ignore transient network errors */ }
    }, 2000)
    return () => clearInterval(poll)
  }, [jobId, router])

  // Build progress map from polled data
  const progressMap: Record<string, AgentProgressItem> = {}
  for (const item of agentProgress) progressMap[item.name] = item

  // Derive statuses sequentially (data-driven, not timer-based)
  const statuses: ('queued' | 'processing' | 'completed')[] = []
  for (let i = 0; i < AGENT_ORDER.length; i++) {
    if (isComplete) { statuses.push('completed'); continue }
    const progress = progressMap[AGENT_ORDER[i].key]
    const prevCompleted = i > 0 && statuses[i - 1] === 'completed'
    if (!progress) {
      statuses.push(i === 0 ? 'processing' : 'queued')
    } else if (progress.completed >= progress.total && progress.total > 0) {
      statuses.push('completed')
    } else if (progress.completed > 0 || prevCompleted) {
      statuses.push('processing')
    } else {
      statuses.push('queued')
    }
  }

  const completedCount = statuses.filter(s => s === 'completed').length

  return (
    <>
      <style>{STYLES}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto',
        fontFamily: "'Fira Sans', ui-sans-serif, system-ui, sans-serif",
        color: '#1F1035', background: '#F8F7FF', WebkitFontSmoothing: 'antialiased',
      }}>
        <LightAurora />

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 28px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(18px) saturate(140%)',
          borderBottom: '1px solid rgba(124,58,237,0.09)',
        }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', background: 'transparent',
              border: '1px solid rgba(124,58,237,0.22)', borderRadius: 999,
              color: '#7C3AED', fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={15} /> Dashboard
          </button>
          <span style={{ width: 1, height: 18, background: 'rgba(124,58,237,0.12)' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#1F1035', fontWeight: 600, fontSize: 13.5 }}>
            <Sparkles size={14} style={{ color: '#7C3AED' }} />
            AI Screening
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: '#64748B',
            padding: '6px 12px', border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: 999, background: 'rgba(124,58,237,0.03)',
          }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>Step 1 ✓</span>
            <span style={{ color: 'rgba(100,116,139,0.4)' }}>·</span>
            <span style={{ color: '#10B981', fontWeight: 600 }}>Step 2 ✓</span>
            <span style={{ color: 'rgba(100,116,139,0.4)' }}>·</span>
            <span style={{ color: isComplete ? '#10B981' : '#7C3AED', fontWeight: 600 }}>
              {isComplete ? 'Step 3 ✓' : 'Step 3: AI Screening'}
            </span>
          </div>
        </header>

        <main style={{ maxWidth: 760, margin: '0 auto', padding: '52px 28px 96px', position: 'relative', zIndex: 2 }}>

          {/* Hero */}
          <div style={{ marginBottom: 36, animation: 'riseIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 12px', borderRadius: 999, marginBottom: 18,
              background: isComplete ? 'rgba(16,185,129,0.08)' : 'rgba(124,58,237,0.08)',
              border: isComplete ? '1px solid rgba(16,185,129,0.20)' : '1px solid rgba(124,58,237,0.18)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isComplete ? '#10B981' : '#7C3AED',
                animation: isComplete ? 'none' : 'pulse 1.4s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isComplete ? '#065F46' : '#7C3AED' }}>
                {isComplete ? 'Screening Complete' : 'Agents Running'}
              </span>
            </div>
            <h1 style={{ margin: '0 0 12px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: '#1F1035' }}>
              {isComplete ? 'Screening Complete' : 'AI Screening in Progress'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: 14.5, color: '#64748B', lineHeight: 1.65 }}>
                {isComplete
                  ? 'All agents finished. Redirecting to results...'
                  : '9 specialized agents are autonomously reviewing your candidates.'}
              </p>
              {!isComplete && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)',
                  fontSize: 12, color: '#64748B',
                }}>
                  <span style={{ color: '#7C3AED', fontWeight: 700 }}>{completedCount}</span>
                  <span>/ 9 agents complete</span>
                </div>
              )}
              {isComplete && (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/jobs/${jobId}/results`)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    padding: '8px 18px', borderRadius: 999, cursor: 'pointer',
                    background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 14px rgba(124,58,237,0.25)',
                  }}
                >
                  View Results →
                </button>
              )}
            </div>
          </div>

          {/* Agent timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'riseIn 0.8s 0.15s cubic-bezier(.2,.7,.2,1) both' }}>
            {AGENT_ORDER.map((agent, idx) => {
              const status = statuses[idx]
              const progress = progressMap[agent.key]
              const isDone = status === 'completed'
              const isActive = status === 'processing'
              const isPending = status === 'queued'

              const steps = SUB_STEPS[agent.key] ?? []
              const currentStep = steps[stepTick % steps.length]

              const durationLabel = isDone && (progress?.avgDurationMs ?? 0) > 0
                ? `${((progress?.avgDurationMs ?? 0) / 1000).toFixed(1)}s`
                : null

              const progressPct = progress && progress.total > 0
                ? Math.min(100, (progress.completed / progress.total) * 100)
                : 0

              const showProgressBar = isActive && !agent.jobLevel && progress && progress.total > 1

              return (
                <div
                  key={agent.key}
                  style={{
                    padding: '14px 18px', borderRadius: 14,
                    background: isDone
                      ? 'rgba(16,185,129,0.04)'
                      : isActive
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(168,85,247,0.03))'
                        : 'white',
                    border: isDone
                      ? '1px solid rgba(16,185,129,0.18)'
                      : isActive
                        ? '1px solid rgba(124,58,237,0.24)'
                        : '1px solid rgba(124,58,237,0.07)',
                    opacity: isPending ? 0.6 : 1,
                    transition: 'all 0.45s ease',
                    boxShadow: isActive
                      ? '0 2px 16px rgba(124,58,237,0.08)'
                      : isDone
                        ? '0 1px 6px rgba(16,185,129,0.06)'
                        : '0 1px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Main row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

                    {/* Status icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone
                        ? 'rgba(16,185,129,0.10)'
                        : isActive
                          ? 'rgba(124,58,237,0.10)'
                          : 'rgba(124,58,237,0.04)',
                      border: isDone
                        ? '1px solid rgba(16,185,129,0.22)'
                        : isActive
                          ? '1px solid rgba(124,58,237,0.22)'
                          : '1px solid rgba(124,58,237,0.10)',
                    }}>
                      {isDone ? (
                        <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                      ) : isActive ? (
                        <div style={{
                          width: 16, height: 16,
                          border: '2px solid rgba(124,58,237,0.15)',
                          borderTopColor: '#7C3AED', borderRadius: '50%',
                          animation: 'spin 0.85s linear infinite',
                        }} />
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#C4B5FD' }}>
                          {agent.num}
                        </span>
                      )}
                    </div>

                    {/* Agent name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13.5, fontWeight: 600,
                        color: isDone ? '#065F46' : isActive ? '#7C3AED' : '#94A3B8',
                      }}>
                        {agent.name}
                      </div>
                    </div>

                    {/* Right side: duration + status badge */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {durationLabel && (
                        <span style={{
                          fontSize: 10.5, fontWeight: 500,
                          color: '#10B981',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {durationLabel}
                        </span>
                      )}
                      {isDone ? (
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: '#065F46',
                          padding: '3px 9px', borderRadius: 999,
                          background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.18)',
                        }}>Done</span>
                      ) : isActive ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600, color: '#7C3AED',
                          padding: '3px 10px', borderRadius: 999,
                          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.16)',
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%', background: '#7C3AED',
                            animation: 'pulse 1.1s ease-in-out infinite',
                          }} />
                          Running
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#CBD5E1' }}>Waiting</span>
                      )}
                    </div>
                  </div>

                  {/* Active: sub-step message + progress bar */}
                  {isActive && (
                    <div style={{ marginTop: 10, paddingLeft: 48 }}>
                      <div style={{
                        fontSize: 12, color: '#7C3AED',
                        animation: 'slideIn 0.3s ease both',
                        marginBottom: showProgressBar ? 8 : 0,
                        opacity: 0.75,
                      }}>
                        {currentStep}
                        {!agent.jobLevel && progress && progress.total > 1 && (
                          <span style={{ marginLeft: 10, color: '#94A3B8', fontSize: 11 }}>
                            {progress.completed} / {progress.total} candidates
                          </span>
                        )}
                      </div>
                      {showProgressBar && (
                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(124,58,237,0.08)' }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
                            width: `${progressPct}%`,
                            transition: 'width 0.7s ease',
                          }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Done: smart completion summary */}
                  {isDone && progress?.summary && (
                    <div style={{
                      marginTop: 5, paddingLeft: 48,
                      fontSize: 11.5, color: '#10B981',
                      animation: 'slideIn 0.4s ease both',
                    }}>
                      {progress.summary}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </main>
      </div>
    </>
  )
}

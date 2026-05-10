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

function Aurora() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(88,28,235,0.18) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'drift0 20s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', top: '10%', right: '-15%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,92,255,0.14) 0%, transparent 70%)', filter: 'blur(70px)', animation: 'drift1 25s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(6,182,212,0.10) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'drift2 30s ease-in-out infinite alternate' }} />
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
          setTimeout(() => router.push('/dashboard'), 2800)
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
      // Before first poll: optimistically show agent 1 as processing
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
        color: '#e6e2ff', background: '#050310', WebkitFontSmoothing: 'antialiased',
      }}>
        <Aurora />

        {/* Top bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 28px',
          background: 'linear-gradient(180deg, rgba(8,6,24,0.65) 0%, rgba(8,6,24,0.25) 100%)',
          backdropFilter: 'blur(18px) saturate(140%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.10)', borderRadius: 999,
              color: 'rgba(230,226,255,0.78)', fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={15} /> Dashboard
          </button>
          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d6cdff', fontWeight: 600, fontSize: 13.5 }}>
            <Sparkles size={14} style={{ color: '#b9a4ff' }} />
            AI Screening
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'rgba(214,205,255,0.7)',
            padding: '6px 12px', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999, background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{ color: 'rgba(110,231,183,0.75)', fontWeight: 600 }}>Step 1 ✓</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span style={{ color: 'rgba(110,231,183,0.75)', fontWeight: 600 }}>Step 2 ✓</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span style={{ color: isComplete ? 'rgba(110,231,183,0.9)' : '#c9b8ff', fontWeight: 600 }}>
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
              background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(186,168,255,0.20)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isComplete ? '#4ade80' : '#b9a4ff',
                animation: isComplete ? 'none' : 'pulse 1.4s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isComplete ? '#4ade80' : '#d6cdff' }}>
                {isComplete ? 'Screening Complete' : 'Agents Running'}
              </span>
            </div>
            <h1 style={{ margin: '0 0 12px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: '#f0ecff' }}>
              {isComplete ? 'Screening Complete' : 'AI Screening in Progress'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: 14.5, color: 'rgba(214,205,255,0.55)', lineHeight: 1.65 }}>
                {isComplete
                  ? 'All agents finished. Redirecting to your dashboard...'
                  : '9 specialized agents are autonomously reviewing your candidates.'}
              </p>
              {!isComplete && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: 12, color: 'rgba(214,205,255,0.55)',
                }}>
                  <span style={{ color: '#b9a4ff', fontWeight: 700 }}>{completedCount}</span>
                  <span>/ 9 agents complete</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, animation: 'riseIn 0.8s 0.15s cubic-bezier(.2,.7,.2,1) both' }}>
            {AGENT_ORDER.map((agent, idx) => {
              const status = statuses[idx]
              const progress = progressMap[agent.key]
              const isDone = status === 'completed'
              const isActive = status === 'processing'
              const isPending = status === 'queued'

              const steps = SUB_STEPS[agent.key] ?? []
              const currentStep = steps[stepTick % steps.length]

              const durationLabel = isDone && (progress?.avgDurationMs ?? 0) > 0
                ? `${((progress?.avgDurationMs ?? 0) / 1000).toFixed(1)}s avg`
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
                      ? 'rgba(74,222,128,0.04)'
                      : isActive
                        ? 'linear-gradient(135deg, rgba(124,92,255,0.08), rgba(34,211,238,0.04))'
                        : 'rgba(255,255,255,0.015)',
                    border: isDone
                      ? '1px solid rgba(74,222,128,0.14)'
                      : isActive
                        ? '1px solid rgba(124,92,255,0.30)'
                        : '1px solid rgba(255,255,255,0.04)',
                    opacity: isPending ? 0.55 : 1,
                    transition: 'all 0.45s ease',
                  }}
                >
                  {/* Main row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

                    {/* Status icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone
                        ? 'rgba(74,222,128,0.11)'
                        : isActive
                          ? 'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(192,132,252,0.12))'
                          : 'rgba(255,255,255,0.03)',
                      border: isDone
                        ? '1px solid rgba(74,222,128,0.22)'
                        : isActive
                          ? '1px solid rgba(124,92,255,0.32)'
                          : '1px solid rgba(255,255,255,0.05)',
                    }}>
                      {isDone ? (
                        <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
                      ) : isActive ? (
                        <div style={{
                          width: 16, height: 16,
                          border: '2px solid rgba(124,92,255,0.22)',
                          borderTopColor: '#b9a4ff', borderRadius: '50%',
                          animation: 'spin 0.85s linear infinite',
                        }} />
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.20)' }}>
                          {agent.num}
                        </span>
                      )}
                    </div>

                    {/* Agent name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13.5, fontWeight: 600,
                        color: isDone ? '#86efac' : isActive ? '#e2d9ff' : 'rgba(214,205,255,0.55)',
                      }}>
                        {agent.name}
                      </div>
                    </div>

                    {/* Right side: duration + status badge */}
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {durationLabel && (
                        <span style={{
                          fontSize: 10.5, fontWeight: 500,
                          color: 'rgba(74,222,128,0.45)',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {durationLabel}
                        </span>
                      )}
                      {isDone ? (
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: '#4ade80',
                          padding: '3px 9px', borderRadius: 999,
                          background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)',
                        }}>Done</span>
                      ) : isActive ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600, color: '#c084fc',
                          padding: '3px 10px', borderRadius: 999,
                          background: 'rgba(124,92,255,0.10)', border: '1px solid rgba(124,92,255,0.20)',
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%', background: '#b9a4ff',
                            animation: 'pulse 1.1s ease-in-out infinite',
                          }} />
                          Running
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>Waiting</span>
                      )}
                    </div>
                  </div>

                  {/* Active: sub-step message + progress bar */}
                  {isActive && (
                    <div style={{ marginTop: 10, paddingLeft: 48 }}>
                      <div style={{
                        fontSize: 12, color: 'rgba(186,168,255,0.52)',
                        animation: 'slideIn 0.3s ease both',
                        marginBottom: showProgressBar ? 8 : 0,
                      }}>
                        {currentStep}
                        {!agent.jobLevel && progress && progress.total > 1 && (
                          <span style={{ marginLeft: 10, color: 'rgba(186,168,255,0.30)', fontSize: 11 }}>
                            {progress.completed} / {progress.total} candidates
                          </span>
                        )}
                      </div>
                      {showProgressBar && (
                        <div style={{ height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{
                            height: '100%', borderRadius: 1,
                            background: 'linear-gradient(90deg, rgba(124,92,255,0.65), rgba(192,132,252,0.65))',
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
                      fontSize: 11.5, color: 'rgba(74,222,128,0.42)',
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

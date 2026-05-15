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
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes drift1 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(30px, -20px) scale(1.05); }
    66%  { transform: translate(-15px, 25px) scale(0.97); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes drift2 {
    0%   { transform: translate(0px, 0px) scale(1); }
    40%  { transform: translate(-25px, 30px) scale(1.08); }
    70%  { transform: translate(20px, -15px) scale(0.94); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes drift3 {
    0%   { transform: translate(0px, 0px) scale(1); }
    50%  { transform: translate(15px, 20px) scale(1.06); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes meshPan {
    0%   { background-position: 0px 0px; }
    100% { background-position: 40px 40px; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes stepIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes pulseAccent {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }
  .agent-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 980px) {
    .agent-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .agent-grid { grid-template-columns: 1fr; }
  }
  .hero-row {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 32px;
    align-items: start;
  }
  @media (max-width: 780px) {
    .hero-row { grid-template-columns: 1fr; }
  }
`

function BgStage() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '55%', height: '55%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(95,180,161,0.55) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'drift1 22s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '5%', right: '-12%',
        width: '45%', height: '45%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(232,148,120,0.55) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'drift2 28s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-5%', left: '30%',
        width: '40%', height: '40%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(217,190,130,0.55) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'drift3 18s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-8%',
        width: '35%', height: '35%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(127,196,180,0.55) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'drift1 32s ease-in-out infinite reverse',
      }} />
    </div>
  )
}

function Mesh() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
      backgroundImage: `linear-gradient(rgba(43,63,57,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(43,63,57,0.04) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      backgroundPosition: '0px 0px',
      maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
      animation: 'meshPan 20s linear infinite',
    }} />
  )
}

export default function ScreeningPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [agentProgress, setAgentProgress] = useState<AgentProgressItem[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [stepTick, setStepTick] = useState(0)
  const [jobTitle, setJobTitle] = useState('')

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
        const data = await res.json() as { isComplete: boolean; agents?: AgentProgressItem[]; jobTitle?: string }
        if (data.agents) setAgentProgress(data.agents)
        if (data.jobTitle) setJobTitle(data.jobTitle)
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

  // Candidate count from first non-job-level agent with data
  const candidateCount = (() => {
    for (const agent of AGENT_ORDER) {
      if (!agent.jobLevel && (progressMap[agent.key]?.total ?? 0) > 0) {
        return progressMap[agent.key].total
      }
    }
    return null
  })()

  // Ticker text — duplicated for seamless marquee loop
  const tickerItems = isComplete
    ? ['✦ All 9 agents completed · Redirecting to results...', '✦ Pipeline finished · Full report ready', '✦ Candidates ranked · AI analysis complete']
    : AGENT_ORDER.map((a, i) => {
        const s = statuses[i]
        if (s === 'completed') return `✓ ${a.name} — done`
        if (s === 'processing') return `⟳ ${a.name} — running`
        return `· ${a.name} — queued`
      })
  const tickerText = [...tickerItems, ...tickerItems].join('     ')

  return (
    <>
      <style>{STYLES}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto',
        fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
        color: '#2B3F39', background: '#F2EBDE', WebkitFontSmoothing: 'antialiased',
      }}>
        <BgStage />
        <Mesh />

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', gap: 14, padding: '13px 28px',
          background: 'rgba(242,235,222,0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(43,63,57,0.10)',
        }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: '#F8F2E5',
              border: '1px solid rgba(43,63,57,0.10)', borderRadius: 999,
              color: '#5C6E66', fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <span style={{ width: 1, height: 18, background: 'rgba(43,63,57,0.10)' }} />
          {/* Logo-mark */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7, flexShrink: 0,
              background: 'linear-gradient(135deg, #2F8A78, #3FA38E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>AI</span>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#2B3F39' }}>
              Pratibha AI <span style={{ color: '#8A9890', fontWeight: 400 }}>· Screening{jobTitle ? ` · ${jobTitle}` : ''}</span>
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {/* Step track */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2F8A78' }} />
              <span style={{ fontSize: 11.5, color: '#5C6E66', fontWeight: 500 }}>Intake</span>
            </div>
            <div style={{ width: 20, height: 1, background: 'rgba(43,63,57,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2F8A78' }} />
              <span style={{ fontSize: 11.5, color: '#5C6E66', fontWeight: 500 }}>Blueprint</span>
            </div>
            <div style={{ width: 20, height: 1, background: 'rgba(43,63,57,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isComplete ? '#2F8A78' : '#D86F4E',
                animation: isComplete ? 'none' : 'pulseAccent 1.4s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 11.5, color: '#2B3F39', fontWeight: 600 }}>
                Screening {isComplete ? 'done' : 'live'}
              </span>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 28px 120px', position: 'relative', zIndex: 2 }}>

          {/* Hero row */}
          <div className="hero-row" style={{ marginBottom: 52, animation: 'riseIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>

            {/* Left col: text */}
            <div>
              {/* Eyebrow */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 13px', borderRadius: 999, marginBottom: 20,
                background: isComplete ? 'rgba(201,160,87,0.12)' : 'rgba(47,138,120,0.10)',
                border: isComplete ? '1px solid rgba(201,160,87,0.30)' : '1px solid rgba(47,138,120,0.22)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isComplete ? '#C9A057' : '#2F8A78',
                  animation: isComplete ? 'none' : 'pulse 1.4s ease-in-out infinite',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: isComplete ? '#8A6B30' : '#2F8A78' }}>
                  {isComplete ? 'All agents finished' : `Step 3 · ${completedCount} of 9 agents complete`}
                </span>
              </div>

              {/* H1 — Instrument Serif italic */}
              <h1 style={{
                margin: '0 0 16px',
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 42, fontWeight: 400, lineHeight: 1.15,
                letterSpacing: '-0.5px', color: '#2B3F39',
              }}>
                {isComplete
                  ? <>Screening <em>complete.</em></>
                  : <>Nine agents are <em>running</em> across your shortlist.</>}
              </h1>

              {/* Lede */}
              <p style={{ margin: '0 0 28px', fontSize: 15, color: '#5C6E66', lineHeight: 1.7 }}>
                {isComplete
                  ? 'All 9 AI agents have finished. Your candidates are ranked and ready to review.'
                  : '9 specialized AI agents are autonomously screening, validating, and scoring every candidate.'}
              </p>

              {isComplete && (
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/jobs/${jobId}/results`)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 24px', borderRadius: 999, cursor: 'pointer',
                    background: 'linear-gradient(90deg, #2F8A78, #3FA38E)',
                    border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 18px rgba(47,138,120,0.30)',
                  }}
                >
                  Open results →
                </button>
              )}
            </div>

            {/* Right col: summary stat card */}
            <div style={{
              background: '#F8F2E5',
              border: '1px solid rgba(43,63,57,0.10)',
              borderRadius: 18, padding: '24px 20px',
              boxShadow: '0 4px 24px rgba(43,63,57,0.06)',
              animation: 'riseIn 0.8s 0.1s cubic-bezier(.2,.7,.2,1) both',
            }}>
              {/* Stat grid 3-col */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontStyle: 'italic', fontSize: 34, fontWeight: 400,
                    color: '#2B3F39', lineHeight: 1,
                  }}>
                    {completedCount}<span style={{ fontSize: 16, opacity: 0.4 }}>/9</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#8A9890', fontWeight: 500, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Agents done
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontStyle: 'italic', fontSize: 34, fontWeight: 400,
                    color: '#2B3F39', lineHeight: 1,
                  }}>
                    {agentProgress.length > 0 ? agentProgress.reduce((s, a) => s + a.completed, 0) : '—'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#8A9890', fontWeight: 500, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Tasks done
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontStyle: 'italic', fontSize: 34, fontWeight: 400,
                    color: '#2B3F39', lineHeight: 1,
                  }}>
                    {candidateCount ?? '—'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#8A9890', fontWeight: 500, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Candidates
                  </div>
                </div>
              </div>

              {/* Overall progress bar */}
              <div style={{ fontSize: 11, color: '#8A9890', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Overall progress</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round((completedCount / 9) * 100)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(43,63,57,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(completedCount / 9) * 100}%`,
                  transition: 'width 0.7s ease',
                  backgroundImage: isComplete
                    ? 'linear-gradient(90deg, #2F8A78, #C9A057)'
                    : 'linear-gradient(90deg, #2F8A78, #3FA38E)',
                  backgroundSize: '200% 100%',
                  animation: isComplete ? 'none' : 'shimmer 2s linear infinite',
                }} />
              </div>
            </div>
          </div>

          {/* Agent floor section */}
          <div style={{ animation: 'riseIn 0.85s 0.2s cubic-bezier(.2,.7,.2,1) both' }}>

            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{
                  margin: '0 0 4px',
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontStyle: 'italic', fontSize: 28, fontWeight: 400, color: '#2B3F39',
                }}>
                  Agent floor
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: '#8A9890' }}>
                  Each agent runs autonomously — statuses update live
                </p>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11.5, color: '#8A9890' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D0C8B8', display: 'inline-block' }} />
                  Queued
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2F8A78', display: 'inline-block' }} />
                  Running
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A057', display: 'inline-block' }} />
                  Done
                </span>
              </div>
            </div>

            {/* 3-col agent grid */}
            <div className="agent-grid">
              {AGENT_ORDER.map((agent, idx) => {
                const status = statuses[idx]
                const progress = progressMap[agent.key]
                const isDone = status === 'completed'
                const isActive = status === 'processing'
                const isPending = status === 'queued'

                const steps = SUB_STEPS[agent.key] ?? []
                const currentStep = steps[stepTick % steps.length]

                const progressPct = progress && progress.total > 0
                  ? Math.min(100, (progress.completed / progress.total) * 100)
                  : 0

                const showProgressBar = isActive && !agent.jobLevel && progress && progress.total > 1

                return (
                  <div
                    key={agent.key}
                    style={{
                      padding: '18px 16px', borderRadius: 18,
                      background: isDone
                        ? 'linear-gradient(140deg, #F0EFE0, #EAEFE7)'
                        : isActive
                          ? 'linear-gradient(140deg, #F8F2E5, #EDF5F1)'
                          : '#F8F2E5',
                      border: isDone
                        ? '1px solid rgba(47,138,120,0.18)'
                        : isActive
                          ? '1px solid rgba(47,138,120,0.22)'
                          : '1px solid rgba(43,63,57,0.10)',
                      opacity: isPending ? 0.7 : 1,
                      transition: 'all 0.45s ease',
                      transform: isActive ? 'translateY(-2px)' : 'none',
                      boxShadow: isActive
                        ? '0 6px 24px rgba(47,138,120,0.12)'
                        : isDone
                          ? '0 2px 8px rgba(47,138,120,0.06)'
                          : '0 1px 4px rgba(43,63,57,0.04)',
                    }}
                  >
                    {/* Card header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>

                      {/* Badge number */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDone
                          ? 'rgba(201,160,87,0.12)'
                          : isActive
                            ? 'linear-gradient(135deg, #2F8A78, #3FA38E)'
                            : 'rgba(43,63,57,0.06)',
                        border: isDone
                          ? '1px solid rgba(201,160,87,0.25)'
                          : isActive
                            ? 'none'
                            : '1px solid rgba(43,63,57,0.10)',
                        boxShadow: isActive ? '0 2px 10px rgba(47,138,120,0.30)' : 'none',
                      }}>
                        {isDone ? (
                          <CheckCircle2 size={16} style={{ color: '#C9A057' }} />
                        ) : (
                          <span style={{
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            fontStyle: 'italic',
                            fontSize: 22, fontWeight: 400, lineHeight: 1,
                            color: isActive ? '#fff' : '#8A9890',
                          }}>
                            {agent.num}
                          </span>
                        )}
                      </div>

                      {/* Status tag */}
                      {isDone ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 10.5, fontWeight: 600, color: '#7A6535',
                          padding: '3px 9px', borderRadius: 999,
                          background: 'rgba(201,160,87,0.12)',
                          border: '1px solid rgba(201,160,87,0.25)',
                        }}>
                          ✓ Done
                        </span>
                      ) : isActive ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 10.5, fontWeight: 600, color: '#2F8A78',
                          padding: '3px 9px', borderRadius: 999,
                          background: 'rgba(47,138,120,0.10)',
                          border: '1px solid rgba(47,138,120,0.22)',
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%', background: '#2F8A78',
                            animation: 'pulse 1.1s ease-in-out infinite',
                            display: 'inline-block',
                          }} />
                          Running
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 10.5, color: '#8A9890',
                          padding: '3px 9px', borderRadius: 999,
                          background: 'rgba(43,63,57,0.05)',
                          border: '1px solid rgba(43,63,57,0.08)',
                        }}>
                          Queued
                        </span>
                      )}
                    </div>

                    {/* Agent name + kind */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#2B3F39', marginBottom: 2 }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#8A9890', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {agent.jobLevel ? 'Job-level' : 'Candidate-level'}
                      </div>
                    </div>

                    {/* Substep area — JetBrains Mono */}
                    <div style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: 11.5, lineHeight: 1.5, minHeight: 32,
                      color: isDone ? '#5C6E66' : isActive ? '#2F8A78' : '#8A9890',
                    }}>
                      {isDone ? (
                        <span>
                          <Sparkles size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                          {progress?.summary || 'Agent completed successfully'}
                        </span>
                      ) : isActive ? (
                        <span key={currentStep} style={{ animation: 'stepIn 0.3s ease both', display: 'block' }}>
                          <span style={{
                            display: 'inline-block', width: 10, height: 10,
                            border: '1.5px solid rgba(47,138,120,0.25)',
                            borderTopColor: '#2F8A78', borderRadius: '50%',
                            animation: 'spin 0.85s linear infinite',
                            marginRight: 6, verticalAlign: 'middle',
                          }} />
                          {currentStep}
                          {!agent.jobLevel && progress && progress.total > 1 && (
                            <span style={{ marginLeft: 8, color: '#8A9890', fontSize: 10.5 }}>
                              {progress.completed}/{progress.total}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ opacity: 0.5 }}>Awaiting upstream agent…</span>
                      )}
                    </div>

                    {/* Mini-bar — candidate-level, active only */}
                    {showProgressBar && (
                      <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'rgba(43,63,57,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          width: `${progressPct}%`,
                          transition: 'width 0.7s ease',
                          backgroundImage: 'linear-gradient(90deg, #2F8A78, #3FA38E)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.8s linear infinite',
                        }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        {/* Activity ticker */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
          borderTop: '1px solid rgba(43,63,57,0.10)',
          background: 'rgba(242,235,222,0.92)',
          backdropFilter: 'blur(12px)',
          padding: '8px 0',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center',
        }}>
          {/* Label */}
          <div style={{
            flexShrink: 0, padding: '0 14px',
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
            color: isComplete ? '#C9A057' : '#D86F4E',
            fontFamily: "'DM Sans', sans-serif",
            borderRight: '1px solid rgba(43,63,57,0.10)',
          }}>
            {isComplete ? 'Done' : 'Live'}
          </div>
          {/* Scrolling marquee */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 11, color: '#5C6E66',
              animation: 'marquee 30s linear infinite',
            }}>
              {tickerText}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

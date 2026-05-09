'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react'

const AGENTS = [
  { num: 1, name: 'Orchestrator Agent',         message: 'Planning pipeline and execution strategy...',               handoff: 'Pipeline planned → handing off to Job Intelligence' },
  { num: 2, name: 'Job Intelligence Agent',      message: 'Analyzing job description and extracting requirements...', handoff: 'Blueprint ready → starting candidate extraction' },
  { num: 3, name: 'Candidate Extraction Agent',  message: 'Parsing resumes and building candidate profiles...',       handoff: 'Profiles built → checking for red flags' },
  { num: 4, name: 'Verification & Risk Agent',   message: 'Checking for inconsistencies and red flags...',            handoff: 'Risk analysis done → validating technical depth' },
  { num: 5, name: 'Technical Validation Agent',  message: 'Analyzing GitHub activity and technical depth...',         handoff: 'Technical score ready → evaluating soft skills' },
  { num: 6, name: 'Behavioral Alignment Agent',  message: 'Evaluating soft skills and culture fit...',                handoff: 'Culture score ready → computing final rankings' },
  { num: 7, name: 'Evaluation Aggregator Agent', message: 'Computing composite scores and final rankings...',          handoff: 'Scores computed → generating hiring decision' },
  { num: 8, name: 'Decision Agent',              message: 'Generating hiring recommendation and interview questions...', handoff: 'Decision ready → creating final report' },
  { num: 9, name: 'Report Generator Agent',      message: 'Creating final report and email content...',               handoff: 'All agents complete — screening finished!' },
]

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
  @keyframes fadeSlide {
    0%   { opacity: 0; transform: translateY(-5px); }
    12%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(4px); }
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

  const [activeIdx, setActiveIdx] = useState(0)
  const [doneIdxs, setDoneIdxs] = useState<number[]>([])
  const [handoffMsg, setHandoffMsg] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const activeIdxRef = useRef(0)
  const isCompleteRef = useRef(false)

  // Animation: advance one agent every 6s
  useEffect(() => {
    const t = setInterval(() => {
      if (isCompleteRef.current) { clearInterval(t); return }
      const current = activeIdxRef.current
      if (current >= AGENTS.length - 1) return // wait for polling to confirm
      const next = current + 1
      setDoneIdxs(prev => [...prev, current])
      setHandoffMsg(AGENTS[current].handoff)
      setTimeout(() => setHandoffMsg(''), 1800)
      activeIdxRef.current = next
      setActiveIdx(next)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  // Polling: check completion every 3s
  useEffect(() => {
    const poll = setInterval(async () => {
      if (isCompleteRef.current) { clearInterval(poll); return }
      try {
        const res = await fetch(`/api/jobs/${jobId}/pipeline-status`)
        const data = await res.json() as { isComplete: boolean }
        if (data.isComplete) {
          isCompleteRef.current = true
          setIsComplete(true)
          setDoneIdxs([0, 1, 2, 3, 4, 5, 6, 7, 8])
          setHandoffMsg('All agents complete — screening finished!')
          clearInterval(poll)
          setTimeout(() => router.push('/dashboard'), 2500)
        }
      } catch { /* ignore network errors */ }
    }, 3000)
    return () => clearInterval(poll)
  }, [jobId, router])

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
          {/* Step indicator */}
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

        <main style={{ maxWidth: 720, margin: '0 auto', padding: '52px 28px 96px', position: 'relative', zIndex: 2 }}>

          {/* Hero */}
          <div style={{ marginBottom: 32, animation: 'riseIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
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
            <h1 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: '#f0ecff' }}>
              {isComplete ? 'Screening Complete' : 'AI Screening in Progress'}
            </h1>
            <p style={{ margin: 0, fontSize: 14.5, color: 'rgba(214,205,255,0.55)', lineHeight: 1.65 }}>
              {isComplete
                ? 'All agents finished. Redirecting to your dashboard...'
                : '9 specialized agents are autonomously reviewing your candidates.'}
            </p>
          </div>

          {/* Handoff message */}
          {handoffMsg && (
            <div style={{
              marginBottom: 18, padding: '10px 16px', borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(34,211,238,0.07))',
              border: '1px solid rgba(186,168,255,0.22)',
              fontSize: 13, color: '#c9b8ff', fontWeight: 500,
              animation: 'fadeSlide 1.8s ease-in-out both',
            }}>
              ⚡ {handoffMsg}
            </div>
          )}

          {/* Agent list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'riseIn 0.8s 0.15s cubic-bezier(.2,.7,.2,1) both' }}>
            {AGENTS.map((agent, idx) => {
              const isDone = doneIdxs.includes(idx)
              const isActive = activeIdx === idx && !isComplete
              const isPending = !isDone && !isActive

              return (
                <div
                  key={agent.num}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '15px 18px', borderRadius: 14,
                    background: isDone
                      ? 'rgba(74,222,128,0.05)'
                      : isActive
                        ? 'linear-gradient(135deg, rgba(124,92,255,0.10), rgba(34,211,238,0.05))'
                        : 'rgba(255,255,255,0.018)',
                    border: isDone
                      ? '1px solid rgba(74,222,128,0.18)'
                      : isActive
                        ? '1px solid rgba(124,92,255,0.38)'
                        : '1px solid rgba(255,255,255,0.05)',
                    opacity: isPending ? 0.42 : 1,
                    transition: 'all 0.5s ease',
                  }}
                >
                  {/* Number badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone
                      ? 'rgba(74,222,128,0.14)'
                      : isActive
                        ? 'linear-gradient(135deg, rgba(124,92,255,0.30), rgba(192,132,252,0.20))'
                        : 'rgba(255,255,255,0.04)',
                    border: isDone
                      ? '1px solid rgba(74,222,128,0.28)'
                      : isActive
                        ? '1px solid rgba(124,92,255,0.42)'
                        : '1px solid rgba(255,255,255,0.07)',
                  }}>
                    {isDone ? (
                      <CheckCircle2 size={17} style={{ color: '#4ade80' }} />
                    ) : (
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: isActive ? '#c084fc' : 'rgba(255,255,255,0.30)',
                        animation: isActive ? 'pulse 1.6s ease-in-out infinite' : 'none',
                      }}>
                        {agent.num}
                      </span>
                    )}
                  </div>

                  {/* Name + message */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13.5, fontWeight: 600, lineHeight: 1.3,
                      color: isDone ? '#86efac' : isActive ? '#e2d9ff' : 'rgba(214,205,255,0.48)',
                      marginBottom: (isActive || isDone) ? 3 : 0,
                    }}>
                      {agent.name}
                    </div>
                    {isActive && (
                      <div style={{ fontSize: 12, color: 'rgba(186,168,255,0.55)', animation: 'pulse 2.2s ease-in-out infinite' }}>
                        {agent.message}
                      </div>
                    )}
                    {isDone && (
                      <div style={{ fontSize: 11.5, color: 'rgba(74,222,128,0.50)' }}>Complete</div>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div style={{ flexShrink: 0 }}>
                    {isDone ? (
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#4ade80',
                        padding: '3px 9px', borderRadius: 999,
                        background: 'rgba(74,222,128,0.09)', border: '1px solid rgba(74,222,128,0.18)',
                      }}>Done</span>
                    ) : isActive ? (
                      <div style={{
                        width: 18, height: 18,
                        border: '2px solid rgba(124,92,255,0.30)',
                        borderTopColor: '#b9a4ff', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    ) : (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>Waiting</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </main>
      </div>
    </>
  )
}

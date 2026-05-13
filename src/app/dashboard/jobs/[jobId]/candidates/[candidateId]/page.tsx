'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, AlertTriangle,
  CheckCircle, XCircle, Star, MessageSquare, Shield,
  Briefcase, GraduationCap, User, ExternalLink, Link2,
} from 'lucide-react'

interface Pipeline {
  profile?: Record<string, unknown>
  risk?: Record<string, unknown>
  technical?: Record<string, unknown>
  behavioral?: Record<string, unknown>
  aggregated?: Record<string, unknown>
  decision?: Record<string, unknown>
  report?: Record<string, unknown>
}

interface CandidateDetail {
  candidate: { id: string; name: string | null; email: string | null; status: string; resumeName: string | null }
  pipeline: Pipeline | null
  durationMs: number | null
}

const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

function Section({ title, icon, children, delay = 0 }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay?: number }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '22px 24px',
      border: '1px solid rgba(124,58,237,0.09)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      animation: `fadeUp 0.4s ${delay}s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ color: '#7C3AED' }}>{icon}</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F1035', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ScoreCard({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <div style={{
      flex: 1, padding: '16px', borderRadius: 12, textAlign: 'center',
      background: `${color}08`, border: `1px solid ${color}20`,
    }}>
      <p style={{ fontSize: 28, fontWeight: 800, color, margin: '0 0 4px' }}>
        {value != null ? value : '—'}
      </p>
      <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{label}</p>
    </div>
  )
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string
  const candidateId = params.candidateId as string

  const [detail, setDetail] = useState<CandidateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [overrideLoading, setOverrideLoading] = useState(false)
  const [overrideMsg, setOverrideMsg] = useState('')

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/candidates/${candidateId}/detail`)
      .then(r => r.json())
      .then((data: CandidateDetail) => {
        setDetail(data)
        const s = data.candidate.status
        if (s === 'interview') setOverrideMsg('Moved to Interview')
        else if (s === 'approve') setOverrideMsg('Approved')
        else if (s === 'reject') setOverrideMsg('Rejected')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobId, candidateId])

  async function handleOverride(action: 'approve' | 'reject' | 'interview') {
    setOverrideLoading(true)
    try {
      await fetch(`/api/candidates/${candidateId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      setOverrideMsg(action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Moved to Interview')
    } catch {
      setOverrideMsg('Action saved')
    } finally {
      setOverrideLoading(false)
    }
  }

  const p = detail?.pipeline
  const profile  = p?.profile  as Record<string, unknown> | null | undefined
  const risk     = p?.risk     as Record<string, unknown> | null | undefined
  const technical = p?.technical as Record<string, unknown> | null | undefined
  const aggregated = p?.aggregated as Record<string, unknown> | null | undefined
  const decision = p?.decision  as Record<string, unknown> | null | undefined
  const report   = p?.report   as Record<string, unknown> | null | undefined

  const name         = detail?.candidate.name ?? (profile?.name as string) ?? 'Candidate'
  const email        = detail?.candidate.email ?? (profile?.email as string) ?? null
  const phone        = (profile?.phone as string) ?? null
  const githubUrl    = (report?.githubUrl as string) ?? (profile?.githubUrl as string) ?? null
  const linkedinUrl  = (report?.linkedinUrl as string) ?? (profile?.linkedinUrl as string) ?? null
  const compositeScore = (aggregated?.compositeScore as number) ?? (report?.compositeScore as number) ?? null
  const skillsScore  = ((aggregated as Record<string, Record<string, number>> | null | undefined)?.breakdown?.skills) ?? null
  const techScore    = ((aggregated as Record<string, Record<string, number>> | null | undefined)?.breakdown?.technical) ?? null
  const cultureScore = ((aggregated as Record<string, Record<string, number>> | null | undefined)?.breakdown?.culture) ?? null
  const recommendation = (report?.recommendation as string) ?? (aggregated?.rankLabel as string) ?? null
  const matchedSkills = (report?.matchedSkills as string[]) ?? []
  const missingSkills = (report?.missingSkills as string[]) ?? []
  const interviewQs   = (report?.interviewQuestions as string[]) ?? (decision?.interviewQuestions as string[]) ?? []
  const executiveSummary = (report?.executiveSummary as string) ?? ''
  const riskLevel    = (risk?.riskLevel as string) ?? null
  const riskFlags    = (risk?.flags as string[]) ?? []
  const githubSummary = (report?.githubSummary as string) ?? (technical?.githubAnalysis as string) ?? ''
  const experienceYears = (profile?.experienceYears as number) ?? null
  const companies    = (profile?.companies as string[]) ?? []
  const education    = (profile?.education as string[]) ?? []
  const skills       = (profile?.skills as string[]) ?? []
  const decisionConfidence = (report?.decisionConfidence as number) ?? (decision?.decisionConfidence as number) ?? null

  const recStyle: Record<string, { color: string; bg: string }> = {
    'strong_hire':     { color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    'Strong Hire':     { color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    'consider':        { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    'Consider':        { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    'not_recommended': { color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
    'Not Recommended': { color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  }
  const recColor = recommendation ? (recStyle[recommendation] ?? { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' }) : null

  const riskColor = riskLevel === 'high' || riskLevel === 'critical' ? '#EF4444'
    : riskLevel === 'medium' ? '#F59E0B' : '#10B981'

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
            onClick={() => router.push(`/dashboard/jobs/${jobId}/results`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: 'transparent',
              border: '1px solid rgba(124,58,237,0.18)', borderRadius: 999,
              color: '#7C3AED', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={14} /> Results
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(124,58,237,0.12)' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1F1035' }}>{name}</span>
          {recColor && recommendation && (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 999,
              color: recColor.color, background: recColor.bg,
            }}>
              {recommendation.replace('_', ' ')}
            </span>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8', fontSize: 14 }}>
            Loading candidate profile…
          </div>
        )}

        {!loading && !detail?.candidate && (
          <div style={{ textAlign: 'center', padding: '80px 32px', color: '#94A3B8' }}>
            <p style={{ fontWeight: 600, color: '#475569', marginBottom: 8 }}>Candidate not found</p>
            <p style={{ fontSize: 13 }}>Please go back to Results and refresh the page.</p>
          </div>
        )}

        {!loading && detail?.candidate && !detail?.pipeline && (
          <div style={{ textAlign: 'center', padding: '80px 32px', color: '#94A3B8' }}>
            <p style={{ fontWeight: 600, color: '#475569', marginBottom: 8 }}>No pipeline data found</p>
            <p style={{ fontSize: 13 }}>This candidate may still be processing.</p>
          </div>
        )}

        {!loading && detail?.pipeline && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Score Overview */}
            <Section title="Score Overview" icon={<Star size={16} />} delay={0.05}>
              <div style={{ display: 'flex', gap: 12, marginBottom: compositeScore != null ? 20 : 0 }}>
                <ScoreCard label="Skills Match" value={skillsScore} color="#7C3AED" />
                <ScoreCard label="Technical" value={techScore} color="#3B82F6" />
                <ScoreCard label="Culture Fit" value={cultureScore} color="#10B981" />
                <ScoreCard label="Composite" value={compositeScore} color={compositeScore != null && compositeScore >= 90 ? '#10B981' : compositeScore != null && compositeScore >= 65 ? '#F59E0B' : '#EF4444'} />
              </div>
              {decisionConfidence != null && (
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                  Decision confidence: <span style={{ color: '#7C3AED', fontWeight: 600 }}>{decisionConfidence}%</span>
                </p>
              )}
            </Section>

            {/* Candidate Info */}
            <Section title="Candidate Profile" icon={<User size={16} />} delay={0.10}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {email && (
                  <div>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>Email</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1F1035' }}>{email}</p>
                  </div>
                )}
                {phone && (
                  <div>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>Phone</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1F1035' }}>{phone}</p>
                  </div>
                )}
                {experienceYears != null && (
                  <div>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 3 }}>Experience</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1F1035' }}>{experienceYears} years</p>
                  </div>
                )}
                {(githubUrl || linkedinUrl) && (
                  <div>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>Profiles</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {githubUrl && (
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#7C3AED', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                          <Link2 size={14} /> GitHub <ExternalLink size={11} />
                        </a>
                      )}
                      {linkedinUrl && (
                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0A66C2', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                          <Link2 size={14} /> LinkedIn <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {companies.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>Companies</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {companies.map((c, i) => (
                      <span key={i} style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: 'rgba(71,85,105,0.08)', padding: '3px 10px', borderRadius: 999 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Education */}
            {education.length > 0 && (
              <Section title="Education" icon={<GraduationCap size={16} />} delay={0.13}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {education.map((e, i) => (
                    <p key={i} style={{ fontSize: 13, color: '#475569', margin: 0 }}>{e}</p>
                  ))}
                </div>
              </Section>
            )}

            {/* Skill Analysis */}
            <Section title="Skill Analysis" icon={<Briefcase size={16} />} delay={0.16}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle size={13} /> Matched Skills
                  </p>
                  {matchedSkills.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {matchedSkills.map(s => (
                        <span key={s} style={{ fontSize: 13, color: '#065F46', background: 'rgba(16,185,129,0.08)', padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>✓ {s}</span>
                      ))}
                    </div>
                  ) : <p style={{ fontSize: 12, color: '#CBD5E1' }}>None detected</p>}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <XCircle size={13} /> Missing Skills
                  </p>
                  {missingSkills.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {missingSkills.map(s => (
                        <span key={s} style={{ fontSize: 13, color: '#991B1B', background: 'rgba(239,68,68,0.08)', padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>✗ {s}</span>
                      ))}
                    </div>
                  ) : <p style={{ fontSize: 12, color: '#CBD5E1' }}>None</p>}
                </div>
              </div>
              {skills.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(124,58,237,0.07)' }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>All extracted skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {skills.map(s => (
                      <span key={s} style={{ fontSize: 11, fontWeight: 500, color: '#7C3AED', background: 'rgba(124,58,237,0.07)', padding: '2px 8px', borderRadius: 999 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* GitHub Analysis */}
            {githubSummary && (
              <Section title="GitHub Analysis" icon={<Link2 size={16} />} delay={0.19}>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, margin: 0 }}>{githubSummary}</p>
                {githubUrl && (
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, color: '#7C3AED', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    <Link2 size={14} /> View GitHub Profile <ExternalLink size={12} />
                  </a>
                )}
              </Section>
            )}

            {/* Risk Analysis */}
            {riskLevel && (
              <Section title="Risk Analysis" icon={<Shield size={16} />} delay={0.22}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, textTransform: 'capitalize',
                    color: riskColor, background: `${riskColor}18`,
                  }}>
                    {riskLevel} Risk
                  </span>
                </div>
                {riskFlags.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {riskFlags.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <AlertTriangle size={13} style={{ color: '#F59E0B', marginTop: 2, flexShrink: 0 }} />
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{f}</p>
                      </div>
                    ))}
                  </div>
                )}
                {!riskFlags.length && (
                  <p style={{ fontSize: 13, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <CheckCircle size={14} /> No risk flags detected
                  </p>
                )}
              </Section>
            )}

            {/* AI Recommendation */}
            {executiveSummary && (
              <Section title="AI Recommendation" icon={<Star size={16} />} delay={0.25}>
                <p style={{ fontSize: 14, color: '#1F1035', lineHeight: 1.7, margin: '0 0 12px' }}>{executiveSummary}</p>
                {(report?.recruiterActionRecommendation as string) && (
                  <p style={{ fontSize: 13, color: '#7C3AED', fontWeight: 500, padding: '10px 14px', background: 'rgba(124,58,237,0.06)', borderRadius: 10, margin: 0 }}>
                    {report?.recruiterActionRecommendation as string}
                  </p>
                )}
              </Section>
            )}

            {/* Interview Questions */}
            {interviewQs.length > 0 && (
              <Section title="Interview Questions" icon={<MessageSquare size={16} />} delay={0.28}>
                <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {interviewQs.map((q, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{q}</li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Recruiter Actions */}
            <Section title="Recruiter Decision" icon={<CheckCircle size={16} />} delay={0.31}>
              {overrideMsg ? (
                <p style={{ fontSize: 14, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  <CheckCircle size={16} /> {overrideMsg}
                </p>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { action: 'approve' as const, label: 'Approve', color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
                    { action: 'interview' as const, label: 'Move to Interview', color: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
                    { action: 'reject' as const, label: 'Reject', color: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
                  ].map(btn => (
                    <button
                      key={btn.action}
                      type="button"
                      disabled={overrideLoading}
                      onClick={() => handleOverride(btn.action)}
                      style={{
                        padding: '9px 20px', borderRadius: 10, border: 'none',
                        fontSize: 13, fontWeight: 600, cursor: overrideLoading ? 'not-allowed' : 'pointer',
                        color: btn.color, background: btn.bg, fontFamily: 'inherit',
                        opacity: overrideLoading ? 0.6 : 1,
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </Section>

          </div>
        )}
      </div>
    </>
  )
}

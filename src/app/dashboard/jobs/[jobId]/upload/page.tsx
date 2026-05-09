'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Sparkles, Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react'

const STYLES = `
@keyframes drift0{0%{transform:translate(-50%,-50%) translate(0px,0px) scale(1)}50%{transform:translate(-50%,-50%) translate(120px,-60px) scale(1.18)}100%{transform:translate(-50%,-50%) translate(40px,80px) scale(0.96)}}
@keyframes drift1{0%{transform:translate(-50%,-50%) translate(0,0) scale(1)}50%{transform:translate(-50%,-50%) translate(-140px,90px) scale(1.10)}100%{transform:translate(-50%,-50%) translate(-40px,-60px) scale(0.94)}}
@keyframes drift2{0%{transform:translate(-50%,-50%) translate(0,0) scale(1)}50%{transform:translate(-50%,-50%) translate(80px,-110px) scale(1.15)}100%{transform:translate(-50%,-50%) translate(-60px,30px) scale(1.02)}}
@keyframes drift3{0%{transform:translate(-50%,-50%) translate(0,0) scale(1)}50%{transform:translate(-50%,-50%) translate(140px,60px) scale(1.22)}100%{transform:translate(-50%,-50%) translate(40px,-90px) scale(0.92)}}
.up-blob-0{animation:drift0 22s ease-in-out infinite alternate}
.up-blob-1{animation:drift1 26s ease-in-out infinite alternate}
.up-blob-2{animation:drift2 30s ease-in-out infinite alternate}
.up-blob-3{animation:drift3 34s ease-in-out infinite alternate}
@keyframes ctaShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.up-cta-bg{animation:ctaShift 8s ease-in-out infinite}
@keyframes ctaShine{0%{left:-50%}60%{left:130%}100%{left:130%}}
.up-cta-shine{animation:ctaShine 4.5s 1s ease-in-out infinite}
@keyframes spinnerKf{to{transform:rotate(360deg)}}
.up-spinner{animation:spinnerKf 0.7s linear infinite}
@keyframes pulseDot{0%{box-shadow:0 0 0 0 rgba(110,231,183,0.7)}70%{box-shadow:0 0 0 8px rgba(110,231,183,0)}100%{box-shadow:0 0 0 0 rgba(110,231,183,0)}}
@keyframes riseIn{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes fileIn{from{transform:translateX(-8px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes dropPulse{0%,100%{border-color:rgba(186,168,255,0.4)}50%{border-color:rgba(124,92,255,0.9)}}
.drop-active{animation:dropPulse 0.8s ease-in-out infinite}
`

function Aurora() {
  const blobs = [
    { c: '#7c5cff', x: '10%', y: '20%', s: 620 },
    { c: '#22d3ee', x: '80%', y: '15%', s: 540 },
    { c: '#ff5dc8', x: '60%', y: '78%', s: 640 },
    { c: '#5eead4', x: '15%', y: '80%', s: 460 },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, #0e0a26 0%, #07061a 60%, #030210 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(80px) saturate(140%)' }}>
        {blobs.map((b, i) => (
          <div key={i} className={`up-blob-${i}`} style={{
            position: 'absolute', left: b.x, top: b.y,
            width: b.s, height: b.s, borderRadius: '50%',
            transform: 'translate(-50%,-50%)', mixBlendMode: 'screen', opacity: 0.85,
            background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, ${b.c}66 35%, transparent 70%)`,
          }} />
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '3px 3px', opacity: 0.35, mixBlendMode: 'overlay' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(3,2,12,0.7) 95%)' }} />
    </div>
  )
}

interface DroppedFile { file: File; id: string }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ACCEPTED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ACCEPTED_EXT = ['.pdf', '.doc', '.docx']

export default function UploadPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [files, setFiles] = useState<DroppedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming)
    const valid = arr.filter(f => ACCEPTED.includes(f.type) || ACCEPTED_EXT.some(ext => f.name.toLowerCase().endsWith(ext)))
    const invalid = arr.length - valid.length
    if (invalid > 0) setError(`${invalid} file(s) skipped — only PDF, DOC, DOCX allowed.`)
    else setError('')
    setFiles(prev => {
      const combined = [...prev, ...valid.map(f => ({ file: f, id: `${f.name}-${Date.now()}-${Math.random()}` }))]
      if (combined.length > 10) { setError('Max 10 files allowed.'); return combined.slice(0, 10) }
      return combined
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleSubmit = async () => {
    if (!files.length) { setError('Please add at least one resume.'); return }
    setError(''); setLoading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f.file))
      const res = await fetch(`/api/jobs/${jobId}/candidates`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      setSuccess(true)
      // Fire-and-forget — pipeline runs in background, user doesn't wait
      fetch('/api/run-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      }).catch(() => {})
      setTimeout(() => router.push(`/dashboard/jobs/${jobId}/screening`), 1000)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <ArrowLeft size={15} /> Back
          </button>
          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d6cdff', fontWeight: 600, fontSize: 13.5 }}>
            <Sparkles size={14} style={{ color: '#b9a4ff' }} />
            Upload Resumes
          </div>
          <div style={{ flex: 1 }} />
          {/* Step indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'rgba(214,205,255,0.7)',
            padding: '6px 12px', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999, background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{ color: 'rgba(110,231,183,0.7)', fontWeight: 600 }}>Step 1 ✓</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
            <span style={{ color: '#c9b8ff', fontWeight: 600 }}>Step 2: Resumes</span>
          </div>
        </header>

        <main style={{ maxWidth: 720, margin: '0 auto', padding: '56px 28px 96px', position: 'relative', zIndex: 2 }}>

          {/* Hero */}
          <div style={{ marginBottom: 36, animation: 'riseIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 999,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#c9b8ff',
              background: 'linear-gradient(135deg, rgba(124,92,255,0.16), rgba(34,211,238,0.10))',
              border: '1px solid rgba(186,168,255,0.18)',
            }}>
              <Upload size={12} style={{ color: '#b9a4ff' }} />
              Step 2 of 3
            </span>
            <h1 style={{
              margin: '14px 0 8px',
              fontSize: 'clamp(30px, 4.5vw, 46px)', fontWeight: 600,
              letterSpacing: '-0.025em', lineHeight: 1.05,
              backgroundImage: success
                ? 'linear-gradient(180deg, #6ee7b7, #34d399)'
                : 'linear-gradient(180deg, #ffffff 0%, #d2c4ff 60%, #a08bff 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              {success ? 'Resumes Uploaded!' : 'Upload Candidate Resumes'}
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(230,226,255,0.72)', maxWidth: 520, lineHeight: 1.55 }}>
              {success
                ? 'AI screening is starting. Redirecting to dashboard…'
                : 'Drop PDF or DOCX files below. The AI agents will extract and evaluate each candidate automatically.'}
            </p>
          </div>

          {/* Success */}
          {success && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(16,185,129,0.4)',
              }}>
                <CheckCircle2 size={40} style={{ color: '#fff' }} />
              </div>
            </div>
          )}

          {!success && (
            <div style={{
              position: 'relative', borderRadius: 28, padding: '32px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.020) 100%)',
              backdropFilter: 'blur(22px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 80px -20px rgba(20,5,60,0.6), 0 8px 32px -8px rgba(124,92,255,0.18)',
              animation: 'riseIn 0.8s 0.1s cubic-bezier(.2,.7,.2,1) both',
            }}>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={dragging ? 'drop-active' : ''}
                style={{
                  borderRadius: 18, border: `2px dashed ${dragging ? 'rgba(124,92,255,0.9)' : 'rgba(186,168,255,0.30)'}`,
                  padding: '48px 24px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'border-color 0.2s ease, background 0.2s ease',
                  background: dragging ? 'rgba(124,92,255,0.08)' : 'rgba(255,255,255,0.02)',
                  marginBottom: files.length ? 20 : 0,
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(124,92,255,0.20), rgba(34,211,238,0.12))',
                  border: '1px solid rgba(186,168,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Upload size={24} style={{ color: '#b9a4ff' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#ece8ff' }}>
                    {dragging ? 'Drop files here' : 'Drag & drop resumes here'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(230,226,255,0.50)' }}>
                    or click to browse · PDF, DOC, DOCX · max 10 files
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  aria-label="Upload resume files (PDF, DOC, DOCX)"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files && addFiles(e.target.files)}
                />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'rgba(230,226,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {files.length} file{files.length > 1 ? 's' : ''} ready
                  </p>
                  {files.map(({ file, id }) => (
                    <div key={id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      animation: 'fileIn 0.2s ease both',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: file.name.endsWith('.pdf')
                          ? 'linear-gradient(135deg, rgba(255,77,109,0.25), rgba(255,77,109,0.10))'
                          : 'linear-gradient(135deg, rgba(34,211,238,0.25), rgba(34,211,238,0.10))',
                        border: '1px solid rgba(255,255,255,0.10)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FileText size={15} style={{ color: file.name.endsWith('.pdf') ? '#ffb8c4' : '#67e8f9' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#ece8ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(230,226,255,0.45)' }}>
                          {formatBytes(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setFiles(prev => prev.filter(f => f.id !== id))}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: '50%', border: 0,
                          background: 'rgba(255,255,255,0.06)', color: 'rgba(230,226,255,0.6)',
                          cursor: 'pointer', flexShrink: 0,
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 16, padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(255,77,109,0.10)', border: '1px solid rgba(255,150,170,0.25)',
                  color: '#ffb8c4', fontSize: 13.5,
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !files.length}
                style={{
                  position: 'relative', width: '100%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: 52, padding: '0 28px', border: 0, borderRadius: 16,
                  color: '#ffffff', fontSize: 15, fontWeight: 600,
                  cursor: loading || !files.length ? 'not-allowed' : 'pointer',
                  overflow: 'hidden', isolation: 'isolate',
                  boxShadow: '0 14px 40px -12px rgba(124,92,255,0.55), 0 4px 14px -4px rgba(34,211,238,0.30)',
                  opacity: !files.length ? 0.5 : 1,
                  fontFamily: 'inherit',
                }}
              >
                <span className="up-cta-bg" style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  background: 'linear-gradient(120deg, #6e4cff 0%, #b164ff 40%, #ff5dc8 70%, #22d3ee 110%)',
                  backgroundSize: '220% 220%',
                }} />
                <span className="up-cta-shine" style={{
                  position: 'absolute', top: 0, bottom: 0, left: '-50%', width: '30%',
                  background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.45), transparent)',
                  zIndex: 1, transform: 'skewX(-20deg)',
                }} />
                <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {loading ? (
                    <>
                      <span className="up-spinner" style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
                      }} />
                      Uploading…
                    </>
                  ) : (
                    <><Sparkles size={16} /> Start AI Screening</>
                  )}
                </span>
              </button>

              <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'rgba(230,226,255,0.40)', textAlign: 'center' }}>
                AI agents will extract, verify, and score each candidate automatically.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

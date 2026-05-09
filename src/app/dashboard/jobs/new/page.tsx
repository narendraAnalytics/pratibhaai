'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase, Building2, MapPin, Clock, TrendingUp, FileText, Tag, X,
  ArrowLeft, Sparkles, CheckCircle2, ChevronDown, Search,
} from 'lucide-react'

// ─── Data ──────────────────────────────────────────────────────────────────────

const JOB_TITLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'React Developer', 'Next.js Developer', 'Vue.js Developer', 'Angular Developer',
  'Node.js Developer', 'Python Developer', 'Go Developer', 'Rust Engineer',
  'Java Developer', 'C++ Engineer', 'C# Developer', '.NET Developer',
  'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 'Data Engineer',
  'DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'Cloud Architect',
  'Mobile Developer', 'iOS Developer', 'Android Developer',
  'React Native Developer', 'Flutter Developer',
  'QA Engineer', 'Test Automation Engineer', 'Security Engineer',
  'Product Manager', 'Engineering Manager', 'Tech Lead', 'Staff Engineer',
  'Principal Engineer', 'Software Architect', 'UI Designer', 'UX Designer',
  'Senior Frontend Engineer', 'Senior Backend Engineer', 'Senior Full Stack Engineer',
  'Lead Frontend Engineer', 'Lead Backend Engineer', 'Blockchain Developer',
  'Solidity Developer', 'Embedded Systems Engineer', 'Firmware Engineer',
]

const SKILLS_LIST = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Remix',
  'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'SASS',
  'Node.js', 'Express', 'Fastify', 'NestJS', 'Hono',
  'Python', 'Django', 'FastAPI', 'Flask',
  'Go', 'Rust', 'Java', 'Spring Boot', 'C++', 'C#', '.NET',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'GraphQL', 'REST API', 'gRPC', 'WebSockets', 'tRPC',
  'Git', 'CI/CD', 'GitHub Actions', 'Jenkins', 'ArgoCD',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'LangChain',
  'Data Analysis', 'Pandas', 'NumPy', 'SQL', 'Apache Spark',
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo',
  'Solidity', 'Web3.js', 'Ethers.js', 'Blockchain',
  'System Design', 'Microservices', 'Event-Driven Architecture',
  'Jest', 'Cypress', 'Playwright', 'Vitest',
  'Agile', 'Scrum', 'Figma', 'Storybook',
  'OpenAI API', 'Anthropic API', 'Google ADK', 'Gemini', 'Hugging Face',
]

// ─── CSS keyframes (injected once) ────────────────────────────────────────────

const STYLES = `
@keyframes drift0{0%{transform:translate(-50%,-50%) translate(0px,0px) scale(1)}50%{transform:translate(-50%,-50%) translate(120px,-60px) scale(1.18)}100%{transform:translate(-50%,-50%) translate(40px,80px) scale(0.96)}}
@keyframes drift1{0%{transform:translate(-50%,-50%) translate(0,0) scale(1)}50%{transform:translate(-50%,-50%) translate(-140px,90px) scale(1.10)}100%{transform:translate(-50%,-50%) translate(-40px,-60px) scale(0.94)}}
@keyframes drift2{0%{transform:translate(-50%,-50%) translate(0,0) scale(1)}50%{transform:translate(-50%,-50%) translate(80px,-110px) scale(1.15)}100%{transform:translate(-50%,-50%) translate(-60px,30px) scale(1.02)}}
@keyframes drift3{0%{transform:translate(-50%,-50%) translate(0,0) scale(1)}50%{transform:translate(-50%,-50%) translate(140px,60px) scale(1.22)}100%{transform:translate(-50%,-50%) translate(40px,-90px) scale(0.92)}}
.blob-0{animation:drift0 22s ease-in-out infinite alternate}
.blob-1{animation:drift1 26s ease-in-out infinite alternate}
.blob-2{animation:drift2 30s ease-in-out infinite alternate}
.blob-3{animation:drift3 34s ease-in-out infinite alternate}
@keyframes floatUp{0%{transform:translateY(20vh) scale(0.6);opacity:0}10%{opacity:1}90%{opacity:0.9}100%{transform:translateY(-110vh) scale(1.1);opacity:0}}
.particle{animation:floatUp linear infinite}
@keyframes cardSpin{to{transform:rotate(1turn)}}
.card-border-spin{animation:cardSpin 18s linear infinite}
@keyframes ctaShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.cta-bg-anim{animation:ctaShift 8s ease-in-out infinite}
@keyframes ctaShine{0%{left:-50%}60%{left:130%}100%{left:130%}}
.cta-shine-anim{animation:ctaShine 4.5s 1s ease-in-out infinite}
@keyframes spinnerKf{to{transform:rotate(360deg)}}
.spinner{animation:spinnerKf 0.7s linear infinite}
@keyframes segIn{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes chipIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes acPop{from{transform:translateY(-4px) scale(.98);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
@keyframes pulseDot{0%{box-shadow:0 0 0 0 rgba(110,231,183,0.7)}70%{box-shadow:0 0 0 8px rgba(110,231,183,0)}100%{box-shadow:0 0 0 0 rgba(110,231,183,0)}}
@keyframes riseIn{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
`

// ─── Aurora background ─────────────────────────────────────────────────────────

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
          <div
            key={i}
            className={`blob-${i}`}
            style={{
              position: 'absolute', left: b.x, top: b.y,
              width: b.s, height: b.s, borderRadius: '50%',
              transform: 'translate(-50%,-50%)', mixBlendMode: 'screen', opacity: 0.85,
              background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, ${b.c}66 35%, transparent 70%)`,
            }}
          />
        ))}
      </div>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }} aria-hidden="true">
        <defs>
          <pattern id="njg" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#njg)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '3px 3px', opacity: 0.35, mixBlendMode: 'overlay',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(3,2,12,0.7) 95%)',
      }} />
    </div>
  )
}

// ─── Floating particles ───────────────────────────────────────────────────────

function Particles() {
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; s: number; d: number; delay: number; o: number }>>([])
  useEffect(() => {
    setDots(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      s: 1 + Math.random() * 2.5,
      d: 14 + Math.random() * 22,
      delay: -Math.random() * 20,
      o: 0.3 + Math.random() * 0.6,
    })))
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
      {dots.map(d => (
        <span
          key={d.id}
          className="particle"
          style={{
            position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
            width: d.s, height: d.s, borderRadius: '999px', opacity: d.o,
            background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)',
            boxShadow: '0 0 8px rgba(186,168,255,0.8)',
            animationDuration: `${d.d}s`, animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Glass field wrapper ───────────────────────────────────────────────────────

function Field({ label, icon: Icon, hint, children }: {
  label: string; icon: React.ElementType; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'rgba(230,226,255,0.72)',
      }}>
        <Icon size={13} style={{ color: '#b9a4ff' }} />
        {label}
      </label>
      {children}
      {hint && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(230,226,255,0.45)' }}>{hint}</p>}
    </div>
  )
}

// ─── Glass input shell style ───────────────────────────────────────────────────

const inputShellStyle: React.CSSProperties = {
  position: 'relative', display: 'flex', alignItems: 'center',
  borderRadius: 14,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.10)',
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
}

const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 0,
  padding: '13px 14px',
  background: 'transparent', border: 0, outline: 'none',
  font: '500 14px/1.4 inherit',
  color: '#f2efff',
}

// ─── Title Autocomplete ───────────────────────────────────────────────────────

function TitleAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = value.trim().length === 0
    ? JOB_TITLES.slice(0, 8)
    : JOB_TITLES.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const select = (v: string) => { onChange(v); setOpen(false); setCursor(-1) }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) { if (e.key === 'ArrowDown') setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, -1)) }
    else if (e.key === 'Enter' && cursor >= 0) { e.preventDefault(); select(filtered[cursor]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{
        ...inputShellStyle,
        ...(focused ? {
          borderColor: 'rgba(186,168,255,0.55)',
          boxShadow: '0 0 0 4px rgba(124,92,255,0.14), 0 8px 24px -8px rgba(124,92,255,0.35)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
        } : {}),
      }}>
        <Search size={15} style={{ marginLeft: 12, color: 'rgba(230,226,255,0.5)', flexShrink: 0 }} />
        <input
          style={{ ...inputStyle, paddingLeft: 8 }}
          placeholder="e.g. Senior Full Stack Engineer"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); setCursor(-1) }}
          onFocus={() => { setOpen(true); setFocused(true) }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKey}
          autoComplete="off"
        />
        <ChevronDown
          size={15}
          style={{
            marginRight: 12, color: 'rgba(230,226,255,0.5)', flexShrink: 0,
            transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </div>

      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          listStyle: 'none', margin: 0, padding: '6px 6px',
          borderRadius: 18,
          background: 'linear-gradient(160deg, rgba(28,16,58,0.98) 0%, rgba(18,10,40,0.98) 100%)',
          backdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(186,168,255,0.22)',
          boxShadow: '0 8px 40px -4px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,92,255,0.10) inset',
          zIndex: 200, maxHeight: 280, overflowY: 'auto',
          animation: 'acPop 0.18s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {filtered.map((item, i) => {
            const lo = value.toLowerCase()
            const idx = item.toLowerCase().indexOf(lo)
            const isActive = i === cursor
            return (
              <li
                key={item}
                onMouseDown={() => select(item)}
                onMouseEnter={() => setCursor(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', borderRadius: 12,
                  fontSize: 13.5, fontWeight: 500, color: isActive ? '#f0ecff' : '#c5bcf0',
                  cursor: 'pointer', letterSpacing: '0.01em',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(124,92,255,0.22) 0%, rgba(34,211,238,0.10) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '2px solid rgba(124,92,255,0.7)' : '2px solid transparent',
                  transition: 'background 0.1s ease, color 0.1s ease, border-color 0.1s ease',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(124,92,255,0.25)' : 'rgba(255,255,255,0.06)',
                  fontSize: 11,
                }}>💼</span>
                <span style={{ flex: 1 }}>
                  {lo && idx !== -1 ? (
                    <>
                      {item.slice(0, idx)}
                      <span style={{ fontWeight: 700, color: '#c084fc' }}>{item.slice(idx, idx + value.length)}</span>
                      {item.slice(idx + value.length)}
                    </>
                  ) : item}
                </span>
                {isActive && (
                  <span style={{ fontSize: 10, color: 'rgba(192,132,252,0.6)', fontWeight: 600, letterSpacing: '0.05em' }}>↵</span>
                )}
              </li>
            )
          })}
          {value.trim() && !filtered.some(f => f.toLowerCase() === value.toLowerCase()) && (
            <li
              onMouseDown={() => select(value.trim())}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', borderRadius: 12, marginTop: 2,
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingTop: 11,
                fontSize: 13.5, color: '#a78bfa', cursor: 'pointer', fontStyle: 'italic',
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(167,139,250,0.12)',
              }}>✏️</span>
              Use &ldquo;<span style={{ fontWeight: 700, fontStyle: 'normal', color: '#c084fc' }}>{value.trim()}</span>&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

// ─── Skills typeahead ─────────────────────────────────────────────────────────

function SkillsInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = input.trim().length === 0
    ? SKILLS_LIST.filter(s => !skills.includes(s)).slice(0, 10)
    : SKILLS_LIST.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s)).slice(0, 10)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const add = (skill: string) => {
    const s = skill.trim()
    if (s && !skills.includes(s)) onChange([...skills, s])
    setInput(''); setCursor(-1)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, -1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (cursor >= 0 && filtered[cursor]) add(filtered[cursor])
      else if (input.trim()) add(input)
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      onChange(skills.slice(0, -1))
    } else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6,
          minHeight: 50, padding: '8px 10px', borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.10)', cursor: 'text',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          ...(focused ? {
            borderColor: 'rgba(186,168,255,0.55)',
            boxShadow: '0 0 0 4px rgba(124,92,255,0.14)',
          } : {}),
        }}
        onClick={() => setOpen(true)}
      >
        {skills.map(skill => (
          <span
            key={skill}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 9px 5px 10px', borderRadius: 999,
              fontSize: 12.5, fontWeight: 500, color: '#ece8ff',
              background: 'linear-gradient(135deg, rgba(124,92,255,0.30), rgba(34,211,238,0.20))',
              border: '1px solid rgba(186,168,255,0.32)',
              animation: 'chipIn 0.18s cubic-bezier(.3,1.6,.5,1) both',
            }}
          >
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onMouseDown={e => { e.stopPropagation(); onChange(skills.filter(s => s !== skill)) }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 16, height: 16, padding: 0, border: 0, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)', color: '#ece8ff', cursor: 'pointer',
              }}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          style={{
            flex: 1, minWidth: 140, padding: '6px 4px',
            background: 'transparent', border: 0, outline: 'none',
            font: '500 13.5px/1.4 inherit', color: '#f2efff',
          }}
          placeholder={skills.length === 0 ? 'Type to search skills…' : 'Add more…'}
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); setCursor(-1) }}
          onFocus={() => { setOpen(true); setFocused(true) }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKey}
          autoComplete="off"
        />
      </div>

      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          listStyle: 'none', margin: 0, padding: 6, borderRadius: 14,
          background: 'rgba(20,12,44,0.92)', backdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(186,168,255,0.18)',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.55)',
          zIndex: 50, maxHeight: 300, overflowY: 'auto',
          animation: 'acPop 0.15s ease-out both',
        }}>
          {filtered.map((item, i) => {
            const lo = input.toLowerCase()
            const idx = item.toLowerCase().indexOf(lo)
            return (
              <li
                key={item}
                onMouseDown={() => { add(item); setOpen(true) }}
                onMouseEnter={() => setCursor(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10,
                  fontSize: 13.5, color: '#e6e2ff', cursor: 'pointer',
                  background: i === cursor ? 'linear-gradient(90deg, rgba(124,92,255,0.18), rgba(34,211,238,0.10))' : 'transparent',
                  transition: 'background 0.12s ease',
                }}
              >
                <Tag size={12} style={{ color: 'rgba(186,168,255,0.7)', flexShrink: 0 }} />
                {lo && idx !== -1 ? (
                  <>{item.slice(0, idx)}<span style={{ fontWeight: 700, color: '#c9b8ff' }}>{item.slice(idx, idx + input.length)}</span>{item.slice(idx + input.length)}</>
                ) : item}
              </li>
            )
          })}
          {input.trim() && !filtered.some(f => f.toLowerCase() === input.toLowerCase()) && (
            <li
              onMouseDown={() => { add(input); setOpen(true) }}
              style={{
                padding: '10px 12px', borderRadius: 10, borderTop: '1px solid rgba(255,255,255,0.06)',
                marginTop: 4, fontSize: 13.5, color: '#c9b8ff', cursor: 'pointer',
              }}
            >
              Add &ldquo;<span style={{ fontWeight: 700 }}>{input.trim()}</span>&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

// ─── Segmented option pills ───────────────────────────────────────────────────

function Segment({ options, value, onChange }: {
  options: Array<string | { val: string; label: string }>
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{
      display: 'inline-flex', flexWrap: 'wrap', gap: 8, padding: 6,
      borderRadius: 16,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {options.map(o => {
        const v = typeof o === 'string' ? o : o.val
        const l = typeof o === 'string' ? o[0].toUpperCase() + o.slice(1) : o.label
        const selected = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              position: 'relative', padding: '9px 16px', border: 0, borderRadius: 11,
              background: selected
                ? 'linear-gradient(135deg, #7c5cff, #c084fc 60%, #22d3ee)'
                : 'transparent',
              color: selected ? '#ffffff' : 'rgba(230,226,255,0.65)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'color 0.18s ease, transform 0.18s ease',
              boxShadow: selected ? '0 0 0 0 rgba(124,92,255,0.45)' : 'none',
              animation: selected ? 'segIn 0.25s cubic-bezier(.3,1.4,.5,1) both' : 'none',
            }}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHead({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
      <span style={{
        flexShrink: 0, fontFamily: 'ui-monospace, monospace',
        fontSize: 11, fontWeight: 600, color: '#a89aff', letterSpacing: '0.08em',
        padding: '6px 9px', borderRadius: 8,
        background: 'rgba(124,92,255,0.10)', border: '1px solid rgba(124,92,255,0.22)',
      }}>{num}</span>
      <div>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#ece8ff', letterSpacing: '-0.005em' }}>{title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'rgba(230,226,255,0.55)' }}>{sub}</p>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NewJobPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [locationType, setLocationType] = useState<'remote' | 'onsite' | 'hybrid'>('remote')
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract'>('full-time')
  const [experienceLevel, setExperienceLevel] = useState<'junior' | 'mid' | 'senior' | 'lead'>('mid')
  const [skills, setSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)

  // Mouse spotlight on card
  const cardRef = useRef<HTMLFormElement>(null)
  const [mx, setMx] = useState('50%')
  const [my, setMy] = useState('0%')
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = cardRef.current; if (!el) return
      const r = el.getBoundingClientRect()
      setMx(`${e.clientX - r.left}px`)
      setMy(`${e.clientY - r.top}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Job title is required.'); return }
    if (!description.trim()) { setError('Job description is required.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, department, description, locationType, jobType, experienceLevel, skills }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setJobId(data.job.id)
      setSuccess(true)
      setTimeout(() => router.push(`/dashboard/jobs/${data.job.id}/upload`), 1800)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Full-screen overlay — covers sidebar (z-40) */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto',
        fontFamily: "'Fira Sans', 'Geist', ui-sans-serif, system-ui, sans-serif",
        color: '#e6e2ff', background: '#050310',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <Aurora />
        <Particles />

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
              cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.22)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(230,226,255,0.78)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)' }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#d6cdff', fontWeight: 600, fontSize: 13.5 }}>
            <Sparkles size={14} style={{ color: '#b9a4ff' }} />
            New Job Post
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'rgba(214,205,255,0.7)',
            padding: '6px 12px', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999, background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#6ee7b7',
              animation: 'pulseDot 2.2s ease-out infinite',
              boxShadow: '0 0 0 0 rgba(110,231,183,0.6)',
            }} />
            Draft autosaved
          </div>
        </header>

        <main style={{ maxWidth: 880, margin: '0 auto', padding: '56px 28px 96px', position: 'relative', zIndex: 2 }}>

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
              <Sparkles size={12} style={{ color: '#b9a4ff' }} />
              AI-assisted hiring
            </span>
            <h1 style={{
              margin: '14px 0 8px',
              fontSize: 'clamp(34px, 5.2vw, 52px)', fontWeight: 600,
              letterSpacing: '-0.025em', lineHeight: 1.05,
              background: 'linear-gradient(180deg, #ffffff 0%, #d2c4ff 60%, #a08bff 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              {success ? 'Job Posted!' : 'Create a job post'}
            </h1>
            <p style={{ margin: 0, fontSize: 16, color: 'rgba(230,226,255,0.72)', maxWidth: 560, lineHeight: 1.55 }}>
              {success
                ? 'Redirecting you to the dashboard…'
                : "Describe the role — we'll build a hiring blueprint and start screening candidates the moment you publish."}
            </p>
          </div>

          {/* Success icon */}
          {success && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c5cff, #c084fc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(124,92,255,0.5)',
              }}>
                <CheckCircle2 size={40} style={{ color: '#fff' }} />
              </div>
            </div>
          )}

          {/* Form card */}
          {!success && (
            <form
              ref={cardRef}
              onSubmit={handleSubmit}
              style={{
                position: 'relative', borderRadius: 28, padding: '34px 36px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.020) 100%)',
                backdropFilter: 'blur(22px) saturate(140%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 30px 80px -20px rgba(20,5,60,0.6), 0 8px 32px -8px rgba(124,92,255,0.18)',
                overflow: 'hidden',
                animation: 'riseIn 0.8s 0.1s cubic-bezier(.2,.7,.2,1) both',
              }}
            >
              {/* Mouse spotlight */}
              <div style={{
                position: 'absolute', inset: -1, borderRadius: 28, pointerEvents: 'none',
                background: `radial-gradient(420px circle at ${mx} ${my}, rgba(186,168,255,0.13), transparent 60%)`,
              }} />
              {/* Rotating conic border */}
              <div
                className="card-border-spin"
                style={{
                  position: 'absolute', inset: 0, borderRadius: 28,
                  background: 'conic-gradient(from 120deg at 50% 50%, rgba(124,92,255,0) 0deg, rgba(124,92,255,0.55) 80deg, rgba(34,211,238,0.45) 160deg, rgba(255,93,200,0.45) 240deg, rgba(124,92,255,0) 360deg)',
                  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: 1, opacity: 0.55, pointerEvents: 'none',
                }}
              />

              {/* ── Section 1: Basics ── */}
              <section style={{ padding: '8px 0', position: 'relative', zIndex: 10 }}>
                <SectionHead num="01" title="Basics" sub="What's the role and where does it live?" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <Field label="Job Title" icon={Briefcase} hint="Type to search, or write your own.">
                    <TitleAutocomplete value={title} onChange={setTitle} />
                  </Field>
                  <Field label="Department" icon={Building2}>
                    <div style={inputShellStyle}>
                      <input
                        style={inputStyle}
                        placeholder="e.g. Engineering, Design"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                      />
                    </div>
                  </Field>
                </div>
              </section>

              <div style={{ height: 1, margin: '22px 0', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />

              {/* ── Section 2: Logistics ── */}
              <section style={{ padding: '8px 0', position: 'relative', zIndex: 2 }}>
                <SectionHead num="02" title="Logistics" sub="Set expectations for location, commitment, and seniority." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <Field label="Location Type" icon={MapPin}>
                    <Segment
                      options={['remote', 'onsite', 'hybrid']}
                      value={locationType}
                      onChange={v => setLocationType(v as typeof locationType)}
                    />
                  </Field>
                  <Field label="Job Type" icon={Clock}>
                    <Segment
                      options={[
                        { val: 'full-time', label: 'Full-Time' },
                        { val: 'part-time', label: 'Part-Time' },
                        { val: 'contract', label: 'Contract' },
                      ]}
                      value={jobType}
                      onChange={v => setJobType(v as typeof jobType)}
                    />
                  </Field>
                  <Field label="Experience Level" icon={TrendingUp}>
                    <Segment
                      options={[
                        { val: 'junior', label: 'Junior' },
                        { val: 'mid', label: 'Mid-Level' },
                        { val: 'senior', label: 'Senior' },
                        { val: 'lead', label: 'Lead / Staff' },
                      ]}
                      value={experienceLevel}
                      onChange={v => setExperienceLevel(v as typeof experienceLevel)}
                    />
                  </Field>
                </div>
              </section>

              <div style={{ height: 1, margin: '22px 0', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />

              {/* ── Section 3: Description ── */}
              <section style={{ padding: '8px 0', position: 'relative', zIndex: 2 }}>
                <SectionHead num="03" title="Description" sub="The AI will pull requirements straight from this." />
                <Field label="Role Description" icon={FileText} hint={`${description.length} characters · aim for 200+ for best results`}>
                  <div style={{ ...inputShellStyle, padding: 0 }}>
                    <textarea
                      style={{
                        ...inputStyle, padding: 14, resize: 'vertical',
                        minHeight: 140, fontFamily: 'inherit', lineHeight: 1.55,
                      }}
                      rows={7}
                      placeholder="Describe the role, responsibilities, and what you're looking for…"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </Field>
              </section>

              <div style={{ height: 1, margin: '22px 0', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />

              {/* ── Section 4: Skills ── */}
              <section style={{ padding: '8px 0', position: 'relative', zIndex: 2 }}>
                <SectionHead num="04" title="Required Skills" sub="Pick from suggestions or add your own — these power matching." />
                <Field label="Skills" icon={Tag} hint="Enter to add · Backspace removes the last chip">
                  <SkillsInput skills={skills} onChange={setSkills} />
                </Field>
              </section>

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(255,77,109,0.12), rgba(255,77,109,0.04))',
                  border: '1px solid rgba(255,150,170,0.28)',
                  color: '#ffb8c4', fontSize: 13.5, animation: 'riseIn 0.25s ease',
                }}>
                  {error}
                </div>
              )}

              {/* CTA */}
              <div style={{ marginTop: 26 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    position: 'relative', width: '100%',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: 52, padding: '0 28px', border: 0, borderRadius: 16,
                    color: '#ffffff', fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    overflow: 'hidden', isolation: 'isolate',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    boxShadow: '0 14px 40px -12px rgba(124,92,255,0.55), 0 4px 14px -4px rgba(34,211,238,0.30), 0 0 0 1px rgba(255,255,255,0.10) inset',
                    opacity: loading ? 0.85 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  {/* Animated gradient bg */}
                  <span
                    className="cta-bg-anim"
                    style={{
                      position: 'absolute', inset: 0, zIndex: 0,
                      background: 'linear-gradient(120deg, #6e4cff 0%, #b164ff 40%, #ff5dc8 70%, #22d3ee 110%)',
                      backgroundSize: '220% 220%',
                    }}
                  />
                  {/* Shine sweep */}
                  <span
                    className="cta-shine-anim"
                    style={{
                      position: 'absolute', top: 0, bottom: 0, left: '-50%', width: '30%',
                      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.45), transparent)',
                      zIndex: 1, transform: 'skewX(-20deg)',
                    }}
                  />
                  {/* Content */}
                  <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {loading ? (
                      <>
                        <span className="spinner" style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff',
                        }} />
                        Posting…
                      </>
                    ) : (
                      <><Sparkles size={16} /> Post job &amp; start screening</>
                    )}
                  </span>
                </button>
              </div>
              <p style={{ margin: '12px 2px 0', fontSize: 12.5, color: 'rgba(230,226,255,0.45)', textAlign: 'center' }}>
                We&apos;ll start building a hiring blueprint the moment you publish.
              </p>
            </form>
          )}
        </main>
      </div>
    </>
  )
}

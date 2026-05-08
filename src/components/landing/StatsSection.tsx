'use client';

import { motion } from 'framer-motion';
import { Section, CountUp, EASE } from './shared';

const stats = [
  { v: 10,  suf: '',    label: 'AI Agents',               color: '#7C3AED' },
  { v: 5,   suf: ' min', label: 'per evaluation',          color: '#F59E0B', prefix: '< ' },
  { v: 80,  suf: '%',   label: 'reduction in screening',   color: '#10B981' },
  { v: 100, suf: '%',   label: 'auditable decisions',      color: '#FB7185' },
];

const quotes = [
  { name: 'Maya Chen',    role: 'Head of Talent',      co: 'Northwind Labs',   initial: 'M', color: '#7C3AED', color2: '#A855F7', quote: "We replaced three days of resume triage with a 20-minute review. The explainability is what won leadership over." },
  { name: 'Rohan Verma',  role: 'Engineering Manager', co: 'Forge & Foundry',  initial: 'R', color: '#F59E0B', color2: '#FBBF24', quote: "I finally trust the shortlist. The GitHub analyzer caught two strong candidates we'd have missed." },
  { name: 'Priya Saxena', role: 'Recruiting Lead',     co: 'Hinterland',       initial: 'P', color: '#10B981', color2: '#34D399', quote: "Our time-to-shortlist dropped from 12 days to 36 hours. And every reject has a paper trail." },
];

export default function StatsSection({ active }: { active: boolean }) {
  return (
    <Section bg="linear-gradient(135deg,#F5F4FF 0%,#F0EEFF 50%,#FCE7F3 100%)" tone="lavender">
      {/* Sparkles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="absolute twinkle"
            style={{
              left: `${(i * 47) % 100}%`,
              top: `${(i * 29) % 100}%`,
              animationDelay: `${(i % 6) * 0.4}s`,
              color: i % 3 === 0 ? '#A855F7' : i % 3 === 1 ? '#F59E0B' : '#10B981',
              fontSize: `${10 + (i % 3) * 4}px`,
            }}
          >✦</span>
        ))}
      </div>

      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="font-display font-extrabold text-[48px] tracking-tight"
              style={{ color: '#1F1035' }}
            >
              Built for Teams That <span className="text-gradient">Move Fast.</span>
            </motion.h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: active ? 0 : 24, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.07 }}
                className="glass rounded-2xl p-6 text-center"
                style={{ boxShadow: `0 18px 40px -18px ${s.color}55` }}
              >
                <div className="font-display font-extrabold text-5xl tracking-tight" style={{ color: s.color }}>
                  <CountUp to={s.v} prefix={s.prefix ?? ''} suffix={s.suf} trigger={active} />
                </div>
                <div className="text-[13px] mt-2 leading-snug" style={{ color: '#6B7280' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-3 gap-5">
            {quotes.map((q, i) => (
              <motion.div
                key={i}
                initial={{ y: 28, opacity: 0 }}
                animate={{
                  y: active ? [0, -6, 0] : 28,
                  opacity: active ? 1 : 0,
                }}
                transition={{
                  duration: active ? 5 + i : 0.45,
                  delay: active ? i * 0.4 : 0.4 + i * 0.08,
                  repeat: active ? Infinity : 0,
                  ease: 'easeInOut',
                }}
                className="glass rounded-3xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-bold text-lg"
                    style={{ background: `linear-gradient(135deg, ${q.color}, ${q.color2})` }}
                  >
                    {q.initial}
                  </div>
                  <div>
                    <div className="font-display font-bold text-[14px]" style={{ color: '#1F1035' }}>{q.name}</div>
                    <div className="text-[12px]" style={{ color: '#6B7280' }}>{q.role} · {q.co}</div>
                  </div>
                </div>
                <div className="text-[14px] leading-relaxed italic" style={{ color: '#1F1035' }}>"{q.quote}"</div>
                <div className="mt-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <span key={k} style={{ color: '#F59E0B' }}>★</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Section, Icons, EASE } from './shared';

const tiers = [
  {
    name: 'Gemini Pro', tag: 'Deep Reasoning',
    tone: '#7C3AED', tone2: '#A855F7', shadow: 'rgba(124,58,237,0.35)',
    agents: ['JD Parser', 'Fraud Detector', 'GitHub Analyzer', 'Explainer'],
    blurb: 'Heavy lifting. Multi-step reasoning. Highest accuracy.',
  },
  {
    name: 'Gemini Flash', tag: 'Fast Inference',
    tone: '#F59E0B', tone2: '#FBBF24', shadow: 'rgba(245,158,11,0.35)',
    agents: ['Resume Reader', 'Skill Matcher', 'Bias Auditor'],
    blurb: 'Balanced speed and quality for parallel agents.',
  },
  {
    name: 'Gemini Flash-Lite', tag: 'High Volume',
    tone: '#10B981', tone2: '#34D399', shadow: 'rgba(16,185,129,0.35)',
    agents: ['Culture Scorer', 'Ranker', 'Reporter'],
    blurb: 'Lightweight, cost-efficient routing for simple tasks.',
  },
];

export default function ModelsSection({ active }: { active: boolean }) {
  return (
    <Section bg="linear-gradient(135deg,#FAFAFA 0%,#F0EEFF 50%,#ECFDF5 100%)" tone="lavender">
      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="text-center mb-10">
            <motion.span
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: active ? 0 : 14, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}
            >
              Mixed-Model Strategy
            </motion.span>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
              className="font-display font-extrabold text-[48px] tracking-tight mt-3"
            >
              <span style={{ color: 'rgb(194, 177, 219)' }}>Built for Teams That </span>
              <span className="text-gradient">Right AI</span>
              <span style={{ color: 'rgb(177, 166, 193)' }}> for Every Task</span>
            </motion.h2>
          </div>

          {/* Floating cards */}
          <div className="relative grid grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
            {tiers.map((t, i) => (
              <motion.div
                key={i}
                initial={{ y: 40, opacity: 0, rotateY: 20 }}
                animate={{
                  y: active ? (i === 0 ? -10 : i === 1 ? 0 : 10) : 40,
                  opacity: active ? 1 : 0,
                  rotateY: active ? 0 : 20,
                  scale: active ? (i === 0 ? 1.04 : i === 1 ? 1 : 0.95) : 0.9,
                }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 + i * 0.12 }}
                className="relative"
                style={{ zIndex: 30 - i * 10 }}
              >
                {/* Connecting beam */}
                <motion.div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6"
                  style={{ background: `linear-gradient(to bottom, transparent, ${t.tone})` }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                  className="glass rounded-3xl p-6 relative overflow-hidden"
                  style={{
                    boxShadow: `0 22px 50px -18px ${t.shadow}, inset 0 0 0 1px ${t.shadow.replace('0.35', '0.22')}`,
                    background: `linear-gradient(180deg, rgba(255,255,255,0.85), ${t.shadow.replace('0.35', '0.05')})`,
                  }}
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl"
                       style={{ background: t.tone }} />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-full"
                           style={{ background: `${t.tone}18`, color: t.tone }}>
                        Tier {i + 1}
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `conic-gradient(from 0deg, ${t.tone}, ${t.tone2}, ${t.tone})` }}
                      >
                        <div className="w-full h-full rounded-full bg-white/80 scale-[0.6]" />
                      </motion.div>
                    </div>
                    <div className="font-display font-extrabold text-2xl" style={{ color: '#1F1035' }}>{t.name}</div>
                    <div className="text-sm font-medium mt-0.5" style={{ color: t.tone }}>{t.tag}</div>
                    <p className="text-[13px] mt-3 leading-relaxed" style={{ color: '#6B7280' }}>{t.blurb}</p>

                    <div className="mt-5 pt-4 border-t border-purple-100/60 space-y-2">
                      {t.agents.map((ag, j) => (
                        <motion.div
                          key={j}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: active ? 0 : -10, opacity: active ? 1 : 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + i * 0.12 + j * 0.06, ease: EASE }}
                          className="flex items-center gap-2 text-[13px]"
                          style={{ color: '#1F1035' }}
                        >
                          <span className="inline-flex w-4 h-4 rounded-full items-center justify-center"
                                style={{ background: `${t.tone}20`, color: t.tone }}>
                            <Icons.Check width={10} height={10} />
                          </span>
                          {ag}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Callout banner */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.9 }}
            className="mt-10 mx-auto max-w-[680px]"
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0.0)', '0 0 28px rgba(124,58,237,0.35)', '0 0 0px rgba(124,58,237,0.0)'] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="rounded-2xl px-6 py-4 text-center font-display font-semibold text-[15px]"
              style={{
                background: 'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(245,158,11,0.08), rgba(16,185,129,0.08))',
                border: '1px solid rgba(124,58,237,0.18)',
                color: '#1F1035',
              }}
            >
              <span className="text-gradient font-extrabold">Mixed-model strategy</span> keeps costs low and quality high.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

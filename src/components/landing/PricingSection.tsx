'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section, Icons, PrimaryBtn, GhostBtn, EASE } from './shared';

const plans = [
  {
    name: 'free', label: 'free', m: 0, y: 0, popular: false, hasToggle: false,
    tone: '#7C3AED',
    desc: 'For individuals getting started.',
    features: ['1 job per month', '3 resumes per job', '6 core agents', 'Email reports', 'Standard support'],
  },
  {
    name: 'plus', label: 'plus', m: 10, y: 8, popular: true, hasToggle: true,
    tone: '#A855F7',
    desc: 'For growing teams hiring regularly.',
    features: ['5 jobs per month', '10 resumes per job', 'All 9 agents', 'Custom rubrics', 'Priority support'],
  },
  {
    name: 'pro', label: 'pro', m: 22, y: 18, popular: false, hasToggle: true,
    tone: '#F59E0B',
    desc: 'For high-volume hiring teams.',
    features: ['15 jobs per month', '25 resumes per job', 'All agents + custom', 'Advanced analytics', 'Dedicated support'],
  },
];

export default function PricingSection({ active }: { active: boolean }) {
  // Global toggle — per-card UI but shared state
  const [yearly, setYearly] = useState(true);

  return (
    <Section bg="linear-gradient(135deg,#FAFAFA 0%,#F5F4FF 50%,#FFF7ED 100%)" tone="lavender">
      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="font-display font-extrabold text-[48px] tracking-tight"
              style={{ color: '#1F1035' }}
            >
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </motion.h2>
            <motion.p
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: active ? 0 : 14, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.06 }}
              className="mt-3"
              style={{ color: '#6B7280' }}
            >
              Start free, upgrade when you need more. No setup fees.
            </motion.p>
          </div>

          <div className="grid grid-cols-3 gap-5 items-stretch">
            {plans.map((p, i) => {
              const price = yearly ? p.y : p.m;
              return (
                <motion.div
                  key={i}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{
                    y: active ? (p.popular ? -14 : 0) : 30,
                    opacity: active ? 1 : 0,
                    scale: active ? (p.popular ? 1.04 : 1) : 0.95,
                  }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}
                  whileHover={{ y: p.popular ? -18 : -6 }}
                  className="relative rounded-3xl p-7 shimmer-on-hover overflow-hidden"
                  style={{
                    background: p.popular
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,243,255,0.7))'
                      : 'rgba(255,255,255,0.78)',
                    border: p.popular ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(124,58,237,0.12)',
                    boxShadow: p.popular
                      ? '0 30px 70px -20px rgba(124,58,237,0.45), inset 0 0 0 1px rgba(124,58,237,0.1)'
                      : '0 14px 40px -22px rgba(124,58,237,0.25)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    <div
                      className="shimmer-bar absolute -inset-y-4 -left-1/2 w-1/2"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                        transform: 'skewX(-20deg) translateX(-100%)',
                      }}
                    />
                  </div>

                  <div className="relative">
                    {/* Plan name + status badge */}
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className="font-display font-bold text-xl"
                        style={{ color: '#1F1035' }}
                      >
                        {p.label}
                      </div>
                      {p.name === 'free' && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                          style={{ background: '#1F1035' }}
                        >
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-[13px] mb-4" style={{ color: '#6B7280' }}>{p.desc}</div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="font-display font-extrabold text-5xl tracking-tight"
                        style={{ color: p.popular ? '#7C3AED' : '#1F1035' }}
                      >
                        ${price}
                      </span>
                      <span className="text-sm" style={{ color: '#6B7280' }}>/month</span>
                      {p.hasToggle && yearly && (
                        <motion.span
                          key="badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}
                        >
                          −20%
                        </motion.span>
                      )}
                    </div>

                    {/* Per-card billing toggle (linked to global state) */}
                    {p.hasToggle ? (
                      <button
                        onClick={() => setYearly(v => !v)}
                        className="flex items-center gap-2 mb-5 group"
                        type="button"
                      >
                        <div
                          style={{
                            width: 36, height: 20, borderRadius: 99,
                            background: yearly ? '#1F1035' : 'rgba(0,0,0,0.18)',
                            position: 'relative',
                            transition: 'background 0.2s',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute', top: 3,
                              left: yearly ? 19 : 3,
                              width: 14, height: 14, borderRadius: '50%',
                              background: 'white',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                            }}
                          />
                        </div>
                        <span className="text-[12px] font-medium" style={{ color: '#6B7280' }}>
                          Billed annually
                        </span>
                      </button>
                    ) : (
                      <div className="mb-5">
                        <span className="text-[12px]" style={{ color: '#6B7280' }}>Always free</span>
                      </div>
                    )}

                    {/* Features */}
                    <ul className="space-y-2.5">
                      {p.features.map((f, j) => (
                        <motion.li
                          key={j}
                          initial={{ x: -8, opacity: 0 }}
                          animate={{ x: active ? 0 : -8, opacity: active ? 1 : 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + i * 0.08 + j * 0.05, ease: EASE }}
                          className="flex items-start gap-2.5 text-[14px]"
                          style={{ color: '#1F1035' }}
                        >
                          <span
                            className="mt-0.5 inline-flex w-5 h-5 rounded-full items-center justify-center flex-shrink-0"
                            style={{ background: `${p.tone}18`, color: p.tone }}
                          >
                            <Icons.Check width={11} height={11} />
                          </span>
                          {f}
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-6">
                      {p.name === 'free' ? (
                        <GhostBtn className="w-full justify-center">Get Started Free</GhostBtn>
                      ) : p.popular ? (
                        <PrimaryBtn className="w-full justify-center">
                          Subscribe <Icons.Arrow width={16} height={16} />
                        </PrimaryBtn>
                      ) : (
                        <GhostBtn className="w-full justify-center">Subscribe</GhostBtn>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

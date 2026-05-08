'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, UserButton } from '@clerk/nextjs';
import { EASE } from './shared';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import PipelineSection from './PipelineSection';
import FeaturesSection from './FeaturesSection';
import ModelsSection from './ModelsSection';
import StatsSection from './StatsSection';
import PricingSection from './PricingSection';
import CTASection from './CTASection';

const SECTIONS = [
  { id: 'hero',     name: 'Home',         Component: HeroSection },
  { id: 'problem',  name: 'Problem',      Component: ProblemSection },
  { id: 'pipeline', name: 'How It Works', Component: PipelineSection },
  { id: 'features', name: 'Features',     Component: FeaturesSection },
  { id: 'models',   name: 'AI Models',    Component: ModelsSection },
  { id: 'social',   name: 'Customers',    Component: StatsSection },
  { id: 'pricing',  name: 'Pricing',      Component: PricingSection },
  { id: 'cta',      name: 'Get Started',  Component: CTASection },
];

export default function LandingPage() {
  const { isSignedIn, user } = useUser();
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const lockRef = useRef(false);

  const go = useCallback((next: number) => {
    if (lockRef.current) return;
    if (next < 0 || next >= SECTIONS.length || next === idx) return;
    setDir(next > idx ? 1 : -1);
    setIdx(next);
    lockRef.current = true;
    setTimeout(() => { lockRef.current = false; }, 480);
  }, [idx]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); go(idx + 1); }
      else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(idx - 1); }
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End')  go(SECTIONS.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, go]);

  // Wheel navigation (debounced)
  useEffect(() => {
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - last < 700) return;
      if (Math.abs(e.deltaY) < 30) return;
      last = now;
      if (e.deltaY > 0) go(idx + 1); else go(idx - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [idx, go]);

  // Touch swipe
  const touch = useRef({ x: 0, y: 0, t: 0 });
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touch.current.x;
      const dy = t.clientY - touch.current.y;
      const dt = Date.now() - touch.current.t;
      if (dt > 800) return;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) go(idx + 1); else go(idx - 1);
      } else if (Math.abs(dy) > 80) {
        if (dy < 0) go(idx + 1); else go(idx - 1);
      }
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [idx, go]);

  // Sync Clerk user to Neon on login
  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/sync-user', { method: 'POST' }).catch(() => {});
  }, [isSignedIn]);

  const { Component: Current } = SECTIONS[idx];

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)', color: '#1F1035', background: '#FAFAFA' }}
    >
      {/* Top navigation */}
      <div className="absolute top-0 inset-x-0 z-50 px-8 lg:px-12 py-5 flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <motion.div
            animate={{ rotate: [0, 8, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center"
          >
            <img
              src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1778217940/logo_x82dia.png"
              alt="Pratibha AI"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="font-display font-extrabold text-[17px] tracking-tight">
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED, #A855F7, #FB7185)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Pratibha</span><span style={{ color: '#7C3AED' }}> AI</span>
          </div>
        </div>

        {/* Section indicator pill */}
        <div className="hidden md:flex items-center gap-2 glass rounded-full px-4 py-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7C3AED' }} />
          <AnimatePresence mode="wait">
            <motion.span
              key={SECTIONS[idx].name}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[13px] font-semibold"
              style={{ color: '#1F1035' }}
            >
              {SECTIONS[idx].name}
            </motion.span>
          </AnimatePresence>
          <span className="text-[11px] tabular-nums" style={{ color: '#6B7280' }}>
            · {String(idx + 1).padStart(2, '0')}/{String(SECTIONS.length).padStart(2, '0')}
          </span>
        </div>

        {/* Welcome greeting + avatar — shown only when signed in */}
        {isSignedIn && (
          <div className="flex items-center gap-3 pointer-events-auto">
            <a
              href="/dashboard"
              className="hidden md:inline-flex items-center text-[13px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors hover:bg-violet-50"
              style={{ color: '#7C3AED', border: '1px solid rgba(124,58,237,0.18)' }}
            >
              Dashboard
            </a>
            <span className="text-[13px] font-semibold hidden md:block" style={{ color: '#1F1035' }}>
              Hi, {user?.username ?? user?.firstName ?? 'there'}!
            </span>
            <UserButton />
          </div>
        )}

      </div>

      {/* Section viewport with transitions */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={SECTIONS[idx].id}
            initial={{ x: dir > 0 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir > 0 ? -80 : 80, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0"
          >
            <Current active={true} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right vertical nav dots */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
        {SECTIONS.map((s, i) => {
          const isActive = i === idx;
          return (
            <button key={s.id} onClick={() => go(i)} className="group relative flex items-center" aria-label={s.name}>
              <span
                className="absolute right-full mr-3 px-2.5 py-1 rounded-md text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap"
                style={{ background: 'rgba(31,16,53,0.85)' }}
              >
                {s.name}
              </span>
              <motion.span
                animate={{
                  width: isActive ? 22 : 8,
                  height: 8,
                  backgroundColor: isActive ? '#7C3AED' : 'rgba(124,58,237,0.28)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`block ${isActive ? 'ring-pulse' : ''}`}
                style={{ borderRadius: 999, display: 'block' }}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom keyboard hint */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 text-[11px] pointer-events-none"
        style={{ color: '#6B7280' }}
      >
        <span className="hidden md:inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-white/70 border border-purple-100 font-mono text-[10px]">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/70 border border-purple-100 font-mono text-[10px]">→</kbd>
          to navigate
        </span>
        <span className="md:hidden">swipe to navigate</span>
      </div>

      {/* Prev button */}
      <button
        onClick={() => go(idx - 1)}
        disabled={idx === 0}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full glass flex items-center justify-center transition hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
        aria-label="Previous"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={() => go(idx + 1)}
        disabled={idx === SECTIONS.length - 1}
        className="absolute right-20 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full glass flex items-center justify-center transition hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
        aria-label="Next"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

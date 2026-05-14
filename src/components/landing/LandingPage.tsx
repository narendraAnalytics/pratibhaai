'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, UserButton } from '@clerk/nextjs';
import { EASE } from './shared';
import { PLAN_BADGE } from '@/lib/plans';
import type { PlanKey } from '@/lib/plans';
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
  const [serverPlan, setServerPlan] = useState<PlanKey>('free');
  const badge = PLAN_BADGE[serverPlan] ?? PLAN_BADGE.free;

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => { if (d?.plan) setServerPlan(d.plan as PlanKey); })
      .catch(() => {});
  }, [isSignedIn]);
  const [showIntro, setShowIntro] = useState(true);
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const closeIntro = () => { setShowIntro(false); setZoom({ s: 1, x: 0, y: 0 }); setDragging(false); };
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

  // Non-passive wheel listener for image zoom (prevents section-switch interference)
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el || !showIntro) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setZoom(z => {
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const newS = Math.min(4, Math.max(1, z.s * factor));
        const newX = cx - (cx - z.x) * newS / z.s;
        const newY = cy - (cy - z.y) * newS / z.s;
        const W = rect.width, H = rect.height;
        return { s: newS, x: Math.min(0, Math.max(-W * (newS - 1), newX)), y: Math.min(0, Math.max(-H * (newS - 1), newY)) };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [showIntro]);

  const onImgMouseDown = (e: React.MouseEvent) => {
    if (zoom.s <= 1) return;
    setDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: zoom.x, oy: zoom.y };
  };
  const onImgMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = imgContainerRef.current!.getBoundingClientRect();
    const newX = dragRef.current.ox + (e.clientX - dragRef.current.x);
    const newY = dragRef.current.oy + (e.clientY - dragRef.current.y);
    setZoom(z => ({ ...z, x: Math.min(0, Math.max(-rect.width * (z.s - 1), newX)), y: Math.min(0, Math.max(-rect.height * (z.s - 1), newY)) }));
  };
  const onImgMouseUp = () => setDragging(false);

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
            {/* Dynamic plan badge — reads from Clerk publicMetadata.plan */}
            <motion.span
              key={serverPlan}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
              style={{
                background: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </motion.span>
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

      {/* Welcome intro modal */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(15,5,40,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={closeIntro}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative"
              onClick={e => e.stopPropagation()}
            >
              <div
                ref={imgContainerRef}
                onMouseDown={onImgMouseDown}
                onMouseMove={onImgMouseMove}
                onMouseUp={onImgMouseUp}
                onMouseLeave={onImgMouseUp}
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  maxHeight: '82vh',
                  maxWidth: '90vw',
                  cursor: zoom.s > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                  userSelect: 'none',
                }}
              >
                <img
                  src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1778775881/openimage_ezbi0q.png"
                  alt="Pratibha AI Agents"
                  draggable={false}
                  style={{
                    display: 'block',
                    maxHeight: '82vh',
                    maxWidth: '90vw',
                    transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})`,
                    transformOrigin: '0 0',
                    transition: dragging ? 'none' : 'transform 0.12s ease',
                  }}
                />
              </div>
              <button
                onClick={closeIntro}
                className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)', color: 'white', fontSize: '14px' }}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

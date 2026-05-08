'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const M = motion;
export const AP = AnimatePresence;
export const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

interface CountUpProps {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  trigger: boolean;
}

export function CountUp({ to, suffix = '', prefix = '', duration = 1.4, decimals = 0, trigger }: CountUpProps) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) { setVal(0); return; }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(eased * to);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, to, duration]);
  const formatted = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

interface MeshBgProps { tone?: 'violet' | 'cream' | 'lavender'; }

export function MeshBg({ tone = 'violet' }: MeshBgProps) {
  const tones: Record<string, [string, string, string]> = {
    violet: ['#C4B5FD', '#FBCFE8', '#A7F3D0'],
    cream: ['#FDE68A', '#FCA5A5', '#C4B5FD'],
    lavender: ['#DDD6FE', '#FBCFE8', '#BAE6FD'],
  };
  const [a, b, c] = tones[tone] ?? tones.violet;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="blob1 absolute -top-20 -left-20 w-[42rem] h-[42rem] rounded-full opacity-50"
           style={{ background: `radial-gradient(closest-side, ${a}, transparent 70%)` }} />
      <div className="blob2 absolute top-1/3 -right-32 w-[40rem] h-[40rem] rounded-full opacity-50"
           style={{ background: `radial-gradient(closest-side, ${b}, transparent 70%)` }} />
      <div className="blob3 absolute -bottom-32 left-1/4 w-[36rem] h-[36rem] rounded-full opacity-40"
           style={{ background: `radial-gradient(closest-side, ${c}, transparent 70%)` }} />
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  bg?: string;
  tone?: 'violet' | 'cream' | 'lavender';
}

export function Section({
  children,
  bg = 'linear-gradient(135deg,#FAFAFA 0%,#F0EEFF 50%,#E8F5FF 100%)',
  tone = 'violet',
}: SectionProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ background: bg }}>
      <MeshBg tone={tone} />
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
}

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  large?: boolean;
}

export function PrimaryBtn({ children, onClick, className = '', large = false }: BtnProps) {
  return (
    <M.button
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: '0 14px 36px -8px rgba(124,58,237,0.45)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`relative inline-flex items-center gap-2 rounded-full text-white font-semibold shadow-glow-violet
        ${large ? 'px-7 py-4 text-base' : 'px-5 py-2.5 text-sm'} ${className}`}
      style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#A855F7 60%,#C084FC 100%)' }}
    >
      {children}
    </M.button>
  );
}

export function GhostBtn({ children, onClick, className = '', large = false }: BtnProps) {
  return (
    <M.button
      onClick={onClick}
      whileHover={{ y: -2, backgroundColor: 'rgba(124,58,237,0.06)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-2 rounded-full font-semibold border border-purple-200 bg-white/60
        ${large ? 'px-7 py-4 text-base' : 'px-5 py-2.5 text-sm'} ${className}`}
      style={{ color: '#1F1035' }}
    >
      {children}
    </M.button>
  );
}

export const Icons = {
  Arrow: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Play: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Sparkle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" fill="currentColor" />
    </svg>
  ),
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  X: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
};

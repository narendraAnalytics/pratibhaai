// Shared primitives, hooks, icons
const { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } = window.Motion || window.framerMotion || window["framer-motion"] || {};

// fallback: framer-motion UMD exposes as `Motion`
const FM = window.Motion || window.framerMotion || window["framer-motion"];
const M = FM.motion;
const AP = FM.AnimatePresence;

const EASE = [0.25, 0.46, 0.45, 0.94];

// Reduced motion check
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = e => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

// Count-up
function CountUp({ to, suffix = '', prefix = '', duration = 1.4, decimals = 0, trigger }) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!trigger) { setVal(0); return; }
    let raf;
    const start = performance.now();
    const tick = (now) => {
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

// Mesh blob background
function MeshBg({ tone = 'violet' }) {
  const tones = {
    violet: ['#C4B5FD', '#FBCFE8', '#A7F3D0'],
    cream: ['#FDE68A', '#FCA5A5', '#C4B5FD'],
    lavender: ['#DDD6FE', '#FBCFE8', '#BAE6FD'],
  };
  const [a, b, c] = tones[tone] || tones.violet;
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

// Section shell — handles slide in/out
function Section({ children, bg = 'linear-gradient(135deg,#FAFAFA 0%,#F0EEFF 50%,#E8F5FF 100%)', tone = 'violet' }) {
  return (
    <M.div
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ background: bg }}
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <MeshBg tone={tone} />
      <div className="relative w-full h-full">
        {children}
      </div>
    </M.div>
  );
}

// Primary button
function PrimaryBtn({ children, onClick, className = '', large = false }) {
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
function GhostBtn({ children, onClick, className = '', large = false }) {
  return (
    <M.button
      onClick={onClick}
      whileHover={{ y: -2, backgroundColor: 'rgba(124,58,237,0.06)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-2 rounded-full font-semibold border border-purple-200 text-ink bg-white/60
        ${large ? 'px-7 py-4 text-base' : 'px-5 py-2.5 text-sm'} ${className}`}
    >
      {children}
    </M.button>
  );
}

// Inline icons
const Icons = {
  Arrow: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Play: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z"/></svg>,
  Sparkle: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" fill="currentColor"/></svg>,
  Brain: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 4a3 3 0 00-3 3v1a3 3 0 00-2 5 3 3 0 002 5v1a3 3 0 003 3M15 4a3 3 0 013 3v1a3 3 0 012 5 3 3 0 01-2 5v1a3 3 0 01-3 3M9 4v18M15 4v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  X: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>,
};

window.PA = { M, AP, EASE, usePrefersReducedMotion, CountUp, MeshBg, Section, PrimaryBtn, GhostBtn, Icons };

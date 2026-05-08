// Main App — orchestrates 8 sections, nav, keyboard, swipe
const { M, AP, EASE } = window.PA;

const SECTIONS = [
  { id: 'hero',     name: 'Home',       Comp: () => null },
  { id: 'problem',  name: 'Problem',    Comp: () => null },
  { id: 'pipeline', name: 'How It Works', Comp: () => null },
  { id: 'features', name: 'Features',   Comp: () => null },
  { id: 'models',   name: 'AI Models',  Comp: () => null },
  { id: 'social',   name: 'Customers',  Comp: () => null },
  { id: 'pricing',  name: 'Pricing',    Comp: () => null },
  { id: 'cta',      name: 'Get Started', Comp: () => null },
];
SECTIONS[0].Comp = window.HeroSection;
SECTIONS[1].Comp = window.ProblemSection;
SECTIONS[2].Comp = window.PipelineSection;
SECTIONS[3].Comp = window.FeaturesSection;
SECTIONS[4].Comp = window.ModelsSection;
SECTIONS[5].Comp = window.StatsSection;
SECTIONS[6].Comp = window.PricingSection;
SECTIONS[7].Comp = window.CTASection;

function App() {
  const [idx, setIdx] = React.useState(0);
  const [dir, setDir] = React.useState(1); // 1 = forward, -1 = back
  const lockRef = React.useRef(false);

  const go = React.useCallback((next) => {
    if (lockRef.current) return;
    if (next < 0 || next >= SECTIONS.length || next === idx) return;
    setDir(next > idx ? 1 : -1);
    setIdx(next);
    lockRef.current = true;
    setTimeout(() => { lockRef.current = false; }, 480);
  }, [idx]);

  // Keyboard
  React.useEffect(() => {
    const onKey = (e) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); go(idx + 1); }
      else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(idx - 1); }
      else if (e.key === 'Home') { go(0); }
      else if (e.key === 'End')  { go(SECTIONS.length - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, go]);

  // Wheel — debounced section change
  React.useEffect(() => {
    let last = 0;
    const onWheel = (e) => {
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
  const touch = React.useRef({ x: 0, y: 0, t: 0 });
  React.useEffect(() => {
    const onStart = (e) => {
      const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onEnd = (e) => {
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

  const Current = SECTIONS[idx].Comp;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Top nav */}
      <div className="absolute top-0 inset-x-0 z-50 px-8 lg:px-12 py-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <M.div
            animate={{ rotate: [0, 8, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-display font-extrabold"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7,#FB7185)' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M12 2l1.8 4.6 4.7 1.6-4 3 1 4.8L12 13.6 8.5 16l1-4.8-4-3 4.7-1.6L12 2z" fill="white"/>
            </svg>
          </M.div>
          <div className="font-display font-extrabold text-[17px] text-ink tracking-tight">Pratibha<span style={{color:'#7C3AED'}}> AI</span></div>
        </div>

        <div className="hidden md:flex items-center gap-2 glass rounded-full px-4 py-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7C3AED' }} />
          <AP mode="wait">
            <M.span
              key={SECTIONS[idx].name}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[13px] font-semibold text-ink"
            >
              {SECTIONS[idx].name}
            </M.span>
          </AP>
          <span className="text-[11px] text-mute tabular-nums">· {String(idx+1).padStart(2,'0')}/{String(SECTIONS.length).padStart(2,'0')}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button className="px-4 py-2 text-sm font-semibold text-ink rounded-full hover:bg-white/60 transition">Sign In</button>
          <window.PA.PrimaryBtn onClick={() => go(7)}>Get Started</window.PA.PrimaryBtn>
        </div>
      </div>

      {/* Section viewport */}
      <div className="absolute inset-0">
        <AP mode="wait" custom={dir}>
          <M.div
            key={SECTIONS[idx].id}
            custom={dir}
            initial={{ x: dir > 0 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir > 0 ? -80 : 80, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0"
          >
            <Current active={true} />
          </M.div>
        </AP>
      </div>

      {/* Right vertical nav dots */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
        {SECTIONS.map((s, i) => {
          const isActive = i === idx;
          return (
            <button key={s.id} onClick={() => go(i)} className="group relative flex items-center" aria-label={s.name}>
              <span className="absolute right-full mr-3 px-2.5 py-1 rounded-md text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap"
                    style={{ background: 'rgba(31,16,53,0.85)' }}>{s.name}</span>
              <M.span
                animate={{
                  width: isActive ? 22 : 8,
                  height: 8,
                  backgroundColor: isActive ? '#7C3AED' : 'rgba(124,58,237,0.28)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`block rounded-full ${isActive ? 'ring-pulse' : ''}`}
                style={{ borderRadius: 999 }}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 text-[11px] text-mute pointer-events-none">
        <span className="hidden md:inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-white/70 border border-purple-100 font-mono text-[10px]">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/70 border border-purple-100 font-mono text-[10px]">→</kbd>
          to navigate
        </span>
        <span className="md:hidden">swipe to navigate</span>
      </div>

      {/* Prev / next floating buttons */}
      <button
        onClick={() => go(idx - 1)}
        disabled={idx === 0}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full glass flex items-center justify-center text-ink transition hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
        aria-label="Previous"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button
        onClick={() => go(idx + 1)}
        disabled={idx === SECTIONS.length - 1}
        className="absolute right-20 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full glass flex items-center justify-center text-ink transition hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
        aria-label="Next"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

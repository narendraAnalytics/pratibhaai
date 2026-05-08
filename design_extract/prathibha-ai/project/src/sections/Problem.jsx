// SECTION 2 — Problem (Before / After)
function ProblemSection({ active }) {
  const { M, Section, Icons, EASE } = window.PA;

  const old = [
    '15-20 hours screening per hire',
    'Resume fraud goes undetected',
    'Vague JDs lead to bad matches',
    'No explanation for rejections',
    '$50,000 cost of a bad hire',
  ];
  const neu = [
    'Screened in minutes',
    'Fraud detection built-in',
    'AI structures your JD automatically',
    'Explainable AI decisions',
    'Reduce mismatch by 80%',
  ];

  const itemL = (i) => ({
    hidden: { x: -24, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { duration: 0.4, ease: EASE, delay: 0.15 + i * 0.08 } },
  });
  const itemR = (i) => ({
    hidden: { x: 24, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { duration: 0.4, ease: EASE, delay: 0.15 + i * 0.08 } },
  });

  return (
    <Section bg="linear-gradient(135deg,#FFFBF0 0%,#FFF6E8 50%,#F0EEFF 100%)" tone="cream">
      {/* floating amber dots */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 22 }).map((_, i) => (
          <span key={i} className="absolute rounded-full twinkle"
            style={{
              width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3,
              left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`,
              background: 'rgba(245,158,11,0.35)',
              animationDelay: `${i * 0.2}s`,
            }} />
        ))}
      </div>

      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-[1300px] mx-auto w-full">
          <M.h2
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: active ? 0 : 24, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-display font-extrabold text-[48px] tracking-tight text-center"
          >
            Recruitment is <span style={{ color: '#E11D48' }}>Broken.</span>
          </M.h2>
          <M.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: active ? 0 : 16, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="text-center text-mute text-[18px] mt-3"
          >
            See what changes when 10 AI agents work alongside your team.
          </M.p>

          <div className="mt-12 grid grid-cols-12 gap-6 items-stretch relative">
            {/* OLD */}
            <div className="col-span-12 lg:col-span-5">
              <div className="glass rounded-3xl p-7 h-full" style={{ borderColor: 'rgba(225,29,72,0.18)' }}>
                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#E11D48' }}>The Old Way</div>
                <div className="font-display font-bold text-2xl text-ink mb-5">Manual. Slow. Risky.</div>
                <ul className="space-y-3.5">
                  {old.map((t, i) => (
                    <M.li key={i} variants={itemL(i)} initial="hidden" animate={active ? 'show' : 'hidden'}
                          className="flex items-start gap-3 text-[15px] text-ink">
                      <span className="mt-0.5 inline-flex w-7 h-7 rounded-full items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(225,29,72,0.12)', color: '#E11D48' }}>
                        <Icons.X width="14" height="14" />
                      </span>
                      <span className="leading-snug">{t}</span>
                    </M.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* center pulsing divider */}
            <div className="col-span-12 lg:col-span-2 flex items-center justify-center">
              <div className="relative h-full w-px hidden lg:block">
                <M.div
                  className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px"
                  style={{ background: 'linear-gradient(to bottom, transparent, #A855F7, transparent)' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <M.div
                  className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                  style={{ top: '40%', background: '#A855F7' }}
                  animate={{ y: [0, 80, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
              </div>
              <M.div
                initial={{ scale: 0 }}
                animate={{ scale: active ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
              >
                ↓
              </M.div>
            </div>

            {/* NEW */}
            <div className="col-span-12 lg:col-span-5">
              <div className="glass rounded-3xl p-7 h-full" style={{ borderColor: 'rgba(16,185,129,0.22)' }}>
                <div className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#059669' }}>The Pratibha AI Way</div>
                <div className="font-display font-bold text-2xl text-ink mb-5">Autonomous. Fast. Explainable.</div>
                <ul className="space-y-3.5">
                  {neu.map((t, i) => (
                    <M.li key={i} variants={itemR(i)} initial="hidden" animate={active ? 'show' : 'hidden'}
                          className="flex items-start gap-3 text-[15px] text-ink">
                      <span className="mt-0.5 inline-flex w-7 h-7 rounded-full items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(16,185,129,0.14)', color: '#059669' }}>
                        <Icons.Check width="14" height="14" />
                      </span>
                      <span className="leading-snug">{t}</span>
                    </M.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
window.ProblemSection = ProblemSection;

// SECTION 3 — Pipeline (10 agents)
function PipelineSection({ active }) {
  const { M, Section, EASE } = window.PA;

  const agents = [
    { n: 'JD Parser',       role: 'Structures job descriptions',  tier: 'pro',   icon: '📋' },
    { n: 'Resume Reader',   role: 'Extracts skills & history',     tier: 'flash', icon: '📄' },
    { n: 'Fraud Detector',  role: 'Flags inconsistencies',         tier: 'pro',   icon: '🛡️' },
    { n: 'Skill Matcher',   role: 'Maps competencies',             tier: 'flash', icon: '🎯' },
    { n: 'GitHub Analyzer', role: 'Reviews real code',             tier: 'pro',   icon: '💻' },
    { n: 'Culture Scorer',  role: 'Values alignment',              tier: 'lite',  icon: '🤝' },
    { n: 'Bias Auditor',    role: 'Removes blind spots',           tier: 'flash', icon: '⚖️' },
    { n: 'Ranker',          role: 'Weighted scoring',              tier: 'lite',  icon: '🏆' },
    { n: 'Explainer',       role: 'Justifies decisions',           tier: 'pro',   icon: '💬' },
    { n: 'Reporter',        role: 'PDF + email delivery',          tier: 'lite',  icon: '📨' },
  ];

  const tierStyle = {
    pro:   { ring: 'rgba(124,58,237,0.45)',  bg: 'rgba(124,58,237,0.06)',  label: '#7C3AED' },
    flash: { ring: 'rgba(245,158,11,0.45)',  bg: 'rgba(245,158,11,0.07)',  label: '#D97706' },
    lite:  { ring: 'rgba(16,185,129,0.45)',  bg: 'rgba(16,185,129,0.07)',  label: '#059669' },
  };

  return (
    <Section bg="linear-gradient(135deg,#FAFAFA 0%,#F5F4FF 50%,#EDE9FE 100%)" tone="lavender">
      <div className="relative w-full h-full px-10 lg:px-16 flex flex-col justify-center">
        <div className="max-w-[1400px] mx-auto w-full">
          <M.div initial={{ y: 20, opacity: 0 }} animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
                 transition={{ duration: 0.5, ease: EASE }} className="text-center mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                  style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>How it works</span>
          </M.div>
          <M.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
                className="font-display font-extrabold text-[48px] text-center tracking-tight">
            <span style={{ color: 'rgb(58, 129, 109)' }}>The </span><span className="text-gradient">Your Perfect Hire.</span>
          </M.h2>

          {/* Pipeline grid: 5 cols x 2 rows */}
          <div className="mt-12 relative">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#FB7185" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid grid-cols-5 gap-x-4 gap-y-10 relative">
              {agents.map((a, i) => {
                const t = tierStyle[a.tier];
                const row = Math.floor(i / 5);
                return (
                  <M.div key={i}
                    initial={{ y: 24, opacity: 0, scale: 0.9 }}
                    animate={{
                      y: active ? 0 : 24,
                      opacity: active ? 1 : 0,
                      scale: active ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.06, type: 'spring', stiffness: 220, damping: 18 }}
                    className="relative"
                  >
                    {/* connector arrow to next */}
                    {i < 9 && (i + 1) % 5 !== 0 && (
                      <svg className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-3" viewBox="0 0 32 12" fill="none">
                        <line x1="0" y1="6" x2="28" y2="6" stroke="url(#flowG)" strokeWidth="1.6"
                              strokeDasharray="4 4" className="flow-dash" />
                        <path d="M24 2 L30 6 L24 10" stroke="#FB7185" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {/* row to row connector at end of row 1 */}
                    {i === 4 && (
                      <svg className="absolute top-full -right-2 w-12 h-16" viewBox="0 0 48 64" fill="none" style={{ marginTop: 4 }}>
                        <path d="M8 0 Q40 0 40 32 Q40 64 8 64" stroke="url(#flowG)" strokeWidth="1.6"
                              strokeDasharray="4 4" className="flow-dash" fill="none" />
                      </svg>
                    )}

                    <div className="glass rounded-2xl p-4 text-center h-full"
                         style={{
                           boxShadow: `0 8px 28px -12px ${t.ring}, inset 0 0 0 1px ${t.ring.replace('0.45','0.25')}`,
                           background: `linear-gradient(180deg, white, ${t.bg})`,
                         }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                             style={{ background: t.bg, color: t.label }}>
                          {a.tier === 'pro' ? 'Pro' : a.tier === 'flash' ? 'Flash' : 'Lite'}
                        </div>
                        <div className="text-[10px] font-mono text-mute">#{String(i+1).padStart(2,'0')}</div>
                      </div>
                      <div className="text-2xl mb-1.5">{a.icon}</div>
                      <div className="font-display font-bold text-[13px] text-ink leading-tight">{a.n}</div>
                      <div className="text-[11px] text-mute mt-1 leading-tight">{a.role}</div>
                    </div>
                  </M.div>
                );
              })}
            </div>
          </div>

          {/* Highlight cards */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-[900px] mx-auto">
            {[
              { icon: '⚡', title: 'Parallel Processing', sub: 'All 10 agents run concurrently', tone: '#7C3AED' },
              { icon: '🔍', title: 'Explainable AI', sub: 'Every score has a reason',          tone: '#F59E0B' },
              { icon: '👤', title: 'Human Override', sub: 'You stay in the driver seat',       tone: '#10B981' },
            ].map((h, i) => (
              <M.div key={i}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: active ? 0 : 16, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.4, delay: 0.85 + i * 0.08, ease: EASE }}
                className="glass rounded-2xl px-5 py-4 flex items-center gap-3"
              >
                <M.div
                  animate={{ rotate: [0, 8, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.4 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${h.tone}15` }}
                >
                  {h.icon}
                </M.div>
                <div>
                  <div className="font-display font-bold text-[15px] text-ink">{h.title}</div>
                  <div className="text-[12px] text-mute">{h.sub}</div>
                </div>
              </M.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
window.PipelineSection = PipelineSection;

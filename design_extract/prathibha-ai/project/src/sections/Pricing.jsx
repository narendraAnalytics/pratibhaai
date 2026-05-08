// SECTION 7 — Pricing
function PricingSection({ active }) {
  const { M, Section, EASE, Icons, PrimaryBtn, GhostBtn } = window.PA;
  const [yearly, setYearly] = React.useState(false);

  const plans = [
    {
      name: 'Starter', m: 99, y: 79, popular: false,
      tone: '#7C3AED',
      desc: 'For small teams piloting AI hiring.',
      features: ['Up to 50 candidates / mo', '5 active job pipelines', '6 core agents', 'Email reports', 'Standard support'],
    },
    {
      name: 'Growth', m: 199, y: 159, popular: true,
      tone: '#A855F7',
      desc: 'For scaling teams that hire weekly.',
      features: ['Up to 250 candidates / mo', '20 active pipelines', 'All 10 agents', 'Custom rubrics', 'Slack + email', 'Priority support'],
    },
    {
      name: 'Enterprise', m: 299, y: 239, popular: false,
      tone: '#F59E0B',
      desc: 'For high-volume hiring orgs.',
      features: ['Unlimited candidates', 'Unlimited pipelines', 'All agents + custom', 'SSO + audit logs', 'Dedicated success mgr', 'White-glove onboarding'],
    },
  ];

  return (
    <Section bg="linear-gradient(135deg,#FAFAFA 0%,#F5F4FF 50%,#FFF7ED 100%)" tone="lavender">
      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="text-center mb-8">
            <M.h2
              initial={{ y: 20, opacity: 0 }} animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="font-display font-extrabold text-[48px] tracking-tight"
            >
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </M.h2>
            <M.p
              initial={{ y: 14, opacity: 0 }} animate={{ y: active ? 0 : 14, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.06 }}
              className="text-mute mt-3"
            >
              Cancel any time. No setup fees. Free 14-day trial on every plan.
            </M.p>

            {/* Toggle */}
            <M.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: active ? 1 : 0.9, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
              className="mt-6 inline-flex items-center gap-1 p-1 rounded-full glass"
            >
              <button onClick={() => setYearly(false)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition ${!yearly ? 'text-white' : 'text-mute'}`}>
                {!yearly && (
                  <M.div layoutId="billPill" className="absolute inset-0 rounded-full"
                         style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
                         transition={{ duration: 0.35, ease: EASE }} />
                )}
                <span className="relative">Monthly</span>
              </button>
              <button onClick={() => setYearly(true)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition ${yearly ? 'text-white' : 'text-mute'}`}>
                {yearly && (
                  <M.div layoutId="billPill" className="absolute inset-0 rounded-full"
                         style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
                         transition={{ duration: 0.35, ease: EASE }} />
                )}
                <span className="relative">Yearly</span>
              </button>
            </M.div>
          </div>

          <div className="grid grid-cols-3 gap-5 items-stretch">
            {plans.map((p, i) => {
              const price = yearly ? p.y : p.m;
              const popular = p.popular;
              return (
                <M.div key={i}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{
                    y: active ? (popular ? -14 : 0) : 30,
                    opacity: active ? 1 : 0,
                    scale: active ? (popular ? 1.04 : 1) : 0.95,
                  }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.08 }}
                  whileHover={{ y: popular ? -18 : -6 }}
                  className={`relative rounded-3xl p-7 shimmer-on-hover overflow-hidden ${popular ? '' : ''}`}
                  style={{
                    background: popular
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,243,255,0.7))'
                      : 'rgba(255,255,255,0.78)',
                    border: popular ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(124,58,237,0.12)',
                    boxShadow: popular
                      ? '0 30px 70px -20px rgba(124,58,237,0.45), inset 0 0 0 1px rgba(124,58,237,0.1)'
                      : '0 14px 40px -22px rgba(124,58,237,0.25)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  {/* shimmer */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    <div className="shimmer-bar absolute -inset-y-4 -left-1/2 w-1/2"
                         style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-20deg) translateX(-100%)' }} />
                  </div>

                  {popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white ring-pulse"
                           style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}>
                        <span>★</span> Most Popular
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div className="font-display font-bold text-xl text-ink">{p.name}</div>
                    <div className="text-[13px] text-mute mt-1 mb-5">{p.desc}</div>

                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-extrabold text-5xl tracking-tight" style={{ color: popular ? '#7C3AED' : '#1F1035' }}>${price}</span>
                      <span className="text-mute text-sm">/mo</span>
                      {yearly && (
                        <M.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}>
                          −20%
                        </M.span>
                      )}
                    </div>
                    <div className="text-[11px] text-mute mt-1">{yearly ? 'billed yearly' : 'billed monthly'}</div>

                    <ul className="mt-6 space-y-2.5">
                      {p.features.map((f, j) => (
                        <M.li key={j}
                          initial={{ x: -8, opacity: 0 }}
                          animate={{ x: active ? 0 : -8, opacity: active ? 1 : 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + i * 0.08 + j * 0.05, ease: EASE }}
                          className="flex items-start gap-2.5 text-[14px] text-ink">
                          <span className="mt-0.5 inline-flex w-5 h-5 rounded-full items-center justify-center flex-shrink-0"
                                style={{ background: `${p.tone}18`, color: p.tone }}>
                            <Icons.Check width="11" height="11" />
                          </span>
                          {f}
                        </M.li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      {popular
                        ? <PrimaryBtn className="w-full justify-center">Start Free Trial <Icons.Arrow width="16" height="16" /></PrimaryBtn>
                        : <GhostBtn className="w-full justify-center">Choose {p.name}</GhostBtn>}
                    </div>
                  </div>
                </M.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
window.PricingSection = PricingSection;

// SECTION 8 — CTA / Footer
function CTASection({ active }) {
  const { M, Section, EASE, Icons, PrimaryBtn } = window.PA;
  const [email, setEmail] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <Section bg="linear-gradient(135deg,#FAFAFA 0%,#F0EEFF 40%,#FFF1F2 100%)" tone="violet">
      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-[900px] mx-auto w-full text-center">
          <M.h2
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: active ? 0 : 26, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-display font-extrabold text-[64px] leading-[1.05] tracking-tight"
          >
            Ready to <span className="text-gradient">Reinvent Hiring?</span>
          </M.h2>
          <M.p
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: active ? 0 : 18, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="text-mute text-[18px] mt-5 max-w-[640px] mx-auto leading-[1.7]"
          >
            Join recruiters saving 15+ hours per hire with Pratibha AI. Be first in line for early access.
          </M.p>

          <M.form
            onSubmit={submit}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: active ? 0 : 18, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-[560px] mx-auto"
          >
            <div className="relative flex-1">
              <M.input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@company.com"
                disabled={submitted}
                className="w-full h-14 px-5 rounded-full bg-white/80 border outline-none text-ink placeholder:text-mute/70"
                animate={{
                  borderColor: focused ? 'rgba(124,58,237,0.7)' : 'rgba(124,58,237,0.18)',
                  boxShadow: focused
                    ? '0 0 0 4px rgba(124,58,237,0.18), 0 14px 30px -16px rgba(124,58,237,0.4)'
                    : '0 6px 20px -12px rgba(124,58,237,0.2)',
                }}
                transition={{ duration: 0.25 }}
                style={{ borderWidth: 1.5 }}
              />
            </div>
            <PrimaryBtn large className="!h-14 justify-center">
              {submitted ? '✓ You\u2019re on the list' : 'Get Early Access'}
              {!submitted && <Icons.Arrow width="18" height="18" />}
            </PrimaryBtn>
          </M.form>

          <M.div
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="mt-4 text-xs text-mute"
          >
            No credit card required. Trusted by teams at Northwind Labs, Hinterland, and Forge & Foundry.
          </M.div>

          {/* Footer links */}
          <M.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: active ? 0 : 14, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.4 }}
            className="mt-16 flex items-center justify-center gap-7 text-[13px] text-mute"
          >
            {['Privacy', 'Terms', 'LinkedIn', 'GitHub'].map((l, i) => (
              <a key={i} href="#" className="hover:text-ink transition-colors">{l}</a>
            ))}
          </M.div>

          <div className="mt-4 text-xs text-mute/70">Pratibha AI © 2026</div>
        </div>

        {/* extra floating orbs */}
        <M.div
          className="pointer-events-none absolute w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #C4B5FD, transparent 70%)', top: '12%', left: '10%' }}
          animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <M.div
          className="pointer-events-none absolute w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #FECACA, transparent 70%)', bottom: '8%', right: '10%' }}
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
    </Section>
  );
}
window.CTASection = CTASection;

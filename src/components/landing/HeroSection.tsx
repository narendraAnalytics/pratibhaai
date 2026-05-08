'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Section, PrimaryBtn, GhostBtn, Icons, CountUp, EASE } from './shared';

const agents = Array.from({ length: 10 }).map((_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
  const r = 130;
  return { i: i + 1, x: 180 + Math.cos(a) * r, y: 180 + Math.sin(a) * r };
});

const links: [number, number][] = [];
for (let i = 0; i < 10; i++) links.push([i, (i + 1) % 10]);
links.push([0, 5], [2, 7], [4, 9]);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const item = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.45, ease: EASE } },
};

export default function HeroSection({ active }: { active: boolean }) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleStartTrial = () => {
    router.push(isSignedIn ? '/dashboard' : '/sign-up');
  };

  return (
    <Section>
      <div className="relative w-full h-full px-12 lg:px-20 flex items-center">
        <div className="grid grid-cols-12 gap-10 w-full max-w-[1400px] mx-auto">
          {/* Left content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={active ? 'show' : 'hidden'}
            className="col-span-12 lg:col-span-7 flex flex-col justify-center"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 self-start glass rounded-full px-4 py-2 text-sm font-medium mb-7"
              style={{ color: '#1F1035' }}
            >
              <span className="text-amber-500">
                <Icons.Sparkle width={16} height={16} className="twinkle inline-block" />
              </span>
              Powered by Google ADK + Gemini 3.1
            </motion.div>

            <motion.h1
              variants={item}
              className="font-display font-extrabold text-[64px] leading-[1.05] tracking-tight"
              style={{ color: '#1F1035' }}
            >
              <span style={{ color: 'rgb(211, 206, 90)' }}>Hire</span>{' '}
              <span className="text-gradient">Smarter.</span>
              <br />
              <span style={{ color: 'rgb(175, 83, 120)' }}>Not Harder.</span>
            </motion.h1>

            <motion.p variants={item} className="mt-6 text-[18px] leading-[1.7] max-w-[560px]" style={{ color: '#6B7280' }}>
              Pratibha AI deploys 10 specialized AI agents to screen, score, and shortlist your best candidates — autonomously.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
              <PrimaryBtn large onClick={handleStartTrial}>
                Start Free Trial
                <Icons.Arrow width={18} height={18} />
              </PrimaryBtn>
              <GhostBtn large>
                <Icons.Play width={14} height={14} />
                Watch Demo
              </GhostBtn>
            </motion.div>

            {/* Trust stats */}
            <motion.div variants={item} className="mt-14 grid grid-cols-3 gap-5 max-w-[560px]">
              {[
                { v: 15, suf: ' hrs', label: 'saved per hire' },
                { v: 10, suf: '', label: 'AI agents' },
                { v: 99, suf: '%', label: 'accuracy' },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl px-5 py-4">
                  <div className="font-display font-extrabold text-3xl" style={{ color: '#1F1035' }}>
                    <CountUp to={s.v} suffix={s.suf} trigger={active} />
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#6B7280' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — agent network */}
          <div className="col-span-12 lg:col-span-5 hidden lg:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.9 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative w-[420px] h-[420px]"
            >
              <div
                className="absolute inset-0 rounded-full opacity-60"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.18), transparent 65%)' }}
              />

              <svg viewBox="0 0 360 360" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#FB7185" stopOpacity="0.7" />
                  </linearGradient>
                  <radialGradient id="nodeG" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#EDE9FE" />
                  </radialGradient>
                </defs>

                {links.map(([a, b], li) => {
                  const pa = agents[a], pb = agents[b];
                  return (
                    <line
                      key={li}
                      x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                      stroke="url(#lineG)" strokeWidth="1.6"
                      strokeDasharray="6 6" className="flow-dash"
                      style={{ opacity: 0.55 }}
                    />
                  );
                })}

                {/* Center node */}
                <circle cx="180" cy="180" r="34" fill="url(#nodeG)" stroke="#A855F7" strokeWidth="1.5" />
                <text x="180" y="178" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="Plus Jakarta Sans" fontWeight="700" fontSize="11" fill="#1F1035">Pratibha</text>
                <text x="180" y="190" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="Plus Jakarta Sans" fontWeight="600" fontSize="9" fill="#7C3AED">CORE</text>

                {/* Agent nodes */}
                {agents.map((p, ni) => (
                  <motion.g
                    key={ni}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + ni * 0.05, ease: EASE }}
                  >
                    <motion.circle
                      cx={p.x} cy={p.y} r={20}
                      fill="white" stroke="#A855F7" strokeWidth="1.4"
                      animate={{ r: [20, 22, 20] } as never}
                      transition={{ duration: 2.2 + (ni % 3) * 0.4, repeat: Infinity, delay: ni * 0.15 }}
                    />
                    <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                          fontFamily="Plus Jakarta Sans" fontWeight="700" fontSize="11" fill="#7C3AED">
                      {p.i}
                    </text>
                  </motion.g>
                ))}

                {/* Pulse dot */}
                <motion.circle
                  r={3} fill="#FB7185"
                  animate={{
                    cx: [...agents.map(a => a.x), agents[0].x],
                    cy: [...agents.map(a => a.y), agents[0].y],
                  } as never}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

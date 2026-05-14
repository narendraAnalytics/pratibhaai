'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Section, PrimaryBtn, GhostBtn, Icons, CountUp, EASE } from './shared';

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

          {/* Right — agent network image */}
          <div className="col-span-12 lg:col-span-5 hidden lg:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.88 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="relative w-[680px] h-[680px]"
            >
              {/* Ambient glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.22), transparent 68%)' }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Floating image */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1778774634/bannerimage_yjw0to.png"
                  alt="Pratibha AI — 10 Agent Network"
                  width={680}
                  height={680}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

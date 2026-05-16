'use client';

import { motion } from 'framer-motion';
import { Section, EASE } from './shared';

const feats = [
  { icon: '🛡️', title: 'Resume Fraud Detection',     desc: 'Cross-checks dates, claims, and credentials against multiple sources.' },
  { icon: '💻', title: 'GitHub Portfolio Analysis',   desc: 'Reads real code commits, not just keywords from a resume.' },
  { icon: '🤝', title: 'Culture Fit Scoring',         desc: 'Quantifies values alignment with explainable rubrics.' },
  { icon: '🧭', title: 'AI Hiring Blueprint',         desc: 'Auto-generates structured JDs from a one-line role brief.' },
  { icon: '🏆', title: 'Weighted Score Ranking',      desc: 'You set the priorities; agents do the math.' },
  { icon: '📨', title: 'PDF Report + Email Delivery', desc: 'Decision-ready dossiers shipped to your inbox.' },
];

export default function FeaturesSection({ active }: { active: boolean }) {
  return (
    <Section bg="linear-gradient(135deg,#FAFAFA 0%,#F0EEFF 60%,#FFF1F2 100%)" tone="violet">
      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center py-6 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="text-center mb-8">
            <motion.span
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: active ? 0 : 14, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}
            >
              Features
            </motion.span>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: active ? 0 : 20, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
              className="font-display font-extrabold text-[40px] tracking-tight mt-3"
              style={{ color: '#1F1035' }}
            >
              Everything a Senior Recruiter Does.<br />
              <span className="text-gradient">In Minutes.</span>
            </motion.h2>
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: active ? 0 : 16, opacity: active ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="mt-4 text-[15px] leading-relaxed max-w-[540px] mx-auto"
              style={{ color: '#6B7280' }}
            >
              From fraud detection to culture fit — every step a senior recruiter takes, automated in one pipeline.
            </motion.p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {feats.map((f, i) => (
              <motion.div
                key={i}
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: active ? 0 : 28, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.15 + i * 0.07 }}
                whileHover={{ y: -6, boxShadow: '0 24px 60px -20px rgba(124,58,237,0.45)' }}
                className="group relative glass rounded-3xl p-5 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                     style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(168,85,247,0.12), transparent 60%)' }} />
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl mb-3"
                    style={{ background: 'linear-gradient(135deg,#F5F3FF,#FCE7F3)' }}
                  >
                    {f.icon}
                  </motion.div>
                  <div className="font-display font-bold text-[16px] leading-snug mb-2" style={{ color: '#7C3AED' }}>{f.title}</div>
                  <div className="text-[13px] leading-relaxed" style={{ color: '#6B7280' }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

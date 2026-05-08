'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Section, Icons, PrimaryBtn, EASE } from './shared';

export default function CTASection({ active }: { active: boolean }) {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <Section bg="linear-gradient(135deg,#FAFAFA 0%,#F0EEFF 40%,#FFF1F2 100%)" tone="violet">
      <div className="relative w-full h-full px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-[900px] mx-auto w-full text-center">
          <motion.h2
            initial={{ y: 26, opacity: 0 }}
            animate={{ y: active ? 0 : 26, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-display font-extrabold text-[64px] leading-[1.05] tracking-tight"
            style={{ color: '#1F1035' }}
          >
            Ready to <span className="text-gradient">Reinvent Hiring?</span>
          </motion.h2>

          <motion.p
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: active ? 0 : 18, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="text-[18px] mt-5 max-w-[640px] mx-auto leading-[1.7]"
            style={{ color: '#6B7280' }}
          >
            Join recruiters saving 15+ hours per hire with Pratibha AI. Be first in line for early access.
          </motion.p>

          <motion.form
            onSubmit={submit}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: active ? 0 : 18, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-[560px] mx-auto"
          >
            <div className="relative flex-1">
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@company.com"
                disabled={submitted}
                className="w-full h-14 px-5 rounded-full bg-white/80 outline-none"
                animate={{
                  borderColor: focused ? 'rgba(124,58,237,0.7)' : 'rgba(124,58,237,0.18)',
                  boxShadow: focused
                    ? '0 0 0 4px rgba(124,58,237,0.18), 0 14px 30px -16px rgba(124,58,237,0.4)'
                    : '0 6px 20px -12px rgba(124,58,237,0.2)',
                }}
                transition={{ duration: 0.25 }}
                style={{ borderWidth: 1.5, borderStyle: 'solid', color: '#1F1035' }}
              />
            </div>
            <PrimaryBtn large className="!h-14 justify-center">
              {submitted ? '✓ You’re on the list' : 'Get Early Access'}
              {!submitted && <Icons.Arrow width={18} height={18} />}
            </PrimaryBtn>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="mt-4 text-xs"
            style={{ color: '#6B7280' }}
          >
            No credit card required. Trusted by teams at Northwind Labs, Hinterland, and Forge & Foundry.
          </motion.div>

          {/* Footer links */}
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: active ? 0 : 14, opacity: active ? 1 : 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.4 }}
            className="mt-16 flex items-center justify-center gap-7 text-[13px]"
            style={{ color: '#6B7280' }}
          >
            {['Privacy', 'Terms', 'LinkedIn', 'GitHub'].map((l, i) => (
              <a key={i} href="#" className="hover:text-ink transition-colors">{l}</a>
            ))}
          </motion.div>

          <div className="mt-4 text-xs" style={{ color: 'rgba(107,114,128,0.7)' }}>Pratibha AI © 2026</div>
        </div>

        {/* Floating orbs */}
        <motion.div
          className="pointer-events-none absolute w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #C4B5FD, transparent 70%)', top: '12%', left: '10%' }}
          animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="pointer-events-none absolute w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #FECACA, transparent 70%)', bottom: '8%', right: '10%' }}
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
    </Section>
  );
}

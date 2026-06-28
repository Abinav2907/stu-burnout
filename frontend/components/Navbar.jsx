'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'AI Chatbot', href: '/chatbot' },
  { name: 'Burnout Predictor', href: '/burnout' },
  { name: 'Study Notes', href: '/notes' },
  { name: 'Pomodoro', href: '/pomodoro' },
];

export default function Navbar({ onMenuClick }) {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-white/5 bg-[#0A0A0F]/70 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3 md:gap-8">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="5" x2="16" y2="5" />
            <line x1="2" y1="9" x2="16" y2="9" />
            <line x1="2" y1="13" x2="16" y2="13" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-violet-500/30"
          >
            <span className="text-base">🚀</span>
          </motion.div>
          <span className="font-black text-xl md:text-2xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            PrepPilot
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-2 text-base font-medium transition-colors duration-200 text-slate-300 hover:text-white"
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: Avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-bold text-white">Student</span>
          <span className="text-xs text-slate-400">PrepPilot Pro</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] p-[1.5px] cursor-pointer shadow-lg"
        >
          <div className="w-full h-full bg-[#0A0A0F] rounded-[10px] flex items-center justify-center text-xs font-bold text-white">
            S
          </div>
        </motion.div>
      </div>
    </nav>
  );
}

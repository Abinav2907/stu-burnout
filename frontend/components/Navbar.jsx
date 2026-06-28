'use client';

import { motion } from 'framer-motion';
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

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState(null);

  return (
    <nav className="w-full border-b border-white/5 bg-[#0A0A0F]/65 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
            <span className="text-white text-base">🚀</span>
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            PrepPilot
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.href)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {hoveredLink === link.href && !isActive && (
                  <motion.span
                    layoutId="hoverNavIndicator"
                    className="absolute inset-0 bg-white/[0.02] rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User profile section */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-white">Ashwin Kumar</span>
          <span className="text-[10px] text-slate-400">Premium Scholar</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] p-[1px] cursor-pointer shadow-lg shadow-cyan-500/15"
        >
          <div className="w-full h-full bg-[#0A0A0F] rounded-[11px] flex items-center justify-center text-xs font-bold text-white">
            AK
          </div>
        </motion.div>
      </div>
    </nav>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: '⚡', href: '/dashboard' },
  { name: 'AI Chatbot', icon: '🤖', href: '/chatbot' },
  { name: 'Burnout Risk', icon: '🧠', href: '/burnout' },
  { name: 'Study Notes', icon: '📝', href: '/notes' },
  { name: 'Pomodoro', icon: '⏱️', href: '/pomodoro' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-[calc(100vh-73px)] sticky top-[73px] bg-[#0A0A0F]/40 border-r border-white/5 backdrop-blur-xl p-4 hidden md:flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {MENU_ITEMS.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED]/15 to-[#7C3AED]/5 border border-[#7C3AED]/35 text-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] ml-auto"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/5 border border-white/5 rounded-2xl p-4">
        <p className="text-xs font-bold text-white mb-1">Study Tip of the Day 💡</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Use Pomodoro intervals (25 mins study, 5 mins break) to keep your focus optimal and prevent burnout!
        </p>
      </div>
    </aside>
  );
}

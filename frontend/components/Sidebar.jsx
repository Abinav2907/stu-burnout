'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { name: 'Dashboard',        icon: '⚡', href: '/dashboard' },
  { name: 'AI Chatbot',       icon: '🤖', href: '/chatbot'   },
  { name: 'Burnout Risk',     icon: '🧠', href: '/burnout'   },
  { name: 'Study Notes',      icon: '📝', href: '/notes'     },
  { name: 'Pomodoro',         icon: '⏱️', href: '/pomodoro'  },
];

/* ─── Desktop Sidebar ─── */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 lg:w-72 h-[calc(100vh-73px)] sticky top-[73px] flex-shrink-0 bg-[#0A0A0F]/40 border-r border-white/5 backdrop-blur-xl p-4 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {MENU_ITEMS.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                whileHover={{ x: 4 }}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'text-[#7C3AED]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarItem"
                    className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/15 to-[#7C3AED]/5 border border-[#7C3AED]/30 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="text-lg relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7C3AED] relative z-10" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Study Tip Card */}
      <motion.div
        animate={{ boxShadow: ['0 0 0px #7C3AED00', '0 0 20px #7C3AED25', '0 0 0px #7C3AED00'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-auto bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/5 border border-white/5 rounded-2xl p-4"
      >
        <p className="text-sm font-bold text-white mb-1">💡 Study Tip</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Use the 25-min Pomodoro method to maintain peak focus and reduce burnout risk by 40%.
        </p>
      </motion.div>
    </aside>
  );
}

/* ─── Mobile Drawer Sidebar ─── */
export function MobileSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 h-full w-72 z-50 bg-[#0A0A0F]/95 border-r border-white/10 backdrop-blur-xl p-5 flex flex-col gap-6 md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="font-black text-xl text-white">PrepPilot</span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex flex-col gap-1">
              {MENU_ITEMS.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onClose}>
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#7C3AED]'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;

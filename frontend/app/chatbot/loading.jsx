'use client';

import { motion } from 'framer-motion';

export default function ChatbotLoading() {
  return (
    <div className="flex h-screen bg-[#0F172A] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
        />
        <p className="text-slate-400 text-sm">Loading AI Assistant...</p>
      </div>
    </div>
  );
}

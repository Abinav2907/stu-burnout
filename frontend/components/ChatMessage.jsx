'use client';

import { motion } from 'framer-motion';

const BOT_AVATAR = (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-cyan-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
    <span className="text-xs">🤖</span>
  </div>
);

const USER_AVATAR = (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-violet-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
    <span className="text-xs">👤</span>
  </div>
);

export default function ChatMessage({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`flex gap-3 mb-6 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {isUser ? USER_AVATAR : BOT_AVATAR}

      <div className={`max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-bold text-slate-500 mb-1 px-1">
          {isUser ? 'You' : 'PrepPilot AI'}
        </span>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-[#7C3AED] text-white rounded-tr-none shadow-lg shadow-[#7C3AED]/10'
              : 'bg-white/[0.03] border-l-2 border-l-[#06B6D4] border-y border-r border-white/5 text-slate-100 rounded-tl-none shadow-lg'
          }`}
        >
          {message}
        </div>
      </div>
    </motion.div>
  );
}

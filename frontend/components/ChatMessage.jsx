'use client';

import { motion } from 'framer-motion';

const BOT_AVATAR = (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor" />
    </svg>
  </div>
);

const USER_AVATAR = (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor" />
    </svg>
  </div>
);

export default function ChatMessage({ message, isUser, isTyping }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex gap-3 items-end mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {isUser ? USER_AVATAR : BOT_AVATAR}

      <div className={`max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-slate-500 mb-1 px-1">
          {isUser ? 'You' : 'PrepPilot AI'}
        </span>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-sm shadow-lg shadow-violet-500/20'
              : 'bg-slate-800/80 border border-slate-700/60 text-slate-100 rounded-bl-sm shadow-lg backdrop-blur-sm'
          }`}
        >
          {message}
        </div>
      </div>
    </motion.div>
  );
}

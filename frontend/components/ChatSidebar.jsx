'use client';

import { motion } from 'framer-motion';

const QUICK_ACTIONS = [
  { icon: '📅', label: 'Generate Weekly Timetable', prompt: 'Generate a detailed weekly study timetable for me. Ask me about my subjects and available hours first.' },
  { icon: '📚', label: 'Help me study Mathematics', prompt: 'I want to study Mathematics. Give me a learning plan or help me understand key topics.' },
  { icon: '😰', label: "I'm stressed about exams", prompt: 'I am feeling extremely stressed about my exams. Help me calm down and give me some advice.' },
  { icon: '🎯', label: 'Create Exam Strategy', prompt: 'Help me plan a study strategy for my upcoming exams so I can score high.' },
];

export default function ChatSidebar({ chatHistory = [], activeChatId, onSelectChat, onNewChat, onQuickAction }) {
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 },
    }),
  };

  return (
    <aside className="w-72 flex-shrink-0 h-[calc(100vh-73px)] bg-[#0A0A0F]/50 border-r border-white/5 p-4 flex flex-col gap-6">
      {/* New Chat Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewChat}
        className="w-full py-2.5 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/35 text-[#7C3AED] hover:bg-[#7C3AED]/20 transition-all font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/5"
      >
        <span>✏️</span> New Chat Session
      </motion.button>

      {/* Quick Actions */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Quick Actions</p>
        <div className="flex flex-col gap-1.5">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={action.label}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, x: 2, backgroundColor: 'rgba(255,255,255,0.02)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onQuickAction(action.prompt)}
              className="w-full text-left px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 text-xs font-medium text-slate-300 transition-all truncate flex items-center gap-2"
            >
              <span>{action.icon}</span>
              <span className="truncate">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Chats list */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Recent Chats</p>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
          {chatHistory.length === 0 ? (
            <p className="text-[10px] text-slate-600 px-1 italic">No recent chats</p>
          ) : (
            chatHistory.map((chat, i) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all truncate border ${
                  activeChatId === chat.id
                    ? 'bg-white/5 border-white/10 text-white font-medium'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                💬 {chat.title}
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

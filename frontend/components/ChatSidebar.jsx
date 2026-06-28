'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickActionButton from './QuickActionButton';

const QUICK_ACTIONS = [
  { icon: '📅', label: 'Generate Timetable', gradient: 'bg-gradient-to-r from-violet-600 to-violet-500', prompt: 'Generate a detailed weekly study timetable for me. Ask me about my subjects and available hours first.' },
  { icon: '📚', label: 'Subject Help', gradient: 'bg-gradient-to-r from-blue-600 to-blue-500', prompt: 'I need help with a specific subject. Ask me which subject and what topic I am struggling with.' },
  { icon: '🎯', label: 'Exam Prep', gradient: 'bg-gradient-to-r from-emerald-600 to-emerald-500', prompt: 'Help me prepare for an upcoming exam. Ask me about the subject, exam date, and what I have covered so far.' },
];

export default function ChatSidebar({ chatHistory, activeChatId, onSelectChat, onNewChat, onQuickAction, timetable }) {
  const [collapsed, setCollapsed] = useState(false);

  const containerVariants = {
    open: { width: 280, opacity: 1 },
    closed: { width: 64, opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 },
    }),
  };

  return (
    <motion.aside
      variants={containerVariants}
      animate={collapsed ? 'closed' : 'open'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex-shrink-0 h-full bg-slate-900/80 border-r border-slate-700/50 backdrop-blur-xl flex flex-col overflow-hidden"
    >
      {/* Toggle button */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-4 right-3 z-10 w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        <motion.span
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="text-xs"
        >
          ◀
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Logo */}
            <motion.div
              custom={0}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="px-4 pt-4 pb-3 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-sm">🎓</span>
              </div>
              <span className="font-bold text-white text-sm tracking-wide">PrepPilot AI</span>
            </motion.div>

            {/* New Chat */}
            <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible" className="px-3 mb-4">
              <button
                onClick={onNewChat}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm hover:bg-violet-600/30 transition-colors"
              >
                <span>✏️</span>
                <span>New Chat</span>
              </button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible" className="px-3 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Quick Actions</p>
              <div className="flex flex-col gap-1.5">
                {QUICK_ACTIONS.map((action, i) => (
                  <QuickActionButton
                    key={action.label}
                    icon={action.icon}
                    label={action.label}
                    gradient={action.gradient}
                    delay={0.3 + i * 0.1}
                    onClick={() => onQuickAction(action.prompt)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Study Timetable preview */}
            {timetable && timetable.length > 0 && (
              <motion.div
                custom={5}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="px-3 mb-4"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">My Timetable</p>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  {timetable.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300 truncate">{item.subject}</span>
                      <span className="text-xs text-slate-500 ml-auto flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Chat History */}
            <motion.div custom={6} variants={itemVariants} initial="hidden" animate="visible" className="px-3 flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Recent Chats</p>
              <div className="space-y-1 overflow-y-auto max-h-48 scrollbar-thin">
                {chatHistory.length === 0 ? (
                  <p className="text-xs text-slate-600 px-1">No chats yet</p>
                ) : (
                  chatHistory.map((chat, i) => (
                    <motion.button
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => onSelectChat(chat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate ${
                        activeChatId === chat.id
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
                      }`}
                    >
                      💬 {chat.title || 'New Chat'}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed icons */}
      {collapsed && (
        <div className="flex flex-col items-center gap-4 pt-16 px-2">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onQuickAction(action.prompt)}
              title={action.label}
              className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-base hover:border-violet-500/50 transition-colors"
            >
              {action.icon}
            </motion.button>
          ))}
        </div>
      )}
    </motion.aside>
  );
}

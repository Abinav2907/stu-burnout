'use client';

import { motion } from 'framer-motion';

const SUBJECT_COLORS = {
  Math: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/40', badge: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-400' },
  Physics: { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-300', dot: 'bg-purple-400' },
  Chemistry: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-400' },
  English: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-400' },
  History: { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/40', badge: 'bg-rose-500/20 text-rose-300', dot: 'bg-rose-400' },
  default: { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/40', badge: 'bg-violet-500/20 text-violet-300', dot: 'bg-violet-400' },
};

export default function TimetableCard({ day, subject, time, duration, index = 0 }) {
  const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -60, scale: 0.9 }}
      animate={{ opacity: 1, rotateX: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: index * 0.08,
      }}
      style={{ transformPerspective: 800 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-3.5 cursor-default`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider truncate">{day}</span>
          </div>
          <p className="text-sm font-bold text-white truncate">{subject}</p>
          <p className="text-xs text-slate-400 mt-0.5">{time}</p>
        </div>
        {duration && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${colors.badge}`}>
            {duration}
          </span>
        )}
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

const SUBJECT_COLORS = {
  Mathematics: { bg: 'from-[#7C3AED]/20 to-[#7C3AED]/5', border: 'border-[#7C3AED]/35', badge: 'bg-[#7C3AED]/25 text-violet-300', dot: 'bg-[#7C3AED]' },
  Science: { bg: 'from-[#06B6D4]/20 to-[#06B6D4]/5', border: 'border-[#06B6D4]/35', badge: 'bg-[#06B6D4]/25 text-cyan-300', dot: 'bg-[#06B6D4]' },
  English: { bg: 'from-[#10B981]/20 to-[#10B981]/5', border: 'border-[#10B981]/35', badge: 'bg-[#10B981]/25 text-emerald-300', dot: 'bg-[#10B981]' },
  History: { bg: 'from-[#F59E0B]/20 to-[#F59E0B]/5', border: 'border-[#F59E0B]/35', badge: 'bg-[#F59E0B]/25 text-amber-300', dot: 'bg-[#F59E0B]' },
  default: { bg: 'from-[#7C3AED]/20 to-[#7C3AED]/5', border: 'border-[#7C3AED]/35', badge: 'bg-[#7C3AED]/25 text-violet-300', dot: 'bg-[#7C3AED]' },
};

export default function TimetableCard({ day, subject, time, duration, index = 0 }) {
  const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 240,
        damping: 24,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-3.5 cursor-default`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{day}</span>
          </div>
          <p className="text-sm font-bold text-white truncate">{subject}</p>
          <p className="text-xs text-slate-500 mt-0.5">{time}</p>
        </div>
        {duration && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
            {duration}
          </span>
        )}
      </div>
    </motion.div>
  );
}

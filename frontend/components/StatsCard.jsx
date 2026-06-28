'use client';

import { motion, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function StatsCard({ label, value, unit = '', color = 'text-white', icon }) {
  const countRef = useRef(null);
  const mv = useMotionValue(0);
  const numericValue = parseFloat(value);
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (!isNumeric) return;
    const controls = animate(mv, numericValue, { duration: 2, ease: 'easeOut' });
    return controls.stop;
  }, [numericValue, isNumeric, mv]);

  useEffect(() => {
    if (!isNumeric) return;
    return mv.on('change', (v) => {
      if (countRef.current) countRef.current.textContent = Math.round(v).toLocaleString();
    });
  }, [isNumeric, mv]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-5 flex items-center justify-between shadow-xl"
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest block truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-1.5 mt-2">
          {isNumeric ? (
            <span ref={countRef} className={`text-5xl md:text-6xl font-black tracking-tight ${color}`}>
              0
            </span>
          ) : (
            <span className={`text-5xl md:text-6xl font-black tracking-tight ${color}`}>
              {value}
            </span>
          )}
          {unit && (
            <span className="text-lg text-slate-400 font-semibold">{unit}</span>
          )}
        </div>
      </div>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
      )}
    </motion.div>
  );
}

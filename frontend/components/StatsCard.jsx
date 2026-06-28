'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function StatsCard({ label, value, unit = '', color = 'text-white', icon }) {
  const countRef = useRef(null);
  const motionValue = useMotionValue(0);
  
  // Clean up potential non-numeric strings (like "Low" or "92%")
  const numericValue = parseFloat(value);
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (isNumeric) {
      const controls = animate(motionValue, numericValue, {
        duration: 1.5,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [numericValue, isNumeric, motionValue]);

  // Read value updates
  useEffect(() => {
    if (isNumeric) {
      return motionValue.on('change', (latest) => {
        if (countRef.current) {
          countRef.current.textContent = Math.round(latest).toLocaleString();
        }
      });
    }
  }, [isNumeric, motionValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-4 flex items-center justify-between shadow-xl"
    >
      {/* Background shine shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />

      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-1 mt-1.5">
          {isNumeric ? (
            <span ref={countRef} className={`text-2xl font-black tracking-tight ${color}`}>
              0
            </span>
          ) : (
            <span className={`text-2xl font-black tracking-tight ${color}`}>
              {value}
            </span>
          )}
          {unit && (
            <span className="text-xs text-slate-400 font-medium">{unit}</span>
          )}
        </div>
      </div>

      {icon && (
        <div className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-lg flex-shrink-0`}>
          {icon}
        </div>
      )}
    </motion.div>
  );
}

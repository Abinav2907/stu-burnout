'use client';

import { motion } from 'framer-motion';

const dotVariants = {
  animate: (i) => ({
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'loop',
      delay: i * 0.15,
      ease: 'easeInOut',
    },
  }),
};

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex gap-3 items-end mb-6"
    >
      {/* Bot avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor" />
        </svg>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className="w-2 h-2 rounded-full bg-violet-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

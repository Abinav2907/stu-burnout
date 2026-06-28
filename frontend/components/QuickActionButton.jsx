'use client';

import { motion } from 'framer-motion';

export default function QuickActionButton({ icon, label, gradient, onClick, delay = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white ${gradient} transition-all duration-200 text-left group`}
    >
      <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </motion.button>
  );
}

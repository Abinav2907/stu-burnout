'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FeatureCard({ title, description, icon, href, gradient, stats }) {
  return (
    <Link href={href} className="block w-full">
      <motion.div
        whileHover={{
          scale: 1.04,
          y: -4,
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
        }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-5 group flex flex-col justify-between h-48 cursor-pointer transition-all duration-300"
      >
        {/* Glow behind card on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${gradient}`} />
        </div>

        <div>
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-lg shadow-black/30 mb-4`}>
            {icon}
          </div>

          {/* Titles */}
          <h3 className="font-bold text-white text-base flex items-center gap-1.5 group-hover:text-violet-300 transition-colors">
            {title}
            <motion.span
              className="text-xs opacity-60 inline-block"
              variants={{
                initial: { x: 0 },
                hover: { x: 4 },
              }}
              initial="initial"
              whileHover="hover"
            >
              ➔
            </motion.span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Status</span>
            <span className="text-xs font-bold text-slate-300">{stats}</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

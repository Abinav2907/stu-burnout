'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FeatureCard({ title, description, icon, href, gradient, stats }) {
  return (
    <Link href={href} className="block w-full h-full">
      <motion.div
        whileHover={{
          scale: 1.04,
          y: -8,
          transition: { type: 'spring', stiffness: 400, damping: 18 },
        }}
        whileTap={{ scale: 0.97 }}
        className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-6 group flex flex-col justify-between h-56 cursor-pointer transition-shadow duration-300"
        style={{
          '--glow': gradient,
        }}
      >
        {/* Corner glow */}
        <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${gradient.includes('violet') ? '#7C3AED' : gradient.includes('cyan') ? '#06B6D4' : gradient.includes('red') ? '#EF4444' : gradient.includes('emerald') ? '#10B981' : gradient.includes('amber') ? '#F59E0B' : '#EC4899'})` }}
        />
        {/* Gradient border on hover */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
          style={{ boxShadow: `inset 0 0 0 1px rgba(124,58,237,0.35)` }}
        />

        <div>
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg shadow-black/30 mb-5`}>
            {icon}
          </div>

          {/* Text */}
          <h3 className="font-bold text-white text-2xl md:text-3xl flex items-center gap-2 group-hover:text-violet-300 transition-colors mb-2">
            {title}
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              className="text-lg opacity-50"
            >
              →
            </motion.span>
          </h3>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Footer */}
        {stats && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
            <span className="text-sm font-bold text-slate-300">{stats}</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

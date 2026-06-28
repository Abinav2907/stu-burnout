'use client';

import { motion } from 'framer-motion';

export default function RiskCard({ riskLevel, riskScore, burnoutProbability, dropoutProbability, recommendations }) {
  const config = {
    LOW:    { color: 'text-emerald-400', border: 'border-emerald-500/40', glow: 'shadow-emerald-500/20', bg: 'from-emerald-500/10 to-emerald-600/5', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', label: 'Low Risk ✓' },
    MEDIUM: { color: 'text-amber-400',   border: 'border-amber-500/40',   glow: 'shadow-amber-500/20',   bg: 'from-amber-500/10 to-amber-600/5',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   label: 'Medium Risk ⚠' },
    HIGH:   { color: 'text-red-400',     border: 'border-red-500/40',     glow: 'shadow-red-500/20',     bg: 'from-red-500/10 to-red-600/5',       badge: 'bg-red-500/20 text-red-300 border-red-500/40',         label: 'High Risk ⛔' },
  };

  const c = config[riskLevel] || config.MEDIUM;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-6 shadow-2xl ${c.glow}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Risk Assessment</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${c.badge}`}>
          {c.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Risk Score', value: `${riskScore}%` },
          { label: 'Burnout Risk', value: `${burnoutProbability}%` },
          { label: 'Dropout Risk', value: `${dropoutProbability}%` },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-slate-800/50 rounded-xl p-3 text-center"
          >
            <p className={`text-xl font-bold ${c.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {recommendations && recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommendations</p>
          <ul className="space-y-1.5">
            {recommendations.slice(0, 4).map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className={`mt-0.5 ${c.color} flex-shrink-0`}>•</span>
                {rec}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Sidebar, MobileSidebar } from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import FeatureCard from '@/components/FeatureCard';

const STATS = [
  { label: 'Quiz Score',     value: '92', unit: '%',    color: 'text-violet-400',  icon: '🎯' },
  { label: 'ML Prediction',  value: 'LOW',unit: '',     color: 'text-emerald-400', icon: '🧠' },
  { label: 'Risk Level',     value: '18', unit: '%',    color: 'text-cyan-400',    icon: '📊' },
  { label: 'Study Streak',   value: '12', unit: ' days', color: 'text-amber-400',   icon: '🔥' },
];

const FEATURES = [
  { title: 'Burnout Predictor',     description: '4-step cognitive analysis to detect burnout risk and generate your personal wellness plan.',  icon: '🧠', href: '/burnout',   gradient: 'from-red-600 to-orange-500',   stats: 'Low Risk' },
  { title: 'AI Study Chatbot',      description: 'Your 24/7 AI tutor — generates study timetables, explains concepts, and beats exam anxiety.', icon: '🤖', href: '/chatbot',   gradient: 'from-emerald-600 to-teal-500', stats: 'Active'   },
  { title: 'Topic Quiz',            description: 'Test your knowledge with AI-generated multiple choice quizzes on any subject and topic.',        icon: '🎯', href: '/quiz',      gradient: 'from-violet-600 to-blue-600',  stats: 'Ready'    },
  { title: 'Study Notes Generator', description: 'Transform any topic into beautiful structured study notes with practice Q&A instantly.',         icon: '📝', href: '/notes',     gradient: 'from-amber-600 to-yellow-500', stats: 'Updated'  },
  { title: 'Pomodoro Timer',        description: 'Focus-interval timer with session tracking and task checklist to eliminate distractions.',        icon: '⏱️', href: '/pomodoro',  gradient: 'from-pink-600 to-rose-500',    stats: 'Ready'    },
];

const ACTIVITIES = [
  { text: 'Completed 25-min Pomodoro session on Organic Chemistry',          time: '10 mins ago', badge: 'Study'     },
  { text: 'Generated detailed notes for "Computer Networks — OSI Model"',    time: '2 hours ago', badge: 'Notes'     },
  { text: 'Conducted mock interview: Software Engineer Intern',               time: 'Yesterday',   badge: 'Interview' },
  { text: 'Burnout assessment — Result: Low Risk ✅',                         time: '2 days ago',  badge: 'Wellbeing' },
];

const WORDS = ['Good', 'Morning,', 'Student', '👋'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
};
const wordVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 max-w-6xl"
          >
            {/* Greeting */}
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {WORDS.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordVariants}
                    className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mt-3">
                Here's your academic and wellness overview — Saturday, June 28
              </motion.p>
            </div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {STATS.map((s) => (
                <StatsCard key={s.label} {...s} />
              ))}
            </motion.div>

            {/* Feature Cards */}
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Explore PrepPilot Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-md"
            >
              <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Recent Activity</h2>
              <div className="space-y-3">
                {ACTIVITIES.map((a, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-base text-slate-200">{a.text}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 flex-shrink-0">
                      {a.badge}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

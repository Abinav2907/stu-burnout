'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import FeatureCard from '@/components/FeatureCard';

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');
  const fullGreeting = 'Good Morning, Student 👋';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullGreeting.length) {
        setGreeting(fullGreeting.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 25 },
    },
  };

  const stats = [
    { label: 'Resume Score', value: '88', unit: '%', color: 'text-violet-400', icon: '📄' },
    { label: 'Interview Score', value: '76', unit: '%', color: 'text-cyan-400', icon: '🎤' },
    { label: 'Risk Level', value: '18', unit: '%', color: 'text-emerald-400', icon: '🧠' },
    { label: 'Study Streak', value: '12', unit: 'days', color: 'text-amber-400', icon: '🔥' },
  ];

  const features = [
    {
      title: 'Resume Analyzer',
      description: 'Analyze your resume against industry benchmarks with instant actionable AI improvements.',
      icon: '📄',
      href: '/resume',
      gradient: 'from-violet-600 to-indigo-600',
      stats: 'Ready',
    },
    {
      title: 'Interview Prep',
      description: 'Interactive audio/chat AI interview simulator with targeted real-time evaluation.',
      icon: '🎤',
      href: '/interview',
      gradient: 'from-cyan-600 to-blue-600',
      stats: 'Ready',
    },
    {
      title: 'Burnout Predictor',
      description: 'Take a comprehensive cognitive and lifestyle test to gauge mental burnout & dropout risk.',
      icon: '🧠',
      href: '/burnout',
      gradient: 'from-red-600 to-orange-500',
      stats: 'Low Risk',
    },
    {
      title: 'AI Study Chatbot',
      description: 'Your premium 24/7 AI tutor for custom timetables, concept doubts, and homework help.',
      icon: '🤖',
      href: '/chatbot',
      gradient: 'from-emerald-600 to-teal-500',
      stats: 'Active',
    },
    {
      title: 'Study Notes Generator',
      description: 'Transform subject topics into detailed structured notes with practice questions instantly.',
      icon: '📝',
      href: '/notes',
      gradient: 'from-amber-600 to-yellow-500',
      stats: 'Updated',
    },
    {
      title: 'Pomodoro Timer',
      description: 'High-focus customizable work interval timer to balance study and breaks seamlessly.',
      icon: '⏱️',
      href: '/pomodoro',
      gradient: 'from-pink-600 to-rose-500',
      stats: 'Ready',
    },
  ];

  const activities = [
    { text: 'Completed a 25-minute study session on Organic Chemistry', time: '10 mins ago', badge: 'Study' },
    { text: 'Generated notes for "Computer Networks — Layer Protocols"', time: '2 hours ago', badge: 'Notes' },
    { text: 'Conducted a mock interview for Software Engineer Intern position', time: 'Yesterday', badge: 'Interview' },
    { text: 'Calculated GPA forecast for Summer Term (Target: 3.82)', time: '2 days ago', badge: 'GPA' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
          >
            {/* Header / Greeting */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center h-12">
                {greeting}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Here is your academic and wellness overview for today, June 28.
              </p>
            </div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {stats.map((stat, i) => (
                <StatsCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  unit={stat.unit}
                  color={stat.color}
                  icon={stat.icon}
                />
              ))}
            </motion.div>

            {/* Feature Cards Grid */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white tracking-wide">Explore PrepPilot Tools</h2>
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {features.map((feat) => (
                  <FeatureCard
                    key={feat.title}
                    title={feat.title}
                    description={feat.description}
                    icon={feat.icon}
                    href={feat.href}
                    gradient={feat.gradient}
                    stats={feat.stats}
                  />
                ))}
              </motion.div>
            </div>

            {/* Recent Activity List */}
            <motion.div
              variants={itemVariants}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-md"
            >
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Recent Activity</h2>
              <div className="space-y-4">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-200">{act.text}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{act.time}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 flex-shrink-0">
                      {act.badge}
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

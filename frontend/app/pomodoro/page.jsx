'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Sidebar, MobileSidebar } from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const USER_ID = 'student_001';

export default function PomodoroPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState('Focus'); // Focus (25m), Short (5m), Long (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showBurst, setShowBurst] = useState(false);

  const timerRef = useRef(null);

  const getModeDuration = (currentMode) => {
    if (currentMode === 'Focus') return 25 * 60;
    if (currentMode === 'Short') return 5 * 60;
    return 15 * 60;
  };

  // Load stats and tasks on mount
  useEffect(() => {
    // 1. Fetch Stats
    axios.get(`${API_URL}/api/pomodoro/stats?userId=${USER_ID}`)
      .then(res => {
        if (res.data?.success) {
          setCompletedSessions(res.data.sessionsDone || 0);
          setTotalFocusTime(res.data.totalFocusTime || 0);
        }
      })
      .catch(err => console.error('Failed to load Pomodoro stats:', err));

    // 2. Fetch Tasks
    axios.get(`${API_URL}/api/pomodoro/tasks?userId=${USER_ID}`)
      .then(res => {
        if (res.data?.success) {
          setTasks(res.data.tasks || []);
        }
      })
      .catch(err => console.error('Failed to load Pomodoro tasks:', err));
  }, []);

  useEffect(() => {
    setTimeLeft(getModeDuration(mode));
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleCycleCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const handleCycleCompletion = async () => {
    setIsActive(false);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 2000);

    const durationMinutes = Math.round(getModeDuration(mode) / 60);

    // Save session to backend DB
    try {
      await axios.post(`${API_URL}/api/pomodoro/session`, {
        userId: USER_ID,
        duration: durationMinutes,
        mode: mode
      });
    } catch (err) {
      console.error('Failed to save focus session:', err);
    }

    if (mode === 'Focus') {
      setCompletedSessions((s) => s + 1);
      setTotalFocusTime((t) => t + durationMinutes);
      // Auto-transition to break
      if ((completedSessions + 1) % 4 === 0) {
        setMode('Long');
      } else {
        setMode('Short');
      }
    } else {
      setMode('Focus');
    }
  };

  const handleStartStop = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(getModeDuration(mode));
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/api/pomodoro/tasks`, {
        userId: USER_ID,
        text: newTaskText.trim()
      });
      if (res.data?.success && res.data.task) {
        setTasks((prev) => [...prev, res.data.task]);
      }
      setNewTaskText('');
    } catch (err) {
      console.error('Failed to add Pomodoro task:', err);
    }
  };

  const handleToggleTask = async (id, currentCompleted) => {
    // Optimistic local update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      await axios.put(`${API_URL}/api/pomodoro/tasks/${id}`, {
        completed: !currentCompleted
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: currentCompleted } : t))
      );
    }
  };

  const handleDeleteTask = async (e, id) => {
    e.stopPropagation(); // prevent toggle trigger
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await axios.delete(`${API_URL}/api/pomodoro/tasks/${id}`);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Circular timer constants
  const maxTime = getModeDuration(mode);
  const radius = 90;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = maxTime > 0 ? circumference - (timeLeft / maxTime) * circumference : 0;

  // Background colors corresponding to modes
  const modeColors = {
    Focus: { main: '#7C3AED', text: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/15', ring: '#7C3AED', border: 'border-[#7C3AED]/30' },
    Short: { main: '#10B981', text: 'text-[#10B981]', bg: 'bg-[#10B981]/15', ring: '#10B981', border: 'border-[#10B981]/30' },
    Long: { main: '#06B6D4', text: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/15', ring: '#06B6D4', border: 'border-[#06B6D4]/30' },
  };
  const activeColor = modeColors[mode];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Timer (Col 7) */}
          <div className="md:col-span-7 flex flex-col items-center gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
            
            {/* Burst Completion Animation */}
            <AnimatePresence>
              {showBurst && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [1, 1, 0], scale: [0.8, 1.8, 2.5] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div
                    className="w-24 h-24 rounded-full filter blur-xl opacity-40"
                    style={{ backgroundColor: activeColor.main }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode Toggles */}
            <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-full max-w-sm justify-between">
              {['Focus', 'Short', 'Long'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    mode === m
                      ? `bg-[#0A0A0F] ${modeColors[m].text} border ${modeColors[m].border}`
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'Focus' ? 'Focus' : m === 'Short' ? 'Short Break' : 'Long Break'}
                </button>
              ))}
            </div>

            {/* Timer Circle */}
            <div className="relative w-56 h-56 flex items-center justify-center mt-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth={strokeWidth}
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={activeColor.ring}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.35, ease: 'linear' }}
                  style={{ filter: `drop-shadow(0 0 6px ${activeColor.main}50)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white tracking-tight">{formatTime(timeLeft)}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{mode} Mode</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              <motion.button
                onClick={handleStartStop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: activeColor.main }}
                className="px-8 py-3 rounded-xl text-xs font-black text-white shadow-lg shadow-black/20"
              >
                {isActive ? 'Pause Session' : 'Start Focus'}
              </motion.button>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right Tasks & Stats (Col 5) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Stats */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-md">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Today's Focus Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <span className="text-xl font-black text-white">{completedSessions}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-0.5">Sessions Done</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <span className="text-xl font-black text-white">{totalFocusTime}m</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-0.5">Focus Duration</span>
                </div>
              </div>
            </div>

            {/* Task Manager */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-md flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pomodoro Tasks</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <AnimatePresence>
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleToggleTask(task.id, task.completed)}
                        className={`flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 cursor-pointer transition-all ${
                          task.completed ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              task.completed
                                ? 'bg-[#10B981] border-[#10B981] text-black font-black text-[9px]'
                                : 'border-white/20'
                            }`}
                          >
                            {task.completed && '✓'}
                          </div>
                          <span
                            className={`text-xs text-slate-300 ${
                              task.completed ? 'line-through decoration-slate-600' : ''
                            }`}
                          >
                            {task.text}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteTask(e, task.id)}
                          className="text-slate-500 hover:text-red-400 text-xs transition-colors p-1"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <input
                  type="text"
                  placeholder="Add session focus target..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
                <button
                  onClick={handleAddTask}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-bold hover:bg-white/10 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

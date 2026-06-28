'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Sidebar, MobileSidebar } from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── Confetti burst ─── */
function ConfettiBurst() {
  const DOTS = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: -(Math.random() * 200 + 100),
    color: ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'][i % 5],
  }));
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-20">
      {DOTS.map((d) => (
        <motion.div
          key={d.id}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: d.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: d.x, y: d.y, scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 1.2, delay: d.id * 0.03, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ─── SVG Score Circle ─── */
function ScoreCircle({ score }) {
  const R = 70, SW = 10;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={SW} />
        <motion.circle
          cx="80" cy="80" r={R} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="text-4xl font-black text-white"
        >{score}%</motion.span>
        <span className="text-[10px] text-slate-400 font-medium">Score</span>
      </div>
    </div>
  );
}

const DIFFICULTY_CONFIG = {
  Easy:   { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/15', glow: 'shadow-emerald-500/20' },
  Medium: { color: 'text-amber-400',   border: 'border-amber-500/50',   bg: 'bg-amber-500/15',   glow: 'shadow-amber-500/20'   },
  Hard:   { color: 'text-red-400',     border: 'border-red-500/50',     bg: 'bg-red-500/15',     glow: 'shadow-red-500/20'     },
};

const BADGE_MAP = [
  { min: 80, label: 'Excellent! 🌟',     color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/15' },
  { min: 60, label: 'Good Job! 👍',       color: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/15'         },
  { min: 40, label: 'Needs Practice 📚',  color: 'text-amber-400 border-amber-500/50 bg-amber-500/15'      },
  { min: 0,  label: 'Keep Trying! 💪',   color: 'text-red-400 border-red-500/50 bg-red-500/15'            },
];

const getQuizAdvice = (pct) => {
  if (pct >= 80) {
    return {
      title: "Excellent Mastery! 🚀",
      description: "Superb job! You've shown an excellent grasp of these concepts. Challenge yourself by increasing the difficulty to Hard or generating new study notes for adjacent topics.",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    };
  } else if (pct >= 50) {
    return {
      title: "Keep Building! 👍",
      description: "Nice progress! You understand the key foundations. Go back and check the explanations for any missed answers, and do a quick Pomodoro study session to polish those points.",
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    };
  } else {
    return {
      title: "Time to Revise! 📚",
      description: "Don't worry — everyone starts somewhere! We highly recommend utilizing the Study Notes Generator to create a revision guide on this topic, study it, and try this Easy quiz again.",
      color: "text-red-400 border-red-500/20 bg-red-500/5",
    };
  }
};

const getOptions = (options) => {
  if (!options) return { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' };
  if (Array.isArray(options)) {
    return {
      A: options[0] || 'Option A',
      B: options[1] || 'Option B',
      C: options[2] || 'Option C',
      D: options[3] || 'Option D',
    };
  }
  const normalized = {};
  const letters = ['A', 'B', 'C', 'D'];
  letters.forEach((l) => {
    normalized[l] = options[l] || options[l.toLowerCase()] || `Option ${l}`;
  });
  return normalized;
};

const stepVariants = {
  enter:  { x: 100, opacity: 0 },
  center: { x: 0,   opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
  exit:   { x: -100, opacity: 0, transition: { duration: 0.2 } },
};
const optionVariants = {
  hidden:  { opacity: 0, x: -20 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 } }),
};

export default function QuizPage() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [screen, setScreen]             = useState('setup'); // setup | quiz | results
  const [subject, setSubject]           = useState('');
  const [topic, setTopic]               = useState('');
  const [difficulty, setDifficulty]     = useState('Medium');
  const [count, setCount]               = useState(5);
  const [isLoading, setIsLoading]       = useState(false);
  const [questions, setQuestions]       = useState([]);
  const [currentQ, setCurrentQ]         = useState(0);
  const [selected, setSelected]         = useState(null);   // 'A'|'B'|'C'|'D'
  const [answers, setAnswers]           = useState([]);     // { selected, correct }[]
  const [showConfetti, setShowConfetti] = useState(false);

  /* ─── Generate Quiz ─── */
  const handleGenerate = async () => {
    if (!subject.trim() || !topic.trim()) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/quiz/generate`, { subject, topic, difficulty, count });
      const qs = res.data?.questions ?? [];
      if (qs.length > 0) { setQuestions(qs); setAnswers([]); setCurrentQ(0); setSelected(null); setScreen('quiz'); }
    } catch {
      // local fallback questions
      const fallback = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        question: `Sample question ${i + 1} about ${topic} in ${subject}?`,
        options: { A: 'First option', B: 'Second option', C: 'Third option', D: 'Fourth option' },
        correct: ['A','B','C','D'][i % 4],
        explanation: `This is the explanation for question ${i + 1}.`,
      }));
      setQuestions(fallback); setAnswers([]); setCurrentQ(0); setSelected(null); setScreen('quiz');
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Select Answer ─── */
  const handleSelect = (option) => {
    if (selected) return; // already answered
    setSelected(option);
  };

  /* ─── Next Question ─── */
  const handleNext = () => {
    const q = questions[currentQ];
    const newAnswers = [...answers, { selected, correct: q.correct }];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ + 1 >= questions.length) {
      // Show results
      const score = newAnswers.filter((a) => a.selected === a.correct).length;
      const pct = Math.round((score / questions.length) * 100);
      if (pct >= 70) setShowConfetti(true);
      setScreen('results');
      // Save result (best-effort)
      try {
        axios.post(`${API_URL}/api/quiz/saveResult`, {
          userId: 'anonymous', subject, topic, difficulty,
          score, totalQuestions: questions.length,
        });
      } catch {}
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  /* ─── Computed ─── */
  const correctCount = answers.filter((a) => a.selected === a.correct).length;
  const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const badge = BADGE_MAP.find((b) => pct >= b.min);
  const q = questions[currentQ] ?? null;
  const diff = DIFFICULTY_CONFIG[difficulty];

  /* ─── Option State ─── */
  const optionState = (key) => {
    if (!selected) return 'idle';
    if (key === q?.correct) return 'correct';
    if (key === selected)   return 'wrong';
    return 'idle';
  };

  const OPTION_CLASSES = {
    idle:    'border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/20 hover:bg-white/[0.04]',
    correct: 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/10',
    wrong:   'border-red-500/70 bg-red-500/15 text-red-300',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-start justify-center">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">

              {/* ═══════════ SETUP SCREEN ═══════════ */}
              {screen === 'setup' && (
                <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-8"
                >
                  {/* Title */}
                  <div>
                    {['Topic', 'Quiz', 'Generator'].map((w, i) => (
                      <motion.span key={w}
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                        className="text-5xl md:text-6xl font-black text-white mr-3 inline-block"
                      >{w}</motion.span>
                    ))}
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      className="text-lg text-slate-400 mt-2">
                      Test your knowledge with AI-powered quizzes
                    </motion.p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6">
                    {/* Inputs */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                      <input value={subject} onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Mathematics, Physics, History"
                        className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/70 transition-colors"
                      />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topic</label>
                      <input value={topic} onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Integration, Newton's Laws, World War 2"
                        className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/70 transition-colors"
                      />
                    </motion.div>

                    {/* Difficulty */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }} className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</label>
                      <div className="flex gap-3">
                        {['Easy','Medium','Hard'].map((d) => {
                          const c = DIFFICULTY_CONFIG[d];
                          return (
                            <motion.button key={d} onClick={() => setDifficulty(d)}
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                difficulty === d
                                  ? `${c.color} ${c.border} ${c.bg} shadow-lg ${c.glow}`
                                  : 'text-slate-400 border-white/10 bg-white/[0.02] hover:text-white'
                              }`}
                            >{d}</motion.button>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Question count */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44 }} className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Number of Questions</label>
                      <div className="flex gap-3">
                        {[5,10,15].map((n) => (
                          <button key={n} onClick={() => setCount(n)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                              count === n
                                ? 'bg-[#7C3AED]/20 border-[#7C3AED]/50 text-[#7C3AED]'
                                : 'text-slate-400 border-white/10 bg-white/[0.02] hover:text-white'
                            }`}
                          >{n}</button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Generate Button */}
                    <motion.button onClick={handleGenerate} disabled={isLoading || !subject || !topic}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      animate={isLoading ? {} : { boxShadow: ['0 0 0px #7C3AED00','0 0 24px #7C3AED35','0 0 0px #7C3AED00'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-blue-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Generating Quiz…</span></>
                      ) : 'Generate Quiz 🎯'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ═══════════ QUIZ SCREEN ═══════════ */}
              {screen === 'quiz' && q && (
                <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col gap-6"
                >
                  {/* Progress */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-400">Question {currentQ + 1} of {questions.length}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diff.color} ${diff.border} ${diff.bg}`}>{difficulty}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-[#7C3AED] to-blue-500 rounded-full"
                      animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  {/* Question Card */}
                  <AnimatePresence mode="wait">
                    <motion.div key={currentQ}
                      variants={stepVariants} initial="enter" animate="center" exit="exit"
                      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center text-xs font-black text-[#7C3AED] flex-shrink-0">
                          {currentQ + 1}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">{q.question}</h2>
                      </div>

                      {/* Options */}
                      <div className="flex flex-col gap-3">
                        {Object.entries(getOptions(q.options)).map(([key, val], i) => {
                          const state = optionState(key);
                          return (
                            <motion.button key={key}
                              custom={i} variants={optionVariants} initial="hidden" animate="visible"
                              onClick={() => handleSelect(key)}
                              animate={state === 'wrong' ? { x: [-8, 8, -8, 8, 0] } : {}}
                              transition={state === 'wrong' ? { duration: 0.4 } : {}}
                              whileHover={!selected ? { scale: 1.01 } : {}}
                              className={`w-full text-left p-4 rounded-xl border-l-4 transition-all flex items-start gap-3 ${OPTION_CLASSES[state]} cursor-pointer`}
                            >
                              <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-black flex-shrink-0">{key}</span>
                              <span className="text-sm">{val}</span>
                              {selected && key === q.correct && <span className="ml-auto text-emerald-400 font-bold flex-shrink-0">✓</span>}
                              {selected && key === selected && key !== q.correct && <span className="ml-auto text-red-400 font-bold flex-shrink-0">✗</span>}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Explanation + Next */}
                      {selected && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                          {q.explanation && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed">
                              💡 <span className="font-bold text-slate-200">Explanation:</span> {q.explanation}
                            </div>
                          )}
                          <button onClick={handleNext}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-blue-600 text-white font-bold text-sm hover:opacity-90 active:scale-98 transition-all"
                          >
                            {currentQ + 1 >= questions.length ? 'See Results 🏆' : 'Next Question →'}
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ═══════════ RESULTS SCREEN ═══════════ */}
              {screen === 'results' && (
                <motion.div key="results" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6 relative overflow-hidden"
                >
                  {showConfetti && <ConfettiBurst />}

                  {/* Score Circle */}
                  <div className="flex flex-col items-center gap-3">
                    <ScoreCircle score={pct} />
                    <p className="text-lg font-bold text-white">{correctCount} out of {questions.length} correct</p>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-black border ${badge?.color}`}>{badge?.label}</span>
                  </div>

                  {/* Performance Advice */}
                  {(() => {
                    const advice = getQuizAdvice(pct);
                    return (
                      <div className={`border rounded-xl p-4 flex flex-col gap-1.5 ${advice.color}`}>
                        <span className="text-sm font-bold uppercase tracking-wider">{advice.title}</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{advice.description}</p>
                      </div>
                    );
                  })()}

                  {/* Question Review */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question Review</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {questions.map((qq, i) => {
                        const a = answers[i];
                        const isCorrect = a?.selected === qq.correct;
                        return (
                          <motion.div key={i}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col gap-1.5"
                          >
                            <p className="text-xs font-bold text-slate-200">{i + 1}. {qq.question}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isCorrect ? '✓' : '✗'} Your answer: {a?.selected} — {qq.options?.[a?.selected]}
                              </span>
                            </div>
                            {!isCorrect && (
                              <p className="text-xs text-emerald-400">✓ Correct: {qq.correct} — {qq.options?.[qq.correct]}</p>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button onClick={() => { setAnswers([]); setCurrentQ(0); setSelected(null); setShowConfetti(false); setScreen('quiz'); }}
                      className="flex-1 py-3 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#7C3AED] font-bold text-sm hover:bg-[#7C3AED]/30 transition-colors">
                      Try Again 🔄
                    </button>
                    <button onClick={() => { setSubject(''); setTopic(''); setQuestions([]); setAnswers([]); setCurrentQ(0); setSelected(null); setShowConfetti(false); setScreen('setup'); }}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/5 transition-colors">
                      New Quiz ✨
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

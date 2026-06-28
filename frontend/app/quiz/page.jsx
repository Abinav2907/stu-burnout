'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Sidebar, MobileSidebar } from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const USER_ID = 'student_001'; // Fixed user ID for DB storage

/* ─── Normalize options from AI response ─── */
function normalizeOptions(rawOptions) {
  if (!rawOptions) return { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' };

  if (Array.isArray(rawOptions)) {
    const letters = ['A', 'B', 'C', 'D'];
    const result = {};
    letters.forEach((l, i) => { result[l] = rawOptions[i] ?? `Option ${l}`; });
    return result;
  }

  if (typeof rawOptions === 'object') {
    return {
      A: rawOptions['A'] ?? rawOptions['a'] ?? rawOptions['1'] ?? 'Option A',
      B: rawOptions['B'] ?? rawOptions['b'] ?? rawOptions['2'] ?? 'Option B',
      C: rawOptions['C'] ?? rawOptions['c'] ?? rawOptions['3'] ?? 'Option C',
      D: rawOptions['D'] ?? rawOptions['d'] ?? rawOptions['4'] ?? 'Option D',
    };
  }

  return { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' };
}

/* ─── SVG Score Circle ─── */
function ScoreCircle({ score }) {
  const R = 68, SW = 10;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={SW} />
        <motion.circle
          cx="80" cy="80" r={R} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 10px ${color}70)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-black text-white"
        >{score}%</motion.span>
        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Score</span>
      </div>
    </div>
  );
}

/* ─── Option Button — completely isolated component to avoid animation conflicts ─── */
function OptionButton({ optKey, value, state, onClick, index }) {
  const stateClass = {
    idle:    'border-white/10 bg-white/[0.03] text-slate-200 hover:border-violet-500/40 hover:bg-white/[0.06] cursor-pointer',
    correct: 'border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/10 cursor-default',
    wrong:   'border-red-500 bg-red-500/15 text-red-300 cursor-default',
    dim:     'border-white/5 bg-white/[0.01] text-slate-500 cursor-default',
  }[state] ?? 'border-white/10 bg-white/[0.03] text-slate-200 cursor-pointer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={state !== 'idle'}
        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 group ${stateClass}`}
      >
        {/* Key badge */}
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
          state === 'correct' ? 'bg-emerald-500 text-white' :
          state === 'wrong'   ? 'bg-red-500 text-white' :
          'bg-white/10 text-slate-300 group-hover:bg-violet-500/30 group-hover:text-violet-200'
        }`}>
          {optKey}
        </span>

        {/* Text */}
        <span className="text-sm leading-snug flex-1">{value}</span>

        {/* Icon */}
        {state === 'correct' && <span className="text-emerald-400 font-black text-base flex-shrink-0">✓</span>}
        {state === 'wrong'   && <span className="text-red-400 font-black text-base flex-shrink-0">✗</span>}
      </button>
    </motion.div>
  );
}

const DIFFICULTY_CFG = {
  Easy:   { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/15' },
  Medium: { color: 'text-amber-400',   border: 'border-amber-500/50',   bg: 'bg-amber-500/15'   },
  Hard:   { color: 'text-red-400',     border: 'border-red-500/50',     bg: 'bg-red-500/15'     },
};

const BADGE_MAP = [
  { min: 80, label: '🌟 Excellent!',       color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { min: 60, label: '👍 Good Job!',         color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'         },
  { min: 40, label: '📚 Needs Practice',    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10'      },
  { min: 0,  label: '💪 Keep Trying!',     color: 'text-red-400 border-red-500/40 bg-red-500/10'            },
];

function getAdvice(pct) {
  if (pct >= 80) return { icon: '🚀', title: 'Outstanding Mastery!', text: 'You have an excellent grasp of this topic. Try increasing the difficulty to Hard or explore adjacent topics to deepen your knowledge.', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' };
  if (pct >= 50) return { icon: '📈', title: 'Good Progress!', text: 'You have the key foundations. Review the explanations for missed answers, then do a Pomodoro session to reinforce the weak areas.', color: 'border-amber-500/20 bg-amber-500/5 text-amber-300' };
  return { icon: '📖', title: 'Time to Revise!', text: "Don't worry — use the Study Notes Generator to create a quick revision guide on this topic, then re-attempt an Easy quiz to build confidence.", color: 'border-red-500/20 bg-red-500/5 text-red-300' };
}

/* ═══════════════════════════════════════ MAIN PAGE ═══════════════════════════════════════ */
export default function QuizPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [screen, setScreen]         = useState('setup');
  const [subject, setSubject]       = useState('');
  const [topic, setTopic]           = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount]           = useState(5);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');

  const [questions, setQuestions]   = useState([]);
  const [currentQ, setCurrentQ]     = useState(0);
  const [selected, setSelected]     = useState(null);   // 'A' | 'B' | 'C' | 'D' | null
  const [answers, setAnswers]       = useState([]);     // { chosen, correct }[]
  const [showConfetti, setShowConfetti] = useState(false);

  /* ─── Generate ─── */
  const handleGenerate = async () => {
    if (!subject.trim() || !topic.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/quiz/generate`, {
        subject: subject.trim(),
        topic: topic.trim(),
        difficulty,
        count: Number(count),
      });
      const qs = res.data?.questions ?? [];
      if (!qs.length) throw new Error('No questions returned');
      // Normalize options for every question
      const normalized = qs.map((q, i) => ({
        id: q.id ?? i + 1,
        question: q.question ?? `Question ${i + 1}`,
        options: normalizeOptions(q.options),
        correct: (q.correct ?? 'A').toUpperCase(),
        explanation: q.explanation ?? '',
      }));
      setQuestions(normalized);
      setAnswers([]);
      setCurrentQ(0);
      setSelected(null);
      setShowConfetti(false);
      setScreen('quiz');
    } catch (err) {
      setError('Failed to generate quiz. Please check that your backend is running and API keys are set.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Select Answer ─── */
  const handleSelect = useCallback((opt) => {
    if (selected !== null) return; // already answered
    setSelected(opt);
  }, [selected]);

  /* ─── Next Question ─── */
  const handleNext = () => {
    const q = questions[currentQ];
    const newAnswers = [...answers, { chosen: selected, correct: q.correct }];
    setAnswers(newAnswers);

    if (currentQ + 1 >= questions.length) {
      const correctCount = newAnswers.filter(a => a.chosen === a.correct).length;
      const pct = Math.round((correctCount / questions.length) * 100);
      if (pct >= 70) setShowConfetti(true);
      // Save result to Supabase via backend
      axios.post(`${API_URL}/api/quiz/saveResult`, {
        userId: USER_ID,
        subject,
        topic,
        difficulty,
        score: correctCount,
        totalQuestions: questions.length,
      }).catch(() => {});
      setScreen('results');
    } else {
      setSelected(null);
      setCurrentQ(c => c + 1);
    }
  };

  /* ─── Computed ─── */
  const q = questions[currentQ] ?? null;
  const diff = DIFFICULTY_CFG[difficulty];
  const correctCount = answers.filter(a => a.chosen === a.correct).length;
  const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const badge = BADGE_MAP.find(b => pct >= b.min) ?? BADGE_MAP[3];
  const advice = getAdvice(pct);

  const optionState = (key) => {
    if (selected === null) return 'idle';
    if (key === q?.correct) return 'correct';
    if (key === selected) return 'wrong';
    return 'dim';
  };

  /* ─── Reset helpers ─── */
  const resetToSetup = () => {
    setSubject(''); setTopic(''); setQuestions([]); setAnswers([]);
    setCurrentQ(0); setSelected(null); setShowConfetti(false); setScreen('setup');
  };
  const retryQuiz = () => {
    setAnswers([]); setCurrentQ(0); setSelected(null); setShowConfetti(false); setScreen('quiz');
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

              {/* ══════════════ SETUP SCREEN ══════════════ */}
              {screen === 'setup' && (
                <motion.div key="setup"
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
                  className="flex flex-col gap-7"
                >
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
                      Topic <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Quiz</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-base">AI-powered quizzes on any subject</p>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm flex flex-col gap-5">

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                      <input
                        value={subject} onChange={e => setSubject(e.target.value)}
                        placeholder="e.g. Mathematics, Physics, History"
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors"
                      />
                    </div>

                    {/* Topic */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topic</label>
                      <input
                        value={topic} onChange={e => setTopic(e.target.value)}
                        placeholder="e.g. Integration, Newton's Laws, World War 2"
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors"
                        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                      />
                    </div>

                    {/* Difficulty */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</label>
                      <div className="flex gap-2">
                        {['Easy', 'Medium', 'Hard'].map(d => {
                          const c = DIFFICULTY_CFG[d];
                          return (
                            <button key={d} type="button" onClick={() => setDifficulty(d)}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                difficulty === d
                                  ? `${c.color} ${c.border} ${c.bg}`
                                  : 'text-slate-500 border-white/10 bg-white/[0.02] hover:text-slate-200'
                              }`}
                            >{d}</button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Count */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Number of Questions</label>
                      <div className="flex gap-2">
                        {[5, 10, 15].map(n => (
                          <button key={n} type="button" onClick={() => setCount(n)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                              count === n
                                ? 'text-violet-400 border-violet-500/50 bg-violet-500/15'
                                : 'text-slate-500 border-white/10 bg-white/[0.02] hover:text-slate-200'
                            }`}
                          >{n}</button>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>
                    )}

                    {/* Generate */}
                    <button type="button" onClick={handleGenerate}
                      disabled={isLoading || !subject.trim() || !topic.trim()}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      {isLoading ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Generating…</span></>
                      ) : <>Generate Quiz 🎯</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ══════════════ QUIZ SCREEN ══════════════ */}
              {screen === 'quiz' && q && (
                <motion.div key="quiz"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-400">
                      Question <span className="text-white">{currentQ + 1}</span> / {questions.length}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diff.color} ${diff.border} ${diff.bg}`}>
                      {difficulty}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                      animate={{ width: `${((currentQ + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Question Card */}
                  <AnimatePresence mode="wait">
                    <motion.div key={`q-${currentQ}`}
                      initial={{ x: 60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -60, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 md:p-6 flex flex-col gap-5"
                    >
                      {/* Question text */}
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-black text-violet-400 flex-shrink-0 mt-0.5">
                          {currentQ + 1}
                        </span>
                        <h2 className="text-lg md:text-xl font-bold text-white leading-snug">{q.question}</h2>
                      </div>

                      {/* Options — ALWAYS render all 4 */}
                      <div className="flex flex-col gap-2.5">
                        {(['A', 'B', 'C', 'D']).map((key, i) => (
                          <OptionButton
                            key={key}
                            optKey={key}
                            value={q.options[key] ?? `Option ${key}`}
                            state={optionState(key)}
                            onClick={() => handleSelect(key)}
                            index={i}
                          />
                        ))}
                      </div>

                      {/* Explanation + Next (shown after selection) */}
                      <AnimatePresence>
                        {selected !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                            className="flex flex-col gap-3 pt-1"
                          >
                            {q.explanation && (
                              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
                                <span className="font-bold text-slate-100">💡 Explanation: </span>
                                {q.explanation}
                              </div>
                            )}
                            <button type="button" onClick={handleNext}
                              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                              {currentQ + 1 >= questions.length ? 'See Results 🏆' : 'Next Question →'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ══════════════ RESULTS SCREEN ══════════════ */}
              {screen === 'results' && (
                <motion.div key="results"
                  initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden"
                >
                  {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {Array.from({ length: 24 }, (_, i) => (
                        <motion.div key={i}
                          className="absolute w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: ['#7C3AED','#06B6D4','#10B981','#F59E0B','#EC4899'][i % 5],
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          initial={{ scale: 0, opacity: 1, y: 0 }}
                          animate={{ scale: [0, 1.4, 0], opacity: [1, 1, 0], y: -(Math.random() * 150 + 50) }}
                          transition={{ duration: 1.3, delay: i * 0.04, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Score */}
                  <div className="flex flex-col items-center gap-3">
                    <ScoreCircle score={pct} />
                    <p className="text-white font-bold text-lg">{correctCount} / {questions.length} correct</p>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-black border ${badge.color}`}>{badge.label}</span>
                  </div>

                  {/* Advice card */}
                  <div className={`border rounded-xl p-4 flex gap-3 items-start ${advice.color}`}>
                    <span className="text-2xl flex-shrink-0">{advice.icon}</span>
                    <div>
                      <p className="font-bold text-sm mb-1">{advice.title}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{advice.text}</p>
                    </div>
                  </div>

                  {/* Question review */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Review</h3>
                    <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {questions.map((qq, i) => {
                        const a = answers[i];
                        const isCorrect = a?.chosen === qq.correct;
                        return (
                          <motion.div key={i}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`border rounded-xl p-3 text-xs flex flex-col gap-1 ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}
                          >
                            <p className="font-bold text-slate-100">{i + 1}. {qq.question}</p>
                            <p className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                              {isCorrect ? '✓' : '✗'} You answered: {a?.chosen} — {qq.options?.[a?.chosen] ?? '–'}
                            </p>
                            {!isCorrect && (
                              <p className="text-emerald-400">✓ Correct: {qq.correct} — {qq.options?.[qq.correct]}</p>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button type="button" onClick={retryQuiz}
                      className="flex-1 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold text-sm hover:bg-violet-500/30 transition-colors">
                      Try Again 🔄
                    </button>
                    <button type="button" onClick={resetToSetup}
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

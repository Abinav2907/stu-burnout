'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ─── Animated circular risk gauge ─── */
function RiskGauge({ score, riskLevel }) {
  const controls = useAnimation();
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colors = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444',
  };
  const color = colors[riskLevel] || colors.MEDIUM;

  useEffect(() => {
    controls.start({ strokeDashoffset, transition: { duration: 1.8, ease: 'easeInOut' } });
  }, [score, controls, strokeDashoffset]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
          {/* Progress */}
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={controls}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="text-4xl font-black text-white"
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 mt-1">Risk Score</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Confetti particles (LOW risk) ─── */
function Confetti() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    color: ['#10B981', '#7C3AED', '#3B82F6', '#F59E0B', '#EC4899'][Math.floor(Math.random() * 5)],
    size: 4 + Math.random() * 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 720 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{ position: 'absolute', top: 0, width: p.size, height: p.size, borderRadius: '2px', backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

/* ─── Form field wrapper with stagger ─── */
function FormField({ label, hint, children, index }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.05, type: 'spring', stiffness: 300, damping: 28 } },
      }}
      className="flex flex-col gap-1.5"
    >
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </motion.div>
  );
}

/* ─── Slider input ─── */
function SliderInput({ value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-2 appearance-none bg-slate-700 rounded-full outline-none cursor-pointer accent-violet-500"
      />
      <span className="w-14 text-right text-sm font-semibold text-violet-300 flex-shrink-0">
        {value}{unit}
      </span>
    </div>
  );
}

/* ─── Number input ─── */
function NumberInput({ value, onChange, min, max, step = 1, placeholder }) {
  return (
    <input
      type="number"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

/* ─── Select input ─── */
function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>
      ))}
    </select>
  );
}

/* ─── Steps config ─── */
const STEPS = [
  { title: 'Academic Info', icon: '🎓', desc: 'Your academic performance details' },
  { title: 'Lifestyle', icon: '🌙', desc: 'Daily habits and routines' },
  { title: 'Mental Health', icon: '🧠', desc: 'Stress and motivation levels' },
  { title: 'Review & Predict', icon: '🔮', desc: 'Confirm and get your risk score' },
];

const EXERCISE_OPTIONS = [
  { value: '0', label: 'Never' },
  { value: '1', label: '1-2 times/week' },
  { value: '3', label: '3-4 times/week' },
  { value: '5', label: '5+ times/week' },
];

const SOCIAL_OPTIONS = [
  { value: 'low', label: 'Low (mostly alone)' },
  { value: 'medium', label: 'Medium (some social time)' },
  { value: 'high', label: 'High (very social)' },
];

/* ─── Main page ─── */
export default function BurnoutPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [form, setForm] = useState({
    attendance: 75,
    gpa: 3.0,
    studyHours: 4,
    sleepHours: 7,
    exercise: '1',
    screenTime: 4,
    stressLevel: 5,
    motivationLevel: 6,
    socialActivity: 'medium',
  });

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const goNext = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };
  const goPrev = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const payload = {
        attendance: Number(form.attendance),
        gpa: Number(form.gpa),
        studyHours: Number(form.studyHours),
        sleepHours: Number(form.sleepHours),
        exercise: Number(form.exercise),
        screenTime: Number(form.screenTime),
        stressLevel: Number(form.stressLevel),
        motivationLevel: Number(form.motivationLevel),
        socialActivity: form.socialActivity,
      };
      const res = await axios.post(`${API_URL}/api/burnout/predict`, payload);
      const data = res.data;
      setResult(data);
      if (data.riskLevel === 'LOW') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } catch (err) {
      // Mock result for demo if API isn't up
      const mockScore = Math.round(
        ((10 - form.motivationLevel) * 8 + form.stressLevel * 9 + (100 - form.attendance) * 0.3) / 3
      );
      const mockLevel = mockScore < 35 ? 'LOW' : mockScore < 65 ? 'MEDIUM' : 'HIGH';
      const mockResult = {
        riskLevel: mockLevel,
        riskScore: Math.min(mockScore, 99),
        burnoutProbability: Math.min(mockScore + 5, 99),
        dropoutProbability: Math.max(mockScore - 15, 1),
        recommendations: [
          'Take 10-minute breaks every 45 minutes of study',
          'Aim for at least 7-8 hours of sleep nightly',
          'Incorporate 20 minutes of physical activity daily',
          'Practice mindfulness or meditation for stress relief',
          'Connect with peers or a counselor if feeling overwhelmed',
        ],
      };
      setResult(mockResult);
      if (mockLevel === 'LOW') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `PrepPilot Burnout Risk Report
=============================
Date: ${new Date().toLocaleDateString()}

RISK ASSESSMENT
---------------
Risk Level: ${result.riskLevel}
Risk Score: ${result.riskScore}%
Burnout Probability: ${result.burnoutProbability}%
Dropout Probability: ${result.dropoutProbability}%

INPUT DATA
----------
Attendance: ${form.attendance}%
GPA: ${form.gpa}
Study Hours/Day: ${form.studyHours}
Sleep Hours: ${form.sleepHours}
Exercise: ${form.exercise} times/week
Screen Time: ${form.screenTime} hours
Stress Level: ${form.stressLevel}/10
Motivation Level: ${form.motivationLevel}/10
Social Activity: ${form.socialActivity}

RECOMMENDATIONS
---------------
${result.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'burnout-risk-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  const riskColors = {
    LOW:    { text: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' },
    MEDIUM: { text: 'text-amber-400',   border: 'border-amber-500/50',   glow: 'shadow-amber-500/20',   bg: 'bg-amber-500/10',   badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' },
    HIGH:   { text: 'text-red-400',     border: 'border-red-500/50',     glow: 'shadow-red-500/20',     bg: 'bg-red-500/10',     badge: 'bg-red-500/20 text-red-300 border border-red-500/40' },
  };

  const rc = result ? (riskColors[result.riskLevel] || riskColors.MEDIUM) : null;

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-x-hidden">
      {showConfetti && <Confetti />}

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-800/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center py-10 px-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-violet-600/15 border border-violet-500/30 text-violet-300 text-sm"
          >
            <span>🔍</span>
            <span>Burnout Risk Predictor</span>
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-2">How are you really doing?</h1>
          <p className="text-slate-400 text-sm max-w-md">
            Answer a few questions about your academic life and we'll assess your burnout and dropout risk.
          </p>
        </div>

        {/* Progress Bar */}
        {!result && (
          <div className="w-full max-w-lg mb-8">
            <div className="flex justify-between mb-2">
              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  className={`flex flex-col items-center gap-1 cursor-pointer`}
                  onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
                >
                  <motion.div
                    animate={{
                      backgroundColor: i <= step ? '#7C3AED' : '#1e293b',
                      borderColor: i <= step ? '#7C3AED' : '#334155',
                      scale: i === step ? 1.15 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-base"
                  >
                    {i < step ? '✓' : s.icon}
                  </motion.div>
                  <span className={`text-xs hidden sm:block ${i === step ? 'text-violet-300' : 'text-slate-500'}`}>
                    {s.title}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full"
                animate={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                layoutId="progress"
              />
            </div>
          </div>
        )}

        {/* Form Card */}
        {!result ? (
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 0 && (
                <motion.div
                  key="step0"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
                >
                  <h2 className="text-lg font-bold text-white mb-1">{STEPS[0].icon} {STEPS[0].title}</h2>
                  <p className="text-sm text-slate-400 mb-6">{STEPS[0].desc}</p>
                  <motion.div
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                  >
                    <FormField label={`Attendance Rate — ${form.attendance}%`} hint="Your class attendance percentage" index={0}>
                      <SliderInput value={form.attendance} onChange={set('attendance')} min={0} max={100} unit="%" />
                    </FormField>
                    <FormField label="Current GPA" hint="On a 4.0 scale" index={1}>
                      <NumberInput value={form.gpa} onChange={set('gpa')} min={0} max={4} step={0.1} placeholder="e.g. 3.2" />
                    </FormField>
                    <FormField label={`Daily Study Hours — ${form.studyHours}h`} hint="Average hours you study per day" index={2}>
                      <SliderInput value={form.studyHours} onChange={set('studyHours')} min={0} max={16} unit="h" />
                    </FormField>
                  </motion.div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
                >
                  <h2 className="text-lg font-bold text-white mb-1">{STEPS[1].icon} {STEPS[1].title}</h2>
                  <p className="text-sm text-slate-400 mb-6">{STEPS[1].desc}</p>
                  <motion.div
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                  >
                    <FormField label={`Sleep Hours — ${form.sleepHours}h/night`} hint="Average hours of sleep per night" index={0}>
                      <SliderInput value={form.sleepHours} onChange={set('sleepHours')} min={2} max={12} unit="h" />
                    </FormField>
                    <FormField label="Exercise Frequency" hint="How often do you exercise?" index={1}>
                      <SelectInput value={form.exercise} onChange={set('exercise')} options={EXERCISE_OPTIONS} />
                    </FormField>
                    <FormField label={`Daily Screen Time — ${form.screenTime}h`} hint="Non-study screen time (social media, games, etc.)" index={2}>
                      <SliderInput value={form.screenTime} onChange={set('screenTime')} min={0} max={16} unit="h" />
                    </FormField>
                  </motion.div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
                >
                  <h2 className="text-lg font-bold text-white mb-1">{STEPS[2].icon} {STEPS[2].title}</h2>
                  <p className="text-sm text-slate-400 mb-6">{STEPS[2].desc}</p>
                  <motion.div
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                  >
                    <FormField label={`Stress Level — ${form.stressLevel}/10`} hint="1 = very calm, 10 = extremely stressed" index={0}>
                      <SliderInput value={form.stressLevel} onChange={set('stressLevel')} min={1} max={10} />
                    </FormField>
                    <FormField label={`Motivation Level — ${form.motivationLevel}/10`} hint="1 = very demotivated, 10 = highly motivated" index={1}>
                      <SliderInput value={form.motivationLevel} onChange={set('motivationLevel')} min={1} max={10} />
                    </FormField>
                    <FormField label="Social Activity" hint="How much time do you spend socializing?" index={2}>
                      <SelectInput value={form.socialActivity} onChange={set('socialActivity')} options={SOCIAL_OPTIONS} />
                    </FormField>
                  </motion.div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl"
                >
                  <h2 className="text-lg font-bold text-white mb-1">{STEPS[3].icon} {STEPS[3].title}</h2>
                  <p className="text-sm text-slate-400 mb-6">Everything looks good. Review your inputs and click Predict.</p>

                  <motion.div
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-2.5 mb-6"
                  >
                    {[
                      { label: 'Attendance', value: `${form.attendance}%` },
                      { label: 'GPA', value: form.gpa },
                      { label: 'Study Hours', value: `${form.studyHours}h/day` },
                      { label: 'Sleep', value: `${form.sleepHours}h/night` },
                      { label: 'Screen Time', value: `${form.screenTime}h/day` },
                      { label: 'Stress', value: `${form.stressLevel}/10` },
                      { label: 'Motivation', value: `${form.motivationLevel}/10` },
                      { label: 'Social Activity', value: form.socialActivity },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                        className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40"
                      >
                        <p className="text-xs text-slate-400">{item.label}</p>
                        <p className="text-sm font-bold text-white mt-0.5">{item.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.button
                    onClick={handlePredict}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-shadow flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <><span>🔮</span><span>Predict My Risk</span></>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <motion.button
                onClick={goPrev}
                disabled={step === 0}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-xl border border-slate-600/60 text-slate-300 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-500 transition-colors"
              >
                ← Back
              </motion.button>
              <span className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}</span>
              {step < STEPS.length - 1 && (
                <motion.button
                  onClick={goNext}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-5 py-2.5 rounded-xl bg-violet-600/80 border border-violet-500/50 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
                >
                  Next →
                </motion.button>
              )}
            </div>
          </div>
        ) : (
          /* ─── Results ─── */
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            className="w-full max-w-xl"
          >
            {/* Risk level badge */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border shadow-lg ${rc.badge} ${rc.glow}`}
              >
                {result.riskLevel === 'LOW' && '✅ LOW RISK — You\'re doing great!'}
                {result.riskLevel === 'MEDIUM' && '⚠️ MEDIUM RISK — Some concerns detected'}
                {result.riskLevel === 'HIGH' && '🚨 HIGH RISK — Immediate attention needed'}
              </motion.div>
            </div>

            {/* Gauge */}
            <div className="flex justify-center mb-6">
              <RiskGauge score={result.riskScore} riskLevel={result.riskLevel} />
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`grid grid-cols-2 gap-3 mb-5 p-5 rounded-2xl border ${rc.border} ${rc.bg} backdrop-blur-xl shadow-xl ${rc.glow}`}
            >
              {[
                { label: 'Burnout Probability', value: `${result.burnoutProbability}%` },
                { label: 'Dropout Probability', value: `${result.dropoutProbability}%` },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                  className="bg-slate-900/60 rounded-xl p-4 text-center"
                >
                  <p className={`text-2xl font-black ${rc.text}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-5 mb-5 backdrop-blur-xl shadow-xl"
              >
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span>💡</span> Personalized Recommendations
                </h3>
                <ul className="space-y-2.5">
                  {result.recommendations.map((rec, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 300, damping: 28 }}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <span className={`mt-0.5 font-bold ${rc.text} flex-shrink-0`}>{i + 1}.</span>
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex gap-3"
            >
              <motion.button
                onClick={() => { setResult(null); setStep(0); }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-xl border border-slate-600/60 text-slate-300 text-sm font-medium hover:border-slate-500 transition-colors"
              >
                🔄 Retake Assessment
              </motion.button>
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(124, 58, 237, 0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-500/25 transition-shadow"
              >
                📥 Download Report
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

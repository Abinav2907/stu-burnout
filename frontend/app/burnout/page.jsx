'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import RiskGauge from '@/components/RiskGauge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STEPS = [
  { title: 'Academic Info', icon: '🎓' },
  { title: 'Lifestyle', icon: '🌙' },
  { title: 'Mental Health', icon: '🧠' },
  { title: 'Review & Predict', icon: '🔮' },
];

function ConfettiBurst() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * 360,
    radius: Math.random() * 80 + 40,
    size: Math.random() * 6 + 4,
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-20">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const targetX = Math.cos(rad) * p.radius;
        const targetY = Math.sin(rad) * p.radius;

        return (
          <motion.div
            key={p.id}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 0],
              x: targetX,
              y: targetY,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: '#10B981', // green dots burst
            }}
          />
        );
      })}
    </div>
  );
}

export default function BurnoutPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [form, setForm] = useState({
    attendance: 85,
    gpa: 3.5,
    studyHours: 6,
    sleepHours: 7,
    exerciseDays: 3,
    screenTime: 4,
    stressLevel: 5,
    motivationLevel: 7,
    socialActivity: 6,
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/burnout/predict`, form);
      const data = res.data;
      setResult(data);
      if (data.riskLevel === 'LOW') {
        setShowConfetti(true);
      }
    } catch (err) {
      // Mock calculation for offline compatibility
      const compositeScore = Math.min(
        Math.max(
          Math.round(
            (100 - form.attendance) * 0.3 +
              (10 - form.gpa) * 4 +
              form.stressLevel * 4.5 +
              (10 - form.motivationLevel) * 3.5 +
              form.screenTime * 1.5 -
              form.sleepHours * 1.5 -
              form.exerciseDays * 1
          ),
          5
        ),
        98
      );
      const mockResult = {
        riskScore: compositeScore,
        riskLevel: compositeScore < 35 ? 'LOW' : compositeScore < 70 ? 'MEDIUM' : 'HIGH',
        recommendations: [
          'Take regular breaks using Pomodoro intervals',
          'Aim to increase daily sleep average to 7.5+ hours',
          'Introduce a walk or exercise session to disperse cortisol buildup',
        ],
      };
      setResult(mockResult);
      if (mockResult.riskLevel === 'LOW') {
        setShowConfetti(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    enter: (dir) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  };

  const stressEmoji = (level) => {
    if (level <= 3) return '😊';
    if (level <= 6) return '😐';
    if (level <= 8) return '😰';
    return '🤯';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 max-w-xl mx-auto w-full relative">
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-black text-white">Burnout Risk Predictor</h1>
          <p className="text-sm text-slate-400 mt-1">Determine cognitive fatigue & dropout markers.</p>
        </div>

        {/* Progress Bar */}
        {!result && (
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-8 relative">
            <motion.div
              layoutId="progressBarIndicator"
              className="absolute top-0 bottom-0 left-0 bg-[#7C3AED]"
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            />
          </div>
        )}

        {/* Steps Container */}
        <div className="w-full relative min-h-[380px]">
          <AnimatePresence mode="wait" custom={direction}>
            {!result ? (
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6"
              >
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-xl">{STEPS[currentStep].icon}</span>
                  <h2 className="text-base font-bold text-white">{STEPS[currentStep].title}</h2>
                </div>

                {/* Step 1: Academic */}
                {currentStep === 0 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Attendance Rate</span>
                        <span className="text-[#7C3AED] font-bold">{form.attendance}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={form.attendance}
                        onChange={(e) => updateField('attendance', Number(e.target.value))}
                        className="w-full accent-[#7C3AED]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Current GPA</span>
                        <span className="text-[#06B6D4] font-bold">{form.gpa}</span>
                      </div>
                      <input
                        type="range" min="0" max="10" step="0.1" value={form.gpa}
                        onChange={(e) => updateField('gpa', Number(e.target.value))}
                        className="w-full accent-[#06B6D4]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Daily Study Hours</span>
                        <span className="text-[#10B981] font-bold">{form.studyHours} hrs</span>
                      </div>
                      <input
                        type="range" min="0" max="12" value={form.studyHours}
                        onChange={(e) => updateField('studyHours', Number(e.target.value))}
                        className="w-full accent-[#10B981]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Lifestyle */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Sleep duration</span>
                        <span className="text-violet-300 font-bold">{form.sleepHours} hrs/night</span>
                      </div>
                      <input
                        type="range" min="4" max="12" value={form.sleepHours}
                        onChange={(e) => updateField('sleepHours', Number(e.target.value))}
                        className="w-full accent-[#7C3AED]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-400">Exercise frequency (days/week)</span>
                      <div className="flex gap-2 justify-between">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <button
                            key={day}
                            onClick={() => updateField('exerciseDays', day)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                              form.exerciseDays === day
                                ? 'bg-[#06B6D4] text-black border-[#06B6D4]'
                                : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/10'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Screen Time</span>
                        <span className="text-emerald-300 font-bold">{form.screenTime} hrs/day</span>
                      </div>
                      <input
                        type="range" min="0" max="16" value={form.screenTime}
                        onChange={(e) => updateField('screenTime', Number(e.target.value))}
                        className="w-full accent-[#10B981]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Mental Health */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Stress level {stressEmoji(form.stressLevel)}</span>
                        <span className="text-[#EF4444] font-bold">{form.stressLevel}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10" value={form.stressLevel}
                        onChange={(e) => updateField('stressLevel', Number(e.target.value))}
                        className="w-full accent-[#EF4444]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Motivation level</span>
                        <span className="text-[#F59E0B] font-bold">{form.motivationLevel}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10" value={form.motivationLevel}
                        onChange={(e) => updateField('motivationLevel', Number(e.target.value))}
                        className="w-full accent-[#F59E0B]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Social activity level</span>
                        <span className="text-cyan-300 font-bold">{form.socialActivity}/10</span>
                      </div>
                      <input
                        type="range" min="1" max="10" value={form.socialActivity}
                        onChange={(e) => updateField('socialActivity', Number(e.target.value))}
                        className="w-full accent-[#06B6D4]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { name: 'Attendance', val: `${form.attendance}%` },
                        { name: 'GPA', val: form.gpa },
                        { name: 'Study', val: `${form.studyHours}h` },
                        { name: 'Sleep', val: `${form.sleepHours}h` },
                        { name: 'Exercise', val: `${form.exerciseDays}d` },
                        { name: 'Screen', val: `${form.screenTime}h` },
                        { name: 'Stress', val: `${form.stressLevel}/10` },
                        { name: 'Motivation', val: `${form.motivationLevel}/10` },
                        { name: 'Social', val: `${form.socialActivity}/10` },
                      ].map((item) => (
                        <div key={item.name} className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">{item.name}</span>
                          <span className="text-xs font-black text-slate-200 mt-1 block">{item.val}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      onClick={handlePredict}
                      disabled={isLoading}
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                    >
                      {isLoading ? 'Processing Prediction...' : 'Analyze My Risk 🔮'}
                    </motion.button>
                  </div>
                )}

                {/* Footer Nav */}
                <div className="flex justify-between border-t border-white/5 pt-4">
                  <button
                    disabled={currentStep === 0}
                    onClick={handlePrev}
                    className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {currentStep < STEPS.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-violet-600 transition-colors text-xs font-semibold text-white"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Results Mode */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6 relative"
              >
                {showConfetti && <ConfettiBurst />}

                <div className="flex flex-col items-center gap-2">
                  <RiskGauge
                    score={result.riskScore}
                    color={
                      result.riskLevel === 'LOW'
                        ? '#10B981'
                        : result.riskLevel === 'MEDIUM'
                        ? '#F59E0B'
                        : '#EF4444'
                    }
                  />

                  {/* Level Badge */}
                  <div
                    className={`mt-4 px-4 py-1.5 rounded-full text-xs font-black border tracking-wider shadow-lg ${
                      result.riskLevel === 'LOW'
                        ? 'bg-emerald-500/20 text-[#10B981] border-emerald-500/30 shadow-emerald-500/10'
                        : result.riskLevel === 'MEDIUM'
                        ? 'bg-amber-500/20 text-[#F59E0B] border-amber-500/30 shadow-amber-500/10'
                        : 'bg-red-500/20 text-[#EF4444] border-red-500/30 shadow-red-500/10'
                    }`}
                  >
                    {result.riskLevel} BURNOUT RISK
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Actions</p>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2.5 text-xs text-slate-300"
                      >
                        <span className="text-[#10B981] font-bold">✓</span>
                        <span>{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setResult(null);
                    setCurrentStep(0);
                    setShowConfetti(false);
                  }}
                  className="w-full py-3 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors"
                >
                  🔄 Retake Predictor
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

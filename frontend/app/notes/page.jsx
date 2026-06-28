'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Sidebar, MobileSidebar } from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DETAIL_LEVELS = ['Brief', 'Detailed', 'Comprehensive'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};

export default function NotesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [detailLevel, setDetailLevel] = useState('Detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(null);   // holds the notes object directly
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim() || !topic.trim()) return;
    setIsLoading(true);
    setNotes(null);
    try {
      const res = await axios.post(`${API_URL}/api/notes/generate`, {
        subject,
        topic,
        detailLevel,
        userId: 'student_001'
      });
      // Backend returns { success, notes: {...} } OR { success, ...fields } 
      const data = res.data?.notes ?? res.data;
      setNotes(data);
    } catch {
      // Local fallback — always renders
      setNotes({
        title: `${topic} — Complete Study Guide`,
        summary: `${topic} is a core concept within ${subject}. Mastering this topic involves understanding its foundational principles, practical applications, and common exam patterns. This ${detailLevel.toLowerCase()} guide covers all key areas systematically.`,
        keyPoints: [
          `${topic} forms the foundation of many advanced topics in ${subject}.`,
          'Understanding underlying principles is more valuable than memorising formulas.',
          'Practice with past exam questions to solidify your understanding.',
          'Connect this concept to real-world applications to aid long-term memory.',
          'Spaced repetition (1 day → 3 days → 7 days) outperforms cramming.',
        ],
        detailedNotes: [
          {
            section: 'Core Concepts',
            content: `The fundamental idea behind ${topic} involves key definitions, relationships between variables, and the underlying rules that govern its behaviour in ${subject}.`,
            example: `Consider a standard textbook problem where ${topic} is applied step-by-step to derive a result.`,
          },
          {
            section: 'Applications & Importance',
            content: `${topic} is widely applied in engineering, science, and everyday problem-solving. Its importance in ${subject} makes it a high-priority topic for board and competitive exams.`,
            example: `Real-world scenario: industries use ${topic} to optimise processes, reduce costs, and improve accuracy.`,
          },
        ],
        practiceQuestions: [
          { question: `Define ${topic} and state its significance in ${subject}.`, answer: `${topic} refers to a fundamental concept underpinning many principles in ${subject}.` },
          { question: `What are the main properties of ${topic}?`, answer: 'The main properties relate to scope, scale, and applicability within the subject domain.' },
          { question: `Give a real-world example of ${topic}.`, answer: `${topic} appears in systems such as manufacturing, computing, or natural phenomena depending on context.` },
        ],
        quickRevision: [
          `${topic} = core concept of ${subject}`,
          'Always define terms before solving problems.',
          'Use diagrams and examples to aid memory.',
          'Connect theory to practical applications.',
          'Revise at intervals: 1 day, 3 days, 7 days, 30 days.',
        ],
        formulasOrDates: [
          'Refer to your textbook for specific formulas applicable to this topic.',
          'Key dates and historical context are in the introduction chapters.',
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!notes) return;
    const kp = Array.isArray(notes.keyPoints) ? notes.keyPoints.map((k) => `- ${k}`).join('\n') : '';
    const text = `${notes.title}\n\nSUMMARY:\n${notes.summary}\n\nKEY POINTS:\n${kp}`;
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notes) return;
    const kp = Array.isArray(notes.keyPoints) ? notes.keyPoints.map((k, i) => `${i + 1}. ${k}`).join('\n') : '';
    const dn = Array.isArray(notes.detailedNotes)
      ? notes.detailedNotes.map((s) => `${s.section}\n${s.content}\nExample: ${s.example}`).join('\n\n')
      : notes.detailedNotes || '';
    const pq = Array.isArray(notes.practiceQuestions)
      ? notes.practiceQuestions.map((q, i) => `Q${i + 1}: ${typeof q === 'object' ? q.question : q}\nA: ${typeof q === 'object' ? q.answer : ''}`).join('\n\n')
      : '';
    const content = `${notes.title}\nSubject: ${subject} | Detail: ${detailLevel}\n${'='.repeat(50)}\n\nSUMMARY:\n${notes.summary}\n\nKEY POINTS:\n${kp}\n\nDETAILED NOTES:\n${dn}\n\nPRACTICE QUESTIONS:\n${pq}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left Input Panel ── */}
          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-5 h-fit">
            <div>
              <h1 className="text-3xl font-black text-white">Study Notes</h1>
              <p className="text-sm text-slate-400 mt-1">Generate structured revision guides instantly.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</label>
              <input
                type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
                className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/70 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topic</label>
              <input
                type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Bubble Sort, Mitochondria"
                className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/70 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detail Level</label>
              <div className="flex gap-2">
                {DETAIL_LEVELS.map((l) => (
                  <button key={l} onClick={() => setDetailLevel(l)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      detailLevel === l
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED]/50 text-[#7C3AED]'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={handleGenerate}
              disabled={isLoading || !subject || !topic}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Generating…</span></>
              ) : 'Generate Notes 📝'}
            </motion.button>
          </div>

          {/* ── Right Output ── */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {notes ? (
                <motion.div
                  key="notes"
                  variants={containerVariants} initial="hidden" animate="show"
                  className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                    <motion.h2 variants={itemVariants} className="text-2xl font-black text-white">{notes.title}</motion.h2>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors">
                        {copied ? '✓ Copied' : 'Copy'}
                      </button>
                      <button onClick={handleDownload}
                        className="px-3 py-1.5 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-xs font-bold text-violet-300 hover:bg-[#7C3AED]/30 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Summary</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{notes.summary}</p>
                  </motion.div>

                  {/* Key Points */}
                  {Array.isArray(notes.keyPoints) && notes.keyPoints.length > 0 && (
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Concepts</span>
                      <ul className="space-y-1.5">
                        {notes.keyPoints.map((kp, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-[#06B6D4] mt-0.5">•</span><span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Detailed Notes */}
                  {Array.isArray(notes.detailedNotes) ? (
                    <motion.div variants={itemVariants} className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detailed Notes</span>
                      {notes.detailedNotes.map((section, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                          <p className="text-sm font-bold text-white mb-1">{section.section}</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{section.content}</p>
                          {section.example && (
                            <p className="text-xs text-[#06B6D4] mt-2 italic">📌 {section.example}</p>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  ) : notes.detailedNotes ? (
                    <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detailed Notes</span>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{notes.detailedNotes}</p>
                    </motion.div>
                  ) : null}

                  {/* Quick Revision */}
                  {Array.isArray(notes.quickRevision) && notes.quickRevision.length > 0 && (
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">⚡ Quick Revision</span>
                      <div className="flex flex-wrap gap-2">
                        {notes.quickRevision.map((fact, i) => (
                          <span key={i} className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300">{fact}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Formulas */}
                  {Array.isArray(notes.formulasOrDates) && notes.formulasOrDates.length > 0 && (
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">📐 Formulas & Key Dates</span>
                      <ul className="space-y-1">
                        {notes.formulasOrDates.map((f, i) => (
                          <li key={i} className="text-xs text-amber-300 font-mono bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-1.5">{f}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Practice Questions */}
                  {Array.isArray(notes.practiceQuestions) && notes.practiceQuestions.length > 0 && (
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Practice Questions</span>
                      <div className="space-y-3">
                        {notes.practiceQuestions.map((q, i) => {
                          const qText = typeof q === 'object' ? q.question : q;
                          const aText = typeof q === 'object' ? q.answer : null;
                          return (
                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                              <p className="text-xs font-bold text-slate-200">Q{i + 1}: {qText}</p>
                              {aText && <p className="text-xs text-slate-400 mt-1">→ {aText}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-center text-slate-500">
                  <span className="text-4xl mb-3">📝</span>
                  <p className="text-sm">Enter a subject and topic on the left to generate your study notes.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

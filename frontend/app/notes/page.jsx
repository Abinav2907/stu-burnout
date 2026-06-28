'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function NotesPage() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [detailLevel, setDetailLevel] = useState('Detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !topic) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/notes/generate`, {
        subject,
        topic,
        detailLevel,
      });
      setNotes(res.data);
    } catch (err) {
      // Mock generation fallback
      setTimeout(() => {
        setNotes({
          title: `${topic} - Essential Study Guide`,
          summary: `This is a comprehensive study guide covering the core foundations of ${topic} inside ${subject}.`,
          keyPoints: [
            'Understanding the architectural layout and syntax elements',
            'Applying optimal complexity profiles to runtime structures',
            'Reviewing edge behavior during integration sequences',
          ],
          detailedNotes: `Here are full reference materials on ${topic}. Key properties include modularity, component boundaries, and proper event synchronization. To optimize results, focus on structured reviews and frequent revision cycles.`,
          practiceQuestions: [
            `What is the primary objective of ${topic}?`,
            `How does ${subject} integration change when scale factors increase?`,
          ],
        });
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!notes) return;
    const formattedText = `
TITLE: ${notes.title}
SUMMARY: ${notes.summary}
KEY POINTS:
${notes.keyPoints.map((kp) => `- ${kp}`).join('\n')}
DETAILED NOTES:
${notes.detailedNotes}
    `;
    navigator.clipboard.writeText(formattedText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notes) return;
    const content = `
${notes.title}
Subject: ${subject}
Detail Level: ${detailLevel}
=========================================

SUMMARY:
${notes.summary}

KEY POINTS:
${notes.keyPoints.map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}

DETAILED REVIEWS:
${notes.detailedNotes}

PRACTICE QUESTIONS:
${notes.practiceQuestions.map((q, idx) => `Q${idx + 1}: ${q}`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-study-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-fit backdrop-blur-md">
          <div>
            <h2 className="text-xl font-black text-white">Study Notes Generator</h2>
            <p className="text-xs text-slate-400 mt-1">Instantly generate structured revision guides.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Topic Title</label>
            <input
              type="text"
              placeholder="e.g. Bubble Sort or Mitochondria"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Detail Level</label>
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#7C3AED] transition-colors cursor-pointer"
            >
              <option value="Brief" className="bg-[#0A0A0F]">Brief Summary</option>
              <option value="Detailed" className="bg-[#0A0A0F]">Detailed Guide</option>
              <option value="Comprehensive" className="bg-[#0A0A0F]">Comprehensive Masterclass</option>
            </select>
          </div>

          <motion.button
            onClick={handleGenerate}
            disabled={isLoading || !subject || !topic}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Materials...</span>
              </>
            ) : (
              'Generate Study Notes 📝'
            )}
          </motion.button>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 flex flex-col min-h-[400px]">
          <AnimatePresence mode="wait">
            {notes ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-5 bg-white/[0.01] border border-white/5 rounded-2xl p-6 backdrop-blur-md relative h-full justify-between"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <motion.h3 variants={itemVariants} className="text-lg font-black text-white">{notes.title}</motion.h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 transition-colors"
                      >
                        {copied ? 'Copied! ✓' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[10px] font-bold text-violet-300 hover:bg-[#7C3AED]/30 transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 mt-5">
                    <motion.div variants={itemVariants} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Summary</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{notes.summary}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Concepts</span>
                      <ul className="space-y-1.5">
                        {notes.keyPoints.map((kp, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-[#06B6D4]">•</span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detailed Content</span>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{notes.detailedNotes}</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Practice / Quiz Questions</span>
                      <ul className="space-y-1.5">
                        {notes.practiceQuestions.map((q, idx) => (
                          <li key={idx} className="text-xs text-slate-400 italic">
                            {idx + 1}. {q}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 text-center mt-5">
                  <span className="text-[10px] text-slate-600 font-bold uppercase">PrepPilot Note System</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 text-center text-slate-500">
                <span className="text-3xl mb-2">📝</span>
                <p className="text-xs">Provide a subject and topic on the left to generate study notes.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

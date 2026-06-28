'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import TimetableCard from '@/components/TimetableCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Welcome to PrepPilot AI! 🤖 I'm here to act as your study assistant. Ask me questions, generate timetables, or review study plans. Try using the quick actions in the sidebar to get started immediately!",
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [rotating, setRotating] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput('');
    // Trigger button rotation
    setRotating(true);
    setTimeout(() => setRotating(false), 500);

    const userMsg = { id: Math.random().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Save initial session info if empty
    if (!activeChatId) {
      const newId = Math.random().toString();
      setActiveChatId(newId);
      setChatHistory((prev) => [{ id: newId, title: text.slice(0, 24) }, ...prev]);
    }

    try {
      const res = await axios.post(`${API_URL}/api/chatbot/message`, {
        message: text,
        chatHistory: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      });

      const reply = res.data?.reply || 'Sorry, my server is offline. Try setting up your API key!';
      setMessages((prev) => [...prev, { id: Math.random().toString(), role: 'assistant', content: reply }]);

      // Check if response contains timetable JSON/markdown to render timetable grid
      if (reply.toLowerCase().includes('timetable') || reply.toLowerCase().includes('monday')) {
        // Parse a mock timetable for demo
        setTimetable([
          { day: 'Monday', subject: 'Mathematics', time: '09:00 AM', duration: '2 hours' },
          { day: 'Tuesday', subject: 'Science', time: '11:00 AM', duration: '1.5 hours' },
          { day: 'Wednesday', subject: 'English', time: '02:00 PM', duration: '1 hour' },
          { day: 'Thursday', subject: 'History', time: '10:00 AM', duration: '2 hours' },
          { day: 'Friday', subject: 'Mathematics', time: '01:00 PM', duration: '1.5 hours' },
        ]);
      }
    } catch (err) {
      // Mock study assistance response
      setTimeout(() => {
        let reply = `Here is a custom plan to help you with: "${text}". Make sure to study 45 minutes and take a 5-minute break!`;
        if (text.toLowerCase().includes('timetable')) {
          reply = 'Here is your custom weekly study timetable:';
          setTimetable([
            { day: 'Monday', subject: 'Mathematics', time: '09:00 AM', duration: '2 hours' },
            { day: 'Tuesday', subject: 'Science', time: '11:00 AM', duration: '1.5 hours' },
            { day: 'Wednesday', subject: 'English', time: '02:00 PM', duration: '1 hour' },
            { day: 'Thursday', subject: 'History', time: '10:00 AM', duration: '2 hours' },
            { day: 'Friday', subject: 'Mathematics', time: '01:00 PM', duration: '1.5 hours' },
          ]);
        }
        setMessages((prev) => [...prev, { id: Math.random().toString(), role: 'assistant', content: reply }]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setActiveChatId(null);
    setTimetable(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <ChatSidebar
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setMessages([WELCOME_MESSAGE, { id: 'm1', role: 'user', content: 'Help me study' }, { id: 'm2', role: 'assistant', content: 'Sure, what topic?' }]);
          }}
          onNewChat={handleNewChat}
          onQuickAction={handleSend}
        />
        
        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-73px)] bg-[#0A0A0F]/20 relative">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg.content} isUser={msg.role === 'user'} />
            ))}
            
            {isLoading && <TypingIndicator />}

            {/* Timetable Card Display */}
            {timetable && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
              >
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Generated Weekly Timetable</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {timetable.map((t, idx) => (
                    <TimetableCard key={idx} day={t.day} subject={t.subject} time={t.time} duration={t.duration} index={idx} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-4 border-t border-white/5 bg-[#0A0A0F]/45 backdrop-blur-md">
            <div className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your study question or generate a timetable..."
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]/70 focus:ring-2 focus:ring-[#7C3AED]/10 transition-all"
              />
              <motion.button
                onClick={() => handleSend()}
                animate={rotating ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-violet-700 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                🚀
              </motion.button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

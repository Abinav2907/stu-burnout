'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import TimetableCard from '@/components/TimetableCard';
import ChatSidebar from '@/components/ChatSidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm PrepPilot AI 👋 Your personal study companion. I can help you:\n\n📅 **Generate a custom timetable** based on your subjects\n📚 **Explain difficult concepts** in any subject\n🎯 **Create an exam prep plan** tailored to you\n\nWhat would you like to work on today?",
  timestamp: new Date().toISOString(),
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function parseTimetableFromResponse(text) {
  // Simple heuristic: if response contains structured day/time/subject data, parse it
  const lines = text.split('\n');
  const timetable = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  lines.forEach(line => {
    const dayMatch = days.find(d => line.toLowerCase().includes(d.toLowerCase()));
    const timeMatch = line.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)/i) || line.match(/\d{1,2}\s*(AM|PM|am|pm)/i);
    const durationMatch = line.match(/(\d+)\s*(hr|hour|min|minute)/i);
    
    if (dayMatch && (timeMatch || line.includes(':'))) {
      const subjectMatch = line.match(/[-–]\s*([A-Za-z\s]+?)(\s*[-–(]|\s*\d|$)/);
      timetable.push({
        day: dayMatch,
        time: timeMatch ? timeMatch[0] : 'Flexible',
        subject: subjectMatch ? subjectMatch[1].trim() : 'Study Session',
        duration: durationMatch ? durationMatch[0] : '1 hr',
      });
    }
  });
  
  return timetable.length >= 3 ? timetable : null;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typewriterRef = useRef(null);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prepilot_chats');
      if (stored) setChatHistory(JSON.parse(stored));
    } catch {}
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const typewriterEffect = useCallback((text, onDone) => {
    let i = 0;
    setDisplayedResponse('');
    
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    
    typewriterRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedResponse(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(typewriterRef.current);
        onDone?.(text);
      }
    }, 18);
  }, []);

  const sendMessage = useCallback(async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg = { id: generateId(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_URL}/api/chatbot/message`, {
        message: text,
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      });

      const responseText = res.data?.reply || res.data?.message || 'Sorry, I could not understand that. Please try again.';
      setIsTyping(false);

      // Add streaming AI message
      const aiMsgId = generateId();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      }]);

      typewriterEffect(responseText, (fullText) => {
        // Finalize message
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: fullText, isStreaming: false } : m
        ));
        setDisplayedResponse('');

        // Try to parse timetable
        const parsed = parseTimetableFromResponse(fullText);
        if (parsed) setTimetable(parsed);

        // Save to localStorage
        const newHistory = [...chatHistory, { id: generateId(), title: text.slice(0, 30), messages }];
        setChatHistory(newHistory);
        try { localStorage.setItem('prepilot_chats', JSON.stringify(newHistory.slice(-20))); } catch {}
      });
    } catch (err) {
      setIsTyping(false);
      const errMsg = {
        id: generateId(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your connection and try again. 🔌",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, chatHistory, typewriterEffect]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setActiveChatId(null);
    setTimetable(null);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex h-screen bg-[#0F172A] overflow-hidden"
    >
      {/* Sidebar */}
      <ChatSidebar
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onQuickAction={sendMessage}
        timetable={timetable}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-800/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-white font-semibold">AI Study Assistant</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
              Powered by Gemini
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{messages.length - 1} messages</span>
          </div>
        </motion.header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-0 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              if (msg.isStreaming) {
                return (
                  <ChatMessage
                    key={msg.id}
                    message={displayedResponse}
                    isUser={false}
                  />
                );
              }
              return (
                <ChatMessage
                  key={msg.id}
                  message={msg.content}
                  isUser={msg.role === 'user'}
                />
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>

          {/* Timetable cards */}
          <AnimatePresence>
            {timetable && timetable.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>📅</span> Generated Timetable
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {timetable.map((item, i) => (
                    <TimetableCard
                      key={i}
                      index={i}
                      day={item.day}
                      subject={item.subject}
                      time={item.time}
                      duration={item.duration}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-shrink-0 px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-xl z-10"
        >
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything — study tips, timetables, subject doubts..."
                rows={1}
                style={{ resize: 'none' }}
                className="w-full bg-slate-800/80 border border-slate-600/50 rounded-2xl px-4 py-3.5 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 transition-all duration-200 backdrop-blur-sm min-h-[52px] max-h-36 overflow-y-auto"
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px';
                }}
              />
              {/* Voice icon */}
              <button className="absolute right-3 bottom-3.5 text-slate-500 hover:text-violet-400 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </button>
            </div>

            {/* Send Button */}
            <motion.button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              animate={isLoading ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={isLoading ? { repeat: Infinity, duration: 1 } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-violet-500/50 transition-shadow duration-200"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white -rotate-45 translate-x-0.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </motion.button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-2">
            PrepPilot AI · Press Enter to send, Shift+Enter for new line
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

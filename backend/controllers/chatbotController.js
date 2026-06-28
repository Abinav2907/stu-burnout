/*
 * Supabase SQL — run this in your Supabase SQL editor before using this endpoint:
 *
 * CREATE TABLE IF NOT EXISTS chat_history (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id text NOT NULL,
 *   role text NOT NULL CHECK (role IN ('user','assistant')),
 *   content text NOT NULL,
 *   created_at timestamptz DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON chat_history(user_id);
 */

const { createClient } = require('@supabase/supabase-js');
const { callAI } = require('../utils/aiHelper');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const SYSTEM_PROMPT = `You are PrepPilot AI, a friendly and encouraging academic assistant for college students in India.

You help with:
1. Personalized weekly study timetables
2. Explaining tough concepts in simple terms  
3. Exam strategies and revision plans
4. Stress management and motivation

When the user asks for a timetable or schedule, include it wrapped EXACTLY like this (valid JSON inside):
TIMETABLE_START
{
  "timetable": [
    {
      "day": "Monday",
      "slots": [
        { "time": "9:00 AM - 11:00 AM", "subject": "Mathematics", "topic": "Integration", "color": "#7C3AED" },
        { "time": "2:00 PM - 4:00 PM", "subject": "Physics", "topic": "Waves", "color": "#06B6D4" }
      ]
    }
  ]
}
TIMETABLE_END

For all other responses, use friendly markdown with relevant emojis. Keep responses helpful, concise, and encouraging. Address the student warmly.`;

exports.sendMessage = async (req, res) => {
  const { userId = 'anonymous', message, chatHistory = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  // Build messages array (keep last 10 for context window)
  const recentHistory = chatHistory.slice(-10);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  // Gemini fallback prompt (stringify everything)
  const fallbackPrompt =
    SYSTEM_PROMPT +
    '\n\nConversation so far:\n' +
    recentHistory.map((m) => `${m.role}: ${m.content}`).join('\n') +
    `\n\nUser: ${message}\n\nAssistant:`;

  try {
    const { text, model } = await callAI(messages, fallbackPrompt);

    // Parse timetable if present
    let timetable = null;
    let reply = text;

    const tStart = text.indexOf('TIMETABLE_START');
    const tEnd = text.indexOf('TIMETABLE_END');
    if (tStart !== -1 && tEnd !== -1) {
      try {
        const jsonStr = text.slice(tStart + 'TIMETABLE_START'.length, tEnd).trim();
        timetable = JSON.parse(jsonStr);
        // Remove timetable block from display reply
        reply = (text.slice(0, tStart) + text.slice(tEnd + 'TIMETABLE_END'.length)).trim();
        if (!reply) reply = '📅 Here is your personalised study timetable!';
      } catch {
        // If JSON parse fails, keep full text
      }
    }

    // Save to Supabase (best-effort — don't fail the request if DB is down)
    try {
      await supabase.from('chat_history').insert([
        { user_id: userId, role: 'user',      content: message },
        { user_id: userId, role: 'assistant', content: reply   },
      ]);
    } catch (dbErr) {
      console.warn('Supabase chat save skipped:', dbErr.message);
    }

    return res.json({ success: true, reply, timetable, modelUsed: model });
  } catch (err) {
    console.error('Chatbot error:', err);
    return res.status(500).json({ success: false, error: 'AI service unavailable. Please try again.' });
  }
};

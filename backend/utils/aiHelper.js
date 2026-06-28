const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * callAI: Try Groq first, fall back to Gemini.
 * @param {string|Array} prompt  - string for Gemini, array of {role,content} for Groq
 * @param {Array} messages       - full messages array (used for Groq)
 * @returns {{ text: string, model: string }}
 */
async function callAI(messages, fallbackPrompt) {
  // Try Groq first
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
    });
    console.log('✅ Groq used');
    return { text: res.choices[0].message.content, model: 'groq' };
  } catch (err) {
    console.warn('⚠️  Groq failed, switching to Gemini:', err.message);
  }

  // Gemini fallback
  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: fallbackPrompt,
  });
  console.log('✅ Gemini used');
  return { text: res.text, model: 'gemini' };
}

module.exports = { callAI };

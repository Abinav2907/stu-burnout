const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");

exports.handleMessage = async (req, res) => {
  const { message, chatHistory = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  // Format message history
  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Append new user message
  formattedHistory.push({
    role: 'user',
    parts: [{ text: message }],
  });

  // Try Gemini 2.0 first
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: formattedHistory,
      });

      return res.json({ reply: response.text });
    } catch (err) {
      console.warn('Gemini API failed, falling back to Groq Llama:', err.message);
    }
  }

  // Fallback to Groq Llama
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const groqHistory = chatHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
      groqHistory.push({ role: 'user', content: message });

      const chatCompletion = await groq.chat.completions.create({
        messages: groqHistory,
        model: 'llama-3.3-70b-specdec',
      });

      return res.json({ reply: chatCompletion.choices[0].message.content });
    } catch (err) {
      console.error('Groq Fallback also failed:', err.message);
    }
  }

  // Off-grid reply if no keys are found
  return res.json({
    reply: "I'm PrepPilot AI, currently running in local offline demo mode. Please set up GEMINI_API_KEY or GROQ_API_KEY to start conversing with real models!",
  });
};

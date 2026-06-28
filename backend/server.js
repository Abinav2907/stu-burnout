require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'PrepPilot Backend API is running 🚀', version: '2.0.0' });
});

// Routes
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/burnout', require('./routes/burnout'));
app.use('/api/notes',   require('./routes/notes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PrepPilot Backend running at http://localhost:${PORT}`);
  console.log(`   Groq key:   ${process.env.GROQ_API_KEY   ? '✅ set' : '❌ missing'}`);
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? '✅ set' : '❌ missing'}`);
  console.log(`   Supabase:   ${process.env.SUPABASE_URL   ? '✅ set' : '❌ missing'}\n`);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const chatbotRouter = require('./routes/chatbot');
const burnoutRouter = require('./routes/burnout');
const notesRouter = require('./routes/notes');

app.use('/api/chatbot', chatbotRouter);
app.use('/api/burnout', burnoutRouter);
app.use('/api/notes', notesRouter);

app.get('/', (req, res) => {
  res.send('PrepPilot Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

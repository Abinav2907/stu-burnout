import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// AI Chatbot
export const sendChatMessage = (message, history = []) =>
  api.post('/api/chatbot/message', { message, history });

// Burnout Predictor
export const predictBurnout = (data) =>
  api.post('/api/burnout/predict', data);

export default api;

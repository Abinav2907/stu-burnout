/*
 * Supabase SQL — run in your Supabase SQL editor:
 *
 * CREATE TABLE IF NOT EXISTS quiz_results (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id text NOT NULL,
 *   subject text,
 *   topic text,
 *   score int,
 *   total_questions int,
 *   percentage int,
 *   difficulty text,
 *   created_at timestamptz DEFAULT now()
 * );
 */

const { createClient } = require('@supabase/supabase-js');
const { callAI } = require('../utils/aiHelper');

const supabase = createClient(
  process.env.SUPABASE_URL  || '',
  process.env.SUPABASE_KEY  || ''
);

exports.generateQuiz = async (req, res) => {
  const { subject, topic, difficulty = 'Medium', count = 5 } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ success: false, error: 'Subject and topic are required.' });
  }

  const prompt = `You are an expert teacher creating a multiple choice quiz for a college student.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Number of Questions: ${count}

Difficulty guidelines:
- Easy: basic definitions, simple recall, fundamental concepts
- Medium: application of concepts, problem solving, comparisons
- Hard: analysis, synthesis, edge cases, advanced problem solving

Return ONLY valid JSON with NO extra text or markdown fences:
{
  "questions": [
    {
      "id": 1,
      "question": "Clear question text here?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correct": "A",
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}

Rules:
- All 4 options must be plausible (no obviously wrong answers)
- Questions must match exactly the difficulty level
- Cover different aspects of the topic across questions
- No repeated questions
- Correct answer should be evenly distributed (not always A or B)
- Explanations must be educational and clear`;

  const messages = [
    { role: 'system', content: 'You are an expert teacher. Return only valid JSON quiz questions.' },
    { role: 'user',   content: prompt },
  ];

  try {
    const { text } = await callAI(messages, prompt);
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    
    let questionsList = parsed.questions || parsed;
    if (!Array.isArray(questionsList)) {
      if (typeof questionsList === 'object' && questionsList !== null) {
        questionsList = Object.values(questionsList);
      } else {
        throw new Error('Parsed response does not contain questions list');
      }
    }

    const normalized = questionsList.map((q, idx) => {
      const questionText = q.question || q.text || `Question ${idx + 1}`;
      
      let rawOpts = q.options || q.choices || q.answers || {};
      let optionsObj = {};

      if (Array.isArray(rawOpts)) {
        const letters = ['A', 'B', 'C', 'D'];
        letters.forEach((l, i) => {
          optionsObj[l] = rawOpts[i] || `Option ${l}`;
        });
      } else if (typeof rawOpts === 'object' && rawOpts !== null) {
        const letters = ['A', 'B', 'C', 'D'];
        letters.forEach((l) => {
          optionsObj[l] = rawOpts[l] || rawOpts[l.toLowerCase()] || `Option ${l}`;
        });
      } else {
        optionsObj = { A: 'First option', B: 'Second option', C: 'Third option', D: 'Fourth option' };
      }

      let correct = String(q.correct || q.answer || 'A').toUpperCase().trim();
      if (!['A', 'B', 'C', 'D'].includes(correct)) {
        const foundKey = Object.keys(optionsObj).find(
          (k) => optionsObj[k].toLowerCase().trim() === correct.toLowerCase()
        );
        correct = foundKey || 'A';
      }

      return {
        id: q.id || idx + 1,
        question: questionText,
        options: optionsObj,
        correct,
        explanation: q.explanation || q.reason || 'Correct answer details provided above.',
      };
    });

    return res.json({ success: true, questions: normalized });
  } catch (err) {
    console.error('Quiz generation error:', err);
    // Local fallback — deterministic questions so UI never crashes
    const fallback = Array.from({ length: Number(count) }, (_, i) => ({
      id: i + 1,
      question: `Sample ${difficulty.toLowerCase()} question ${i + 1} about ${topic} in ${subject}?`,
      options: { A: 'First plausible answer', B: 'Second plausible answer', C: 'Third plausible answer', D: 'Fourth plausible answer' },
      correct: ['A','B','C','D'][i % 4],
      explanation: `This is a fallback explanation for Q${i + 1}. Please set up your GROQ_API_KEY or GEMINI_API_KEY for real AI-generated questions.`,
    }));
    return res.json({ success: true, questions: fallback });
  }
};

exports.saveResult = async (req, res) => {
  const { userId = 'student_001', subject, topic, score, totalQuestions, difficulty } = req.body;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const { error } = await supabase.from('quiz_results').insert({
    user_id:         userId,
    subject,
    topic,
    score,
    total_questions: totalQuestions,
    percentage,
    difficulty,
  });

  if (error) {
    console.error('[quiz_results] Supabase error:', error.code, '-', error.message);
    // Still return success so UI never breaks
    return res.json({ success: true, dbError: error.message });
  }

  console.log(`[quiz_results] Saved: user=${userId} score=${score}/${totalQuestions} (${percentage}%)`);
  return res.json({ success: true });
};

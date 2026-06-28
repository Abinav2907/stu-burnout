const { callAI } = require('../utils/aiHelper');

exports.generateNotes = async (req, res) => {
  const { subject, topic, detailLevel = 'Detailed' } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ success: false, error: 'Subject and Topic are required.' });
  }

  const prompt = `You are an expert professor creating study notes for a college student in India.

Subject: ${subject}
Topic: ${topic}
Detail Level: ${detailLevel}

Return ONLY valid JSON with NO extra text or markdown fences:
{
  "title": "Full descriptive topic title",
  "summary": "Clear 3-sentence overview of the topic",
  "keyPoints": [
    "Key concept 1 explained clearly",
    "Key concept 2",
    "Key concept 3",
    "Key concept 4",
    "Key concept 5"
  ],
  "detailedNotes": [
    {
      "section": "Section heading",
      "content": "Thorough explanation suitable for ${detailLevel} level",
      "example": "Real-world example or formula if applicable"
    },
    {
      "section": "Second section heading",
      "content": "Another detailed explanation",
      "example": "Another example or formula"
    }
  ],
  "practiceQuestions": [
    { "question": "Question 1?", "answer": "Detailed answer 1" },
    { "question": "Question 2?", "answer": "Detailed answer 2" },
    { "question": "Question 3?", "answer": "Detailed answer 3" }
  ],
  "quickRevision": [
    "One-line fact 1",
    "One-line fact 2",
    "One-line fact 3",
    "One-line fact 4",
    "One-line fact 5"
  ],
  "formulasOrDates": [
    "Important formula or date 1",
    "Important formula or date 2"
  ]
}`;

  const messages = [
    { role: 'system', content: 'You are an expert professor. Return only valid JSON study notes.' },
    { role: 'user', content: prompt },
  ];

  try {
    const { text, model } = await callAI(messages, prompt);

    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const notes = JSON.parse(clean);

    return res.json({ success: true, notes, modelUsed: model });
  } catch (err) {
    console.error('Notes generation error:', err);

    // Local fallback so the UI always gets something useful
    return res.json({
      success: true,
      notes: {
        title: `${topic} — Complete Study Guide`,
        summary: `${topic} is a core concept in ${subject}. Mastering this topic involves understanding its foundational principles, practical applications, and typical exam patterns. This guide covers all key areas at a ${detailLevel} level.`,
        keyPoints: [
          `${topic} forms the foundation of many advanced topics in ${subject}.`,
          'Understanding the underlying principles is more valuable than memorising formulas.',
          'Practice with past exam questions to solidify your understanding.',
          'Connect this concept to real-world applications to remember it better.',
          'Regular revision spaced over several days outperforms cramming.',
        ],
        detailedNotes: [
          {
            section: 'Core Concepts',
            content: `The fundamental idea behind ${topic} in ${subject} involves understanding key definitions, relationships between variables, and underlying rules that govern its behaviour.`,
            example: `Consider a standard textbook problem where ${topic} is applied step-by-step to derive the final result.`,
          },
          {
            section: 'Applications & Importance',
            content: `${topic} is widely applied in engineering, science, and everyday problem-solving. Its importance in ${subject} makes it a high-priority topic for board and competitive exams.`,
            example: `Real-world scenario: industries use ${topic} to optimise processes, reduce costs, and improve accuracy.`,
          },
        ],
        practiceQuestions: [
          { question: `Define ${topic} and state its significance in ${subject}.`, answer: `${topic} refers to a fundamental concept that underpins many principles in ${subject}. It is significant because it provides a framework for analysing and solving complex problems.` },
          { question: `What are the main properties of ${topic}?`, answer: 'The main properties include those related to scope, scale, and applicability. Each property defines a specific behaviour or constraint within the subject domain.' },
          { question: `Give a real-world example of ${topic} in practice.`, answer: `In practice, ${topic} can be observed in systems such as manufacturing, computing, or natural phenomena depending on the specific subject context.` },
        ],
        quickRevision: [
          `${topic} = core concept of ${subject}`,
          'Always define terms before solving problems.',
          'Use diagrams and examples to aid memory.',
          'Connect theory to practical applications.',
          'Revise at intervals: 1 day, 3 days, 7 days, 30 days.',
        ],
        formulasOrDates: [
          'Refer to your textbook for specific formulas applicable to this topic.',
          'Key dates and historical context are found in the introduction chapters.',
        ],
      },
      modelUsed: 'local-fallback',
    });
  }
};

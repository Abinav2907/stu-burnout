const { createClient } = require('@supabase/supabase-js');
const { callAI } = require('../utils/aiHelper');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

exports.generateNotes = async (req, res) => {
  const { subject, topic, detailLevel = 'Detailed', userId = 'student_001' } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ success: false, error: 'Subject and Topic are required.' });
  }

  // Define clear constraints based on detail level
  let summaryConstraint = '';
  let keyPointsCount = 5;
  let detailedNotesCount = 2;
  let detailedNotesContentLength = '';
  let practiceQuestionsCount = 3;
  let quickRevisionCount = 5;

  if (detailLevel === 'Brief') {
    summaryConstraint = 'A single concise sentence explaining the core concept.';
    keyPointsCount = 3;
    detailedNotesCount = 1;
    detailedNotesContentLength = 'Very brief overview (1-2 sentences max).';
    practiceQuestionsCount = 2;
    quickRevisionCount = 3;
  } else if (detailLevel === 'Comprehensive') {
    summaryConstraint = 'An extensive 4-5 sentence summary covering background, current applications, and core significance.';
    keyPointsCount = 7;
    detailedNotesCount = 4;
    detailedNotesContentLength = 'Deep and thorough explanation (6-8 sentences minimum) covering advanced details, sub-topics, and edge cases.';
    practiceQuestionsCount = 5;
    quickRevisionCount = 8;
  } else {
    // Detailed
    summaryConstraint = 'A moderate 2-3 sentence overview.';
    keyPointsCount = 5;
    detailedNotesCount = 2;
    detailedNotesContentLength = 'Standard educational explanation (3-4 sentences).';
    practiceQuestionsCount = 3;
    quickRevisionCount = 5;
  }

  const prompt = `You are an expert professor creating study notes for a college student in India.

Subject: ${subject}
Topic: ${topic}
Requested Detail Level: ${detailLevel}

Constraints:
1. "summary": ${summaryConstraint}
2. "keyPoints": Generate exactly ${keyPointsCount} points.
3. "detailedNotes": Generate exactly ${detailedNotesCount} sections. Each section's content must be: ${detailedNotesContentLength}
4. "practiceQuestions": Generate exactly ${practiceQuestionsCount} question-answer pairs.
5. "quickRevision": Generate exactly ${quickRevisionCount} bullet points.

Return ONLY valid JSON with NO extra text or markdown fences:
{
  "title": "${topic} — ${detailLevel} Study Guide",
  "summary": "...",
  "keyPoints": [
    "Point 1",
    "Point 2"
  ],
  "detailedNotes": [
    {
      "section": "Section Heading",
      "content": "Explanation text",
      "example": "Real-world application or formula example"
    }
  ],
  "practiceQuestions": [
    { "question": "Question 1?", "answer": "Answer 1" }
  ],
  "quickRevision": [
    "Quick fact 1",
    "Quick fact 2"
  ],
  "formulasOrDates": [
    "Formula/Date 1",
    "Formula/Date 2"
  ]
}`;

  const messages = [
    { role: 'system', content: 'You are an expert professor. Return only valid JSON study notes matching the length constraints.' },
    { role: 'user', content: prompt },
  ];

  let notesResult = null;
  let usedModel = 'local-fallback';

  try {
    const { text, model } = await callAI(messages, prompt);
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    notesResult = JSON.parse(clean);
    usedModel = model;
  } catch (err) {
    console.error('Notes AI generation error, using fallback:', err.message);

    // Fallback notes built dynamically based on detailLevel
    const fallbackKeyPoints = [
      `${topic} is a key concept within ${subject}.`,
      `Understanding the fundamentals of ${topic} is highly important for exams.`,
      `Connecting ${topic} to practical implementations improves conceptual retention.`,
    ];
    if (detailLevel !== 'Brief') {
      fallbackKeyPoints.push(`Make sure to solve previous year paper questions about ${topic}.`);
      fallbackKeyPoints.push(`Regular spaced repetition sessions help in memorizing ${topic} details.`);
    }
    if (detailLevel === 'Comprehensive') {
      fallbackKeyPoints.push(`Advanced topics building on ${topic} require clear foundational understanding.`);
      fallbackKeyPoints.push(`Combine theory with active recall methods to master ${topic}.`);
    }

    const fallbackDetailed = [
      {
        section: 'Introduction and Basics',
        content: `The primary concepts surrounding ${topic} include definition parameters and core rules of interaction in ${subject}.`,
        example: `Solving a standard college worksheet problem using ${topic}.`
      }
    ];
    if (detailLevel !== 'Brief') {
      fallbackDetailed.push({
        section: 'Applications and Industry Uses',
        content: `In the professional field, ${topic} is leveraged for system optimization, architectural designs, or mathematical processing.`,
        example: `Industrial implementations use ${topic} to maximize operational performance.`
      });
    }
    if (detailLevel === 'Comprehensive') {
      fallbackDetailed.push({
        section: 'Common Errors & Edge Cases',
        content: `Students often fail to identify boundary conditions where ${topic} behaves differently. Checking constraints is crucial.`,
        example: `A common miscalculation is forgetting initialization values.`
      });
      fallbackDetailed.push({
        section: 'Expert Exam Tips',
        content: `Questions on ${topic} usually require you to diagram key flows or specify formula derivations. Memorize standard proofs.`,
        example: `Deriving the standard relation for ${topic} saves time under pressure.`
      });
    }

    notesResult = {
      title: `${topic} — ${detailLevel} Study Guide`,
      summary: `${topic} is a core component of ${subject}. A firm understanding of this topic is critical for both theoretical evaluation and practical programming/scientific application. This ${detailLevel.toLowerCase()} notes sheet provides key takeaways.`,
      keyPoints: fallbackKeyPoints,
      detailedNotes: fallbackDetailed,
      practiceQuestions: [
        { question: `What is the core definition of ${topic}?`, answer: `In ${subject}, ${topic} represents a fundamental structure or concept that solves domain-specific problems.` },
        { question: `State one typical application of ${topic}.`, answer: `It is widely utilized to establish structured, predictable outcomes in practical applications.` }
      ],
      quickRevision: [
        `${topic} belongs to ${subject}`,
        'Review standard equations and definitions',
        'Solve practice questions under mock conditions'
      ],
      formulasOrDates: [
        `Refer to textbook chapter on ${topic} for formula sheets.`
      ]
    };
  }

  // Save notes to database
  const { error: dbErr } = await supabase.from('notes_history').insert({
    user_id: userId,
    subject,
    topic,
    content: notesResult
  });

  if (dbErr) {
    console.error('[notes_history] Supabase error:', dbErr.code, '-', dbErr.message);
  } else {
    console.log(`[notes_history] Saved: user=${userId} topic=${topic} (${detailLevel})`);
  }

  return res.json({ success: true, notes: notesResult, modelUsed: usedModel });
};

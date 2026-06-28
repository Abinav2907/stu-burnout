const { GoogleGenAI } = require("@google/genai");

exports.generateNotes = async (req, res) => {
  const { subject, topic, detailLevel } = req.body;
  if (!subject || !topic) {
    return res.status(400).json({ error: 'Subject and Topic are required fields.' });
  }

  // AI model init
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return structured default study materials if key is missing
    return res.json({
      title: `${topic} - Essential Study Guide`,
      summary: `This is a comprehensive study guide covering the core foundations of ${topic} inside ${subject}.`,
      keyPoints: [
        'Core architectural layout and syntax elements',
        'Optimizing operational parameters and memory overhead',
        'Reviewing boundary behaviors during integration phases',
      ],
      detailedNotes: `Detailed overview of ${topic} under ${subject}:\n1. Modularity ensures that segments can be optimized and maintained in isolation.\n2. Interface boundaries must expose clear contracts without leaking internals.\n3. Verify operational performance at regular intervals.`,
      practiceQuestions: [
        `What is the primary operational objective of ${topic}?`,
        `How do scale changes impact overall performance inside ${subject}?`,
      ],
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a professional educational system. Create complete, high-quality study notes for the subject: "${subject}" on the topic: "${topic}".
Detail Level: ${detailLevel}.
Your response must be valid JSON in this exact structure:
{
  "title": "A concise title",
  "summary": "A 2-3 sentence high-level summary",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "detailedNotes": "Detailed, paragraph-long explanations on the concepts, formulas, or rules.",
  "practiceQuestions": ["Question 1", "Question 2"]
}
Return ONLY the raw JSON string. Do not include markdown code block tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text.trim();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate notes: ' + error.message });
  }
};

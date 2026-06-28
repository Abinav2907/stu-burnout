/*
 * Supabase SQL — run this in your Supabase SQL editor:
 *
 * CREATE TABLE IF NOT EXISTS burnout_predictions (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id text UNIQUE NOT NULL,
 *   risk_level text,
 *   risk_score int,
 *   burnout_probability int,
 *   dropout_probability int,
 *   top_risk_factors jsonb,
 *   recommendations jsonb,
 *   weekly_plan jsonb,
 *   updated_at timestamptz DEFAULT now()
 * );
 */

const { createClient } = require('@supabase/supabase-js');
const { callAI } = require('../utils/aiHelper');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.predictRisk = async (req, res) => {
  const {
    userId = 'anonymous',
    attendance,
    gpa,
    studyHours,
    sleepHours,
    exercise,
    screenTime,
    stressLevel,
    motivationLevel,
    socialActivity,
  } = req.body;

  const prompt = `You are an expert educational psychologist and ML analyst.

Analyze this student's data for burnout and dropout risk:
- Attendance: ${attendance}% (Warning if below 75%)
- GPA: ${gpa}/10 (Warning if below 6.0)
- Daily Study Hours: ${studyHours} hrs
- Nightly Sleep: ${sleepHours} hrs (Warning if below 6)
- Weekly Exercise: ${exercise} days
- Daily Screen Time: ${screenTime} hrs
- Stress Level: ${stressLevel}/10 (Warning if above 7)
- Motivation Level: ${motivationLevel}/10 (Warning if below 4)
- Social Activity: ${socialActivity}/10

Return ONLY valid JSON with NO extra text or markdown:
{
  "riskLevel": "LOW" or "MEDIUM" or "HIGH",
  "riskScore": number 0-100,
  "burnoutProbability": number 0-100,
  "dropoutProbability": number 0-100,
  "topRiskFactors": ["most critical factor", "second factor", "third factor"],
  "recommendations": [
    "Specific actionable advice 1",
    "Specific actionable advice 2",
    "Specific actionable advice 3",
    "Specific actionable advice 4",
    "Specific actionable advice 5"
  ],
  "encouragement": "One warm motivating sentence personalized to their situation",
  "weeklyPlan": {
    "Monday": "Focus task for Monday",
    "Tuesday": "Focus task for Tuesday",
    "Wednesday": "Focus task for Wednesday",
    "Thursday": "Focus task for Thursday",
    "Friday": "Focus task for Friday",
    "Saturday": "Rest/review suggestion",
    "Sunday": "Preparation tip for next week"
  }
}

Risk scoring rules:
HIGH (riskScore 65-100): attendance<60 OR gpa<5 OR stress>8 OR sleep<5 OR motivation<3
MEDIUM (riskScore 35-64): attendance 60-75 OR gpa 5-6.5 OR stress 6-8 OR sleep 5-6
LOW (riskScore 0-34): all other cases`;

  const messages = [
    { role: 'system', content: 'You are an expert psychologist. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ];

  try {
    const { text, model } = await callAI(messages, prompt);

    // Strip markdown code fences if present
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(clean);

    // Upsert to Supabase
    try {
      await supabase.from('burnout_predictions').upsert(
        {
          user_id:             userId,
          risk_level:          result.riskLevel,
          risk_score:          result.riskScore,
          burnout_probability: result.burnoutProbability,
          dropout_probability: result.dropoutProbability,
          top_risk_factors:    result.topRiskFactors,
          recommendations:     result.recommendations,
          weekly_plan:         result.weeklyPlan,
          updated_at:          new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch (dbErr) {
      console.warn('Supabase burnout upsert skipped:', dbErr.message);
    }

    return res.json({ success: true, ...result, modelUsed: model });
  } catch (err) {
    console.error('Burnout prediction error:', err);

    // Deterministic local fallback so UI always works
    const score = Math.min(
      Math.max(
        Math.round(
          (100 - attendance) * 0.3 +
          (10 - gpa) * 4 +
          stressLevel * 5 +
          (10 - motivationLevel) * 3 +
          screenTime * 1.2 +
          Math.max(0, 6 - sleepHours) * 2 -
          exercise * 1
        ),
        5
      ),
      98
    );
    const level = score < 35 ? 'LOW' : score < 65 ? 'MEDIUM' : 'HIGH';
    return res.json({
      success: true,
      riskLevel: level,
      riskScore: score,
      burnoutProbability: Math.min(score + 5, 99),
      dropoutProbability: Math.max(score - 15, 2),
      topRiskFactors: ['High stress level', 'Insufficient sleep', 'Low motivation'],
      recommendations: [
        'Take regular 5-minute breaks every 45 minutes of study.',
        'Aim for 7-8 hours of sleep every night.',
        'Incorporate at least 20 minutes of physical activity daily.',
        'Reduce recreational screen time to below 3 hours.',
        'Talk to a peer, mentor, or counsellor if feeling overwhelmed.',
      ],
      encouragement: 'You are doing your best — small consistent actions build lasting success!',
      weeklyPlan: {
        Monday: 'Focus on your hardest subject for 2 hours in the morning.',
        Tuesday: 'Revise yesterday\'s notes and attempt 5 practice questions.',
        Wednesday: 'Group study or teaching a concept to reinforce memory.',
        Thursday: 'Mock test on weak topics; review mistakes carefully.',
        Friday: 'Light reading and flash-card revision only.',
        Saturday: 'Full rest, outdoor activity, and zero screen time for academics.',
        Sunday: 'Plan next week\'s schedule and set 3 achievable study goals.',
      },
      modelUsed: 'local-fallback',
    });
  }
};

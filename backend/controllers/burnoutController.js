/*
 * Supabase SQL — run in your Supabase SQL editor:
 *
 * CREATE TABLE IF NOT EXISTS burnout_predictions (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id text UNIQUE NOT NULL,
 *   risk_level text,
 *   risk_score int,
 *   burnout_probability int,
 *   dropout_probability int,
 *   model_confidence float,
 *   source text,
 *   top_risk_factors jsonb,
 *   recommendations jsonb,
 *   weekly_plan jsonb,
 *   updated_at timestamptz DEFAULT now()
 * );
 */

const axios  = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { callAI } = require('../utils/aiHelper');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

exports.predictRisk = async (req, res) => {
  const {
    userId = 'anonymous',
    attendance, gpa, studyHours, sleepHours,
    exercise, screenTime, stressLevel, motivationLevel, socialActivity,
  } = req.body;

  // ── Step 1: Try Python ML service ──────────────────────────────────────
  let mlResult = null;
  let source   = 'ai_fallback';

  try {
    const mlRes = await axios.post(
      `${ML_URL}/predict`,
      { attendance, gpa, studyHours, sleepHours, exercise, screenTime, stressLevel, motivationLevel, socialActivity },
      { timeout: 5000 }
    );
    mlResult = mlRes.data;
    source   = mlResult.source || 'ml_model';
    console.log('✅ ML service used:', mlResult.riskLevel, `(confidence: ${mlResult.modelConfidence?.toFixed(1)}%)`);
  } catch (mlErr) {
    console.warn('⚠️  ML service unavailable, using AI fallback:', mlErr.message);
  }

  // ── Step 2: AI fallback if ML failed ───────────────────────────────────
  if (!mlResult) {
    const shortPrompt = `Analyze student burnout risk. Return ONLY valid JSON with no text outside:
{ "riskLevel": "LOW" or "MEDIUM" or "HIGH", "riskScore": 0-100, "burnoutProbability": 0-100, "dropoutProbability": 0-100 }
Student data — attendance: ${attendance}%, gpa: ${gpa}/10, study: ${studyHours}hrs/day, sleep: ${sleepHours}hrs/night, stress: ${stressLevel}/10, motivation: ${motivationLevel}/10, exercise: ${exercise}days/week`;

    try {
      const { text } = await callAI(
        [{ role: 'system', content: 'You are an expert psychologist. Return only valid JSON.' }, { role: 'user', content: shortPrompt }],
        shortPrompt
      );
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      mlResult = JSON.parse(clean);
    } catch {
      // Deterministic local formula
      const score = Math.min(Math.max(Math.round(
        (100 - attendance) * 0.3 + (10 - gpa) * 4 +
        stressLevel * 5 + (10 - motivationLevel) * 3 +
        screenTime * 1.2 + Math.max(0, 6 - sleepHours) * 2 - exercise * 1
      ), 5), 98);
      mlResult = {
        riskLevel:           score < 35 ? 'LOW' : score < 65 ? 'MEDIUM' : 'HIGH',
        riskScore:           score,
        burnoutProbability:  Math.min(score + 5, 99),
        dropoutProbability:  Math.max(score - 15, 2),
        modelConfidence:     null,
      };
      source = 'local_formula';
    }
  }

  // ── Step 3: Generate AI recommendations ────────────────────────────────
  const recoPrompt = `Student burnout risk is ${mlResult.riskLevel} (score: ${mlResult.riskScore}/100).
Student: attendance ${attendance}%, gpa ${gpa}, sleep ${sleepHours}hrs, stress ${stressLevel}/10, motivation ${motivationLevel}/10.
Return ONLY valid JSON:
{
  "recommendations": ["advice 1","advice 2","advice 3","advice 4","advice 5"],
  "encouragement": "one warm sentence",
  "topRiskFactors": ["factor1","factor2","factor3"],
  "weeklyPlan": {
    "Monday":"task","Tuesday":"task","Wednesday":"task","Thursday":"task","Friday":"task",
    "Saturday":"rest tip","Sunday":"prep tip"
  }
}`;

  let extra = {
    recommendations:  ['Take regular breaks using Pomodoro intervals', 'Aim for 7-8 hours of sleep nightly', 'Add 20 mins of exercise daily', 'Reduce recreational screen time', 'Speak to a peer or mentor if overwhelmed'],
    encouragement:    'You are doing your best — small consistent steps build lasting success!',
    topRiskFactors:   ['High stress levels', 'Insufficient sleep', 'Low motivation'],
    weeklyPlan:       { Monday: 'Study hardest subject 2hrs', Tuesday: 'Revise notes + 5 practice Qs', Wednesday: 'Group study session', Thursday: 'Mock test + error review', Friday: 'Light revision only', Saturday: 'Full rest + outdoor activity', Sunday: 'Plan next week goals' },
  };

  try {
    const { text } = await callAI(
      [{ role: 'system', content: 'You are an expert psychologist. Return only valid JSON.' }, { role: 'user', content: recoPrompt }],
      recoPrompt
    );
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    extra = JSON.parse(clean);
  } catch {
    // use defaults above
  }

  // ── Step 4: Upsert to Supabase ──────────────────────────────────────────
  const { error: dbErr } = await supabase.from('burnout_predictions').upsert({
    user_id:             userId,
    risk_level:          mlResult.riskLevel,
    risk_score:          mlResult.riskScore,
    burnout_probability: mlResult.burnoutProbability,
    dropout_probability: mlResult.dropoutProbability,
    model_confidence:    mlResult.modelConfidence ?? null,
    source,
    top_risk_factors:    extra.topRiskFactors,
    recommendations:     extra.recommendations,
    weekly_plan:         extra.weeklyPlan,
    updated_at:          new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (dbErr) {
    console.error('[burnout_predictions] Supabase error:', dbErr.code, '-', dbErr.message);
  } else {
    console.log(`[burnout_predictions] Saved: user=${userId} riskLevel=${mlResult.riskLevel}`);
  }

  return res.json({
    success:             true,
    riskLevel:           mlResult.riskLevel,
    riskScore:           mlResult.riskScore,
    burnoutProbability:  mlResult.burnoutProbability,
    dropoutProbability:  mlResult.dropoutProbability,
    modelConfidence:     mlResult.modelConfidence ?? null,
    source,
    ...extra,
  });
};

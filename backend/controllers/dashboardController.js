const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

// Helper to format date into "X mins ago", "X hours ago", "Yesterday", "X days ago"
function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

exports.getSummary = async (req, res) => {
  const { userId = 'student_001' } = req.query;

  try {
    // 1. Fetch Latest Quiz Score
    const { data: latestQuiz, error: qErr } = await supabase
      .from('quiz_results')
      .select('percentage, score, total_questions')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    // 2. Fetch Latest Burnout Risk
    const { data: latestBurnout, error: bErr } = await supabase
      .from('burnout_predictions')
      .select('risk_level, risk_score')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    // 3. Fetch Focus stats for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { data: todaySessions, error: fsErr } = await supabase
      .from('focus_sessions')
      .select('duration, mode')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString());

    // 4. Fetch activities to build the stream
    const [quizzes, notes, sessions, predictions] = await Promise.all([
      supabase.from('quiz_results').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('notes_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('focus_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('burnout_predictions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(5),
    ]);

    // Build Unified Activities Stream
    let activities = [];

    if (quizzes.data) {
      quizzes.data.forEach(q => {
        activities.push({
          text: `Completed a ${q.difficulty || 'Medium'} quiz on "${q.subject || ''} — ${q.topic || ''}" (Score: ${q.score}/${q.total_questions})`,
          time: formatTimeAgo(q.created_at),
          badge: 'Quiz',
          rawDate: new Date(q.created_at)
        });
      });
    }

    if (notes.data) {
      notes.data.forEach(n => {
        activities.push({
          text: `Generated study notes for "${n.subject || ''} — ${n.topic || ''}"`,
          time: formatTimeAgo(n.created_at),
          badge: 'Notes',
          rawDate: new Date(n.created_at)
        });
      });
    }

    if (sessions.data) {
      sessions.data.forEach(s => {
        activities.push({
          text: `Completed a ${s.duration}-min ${s.mode} Focus interval`,
          time: formatTimeAgo(s.created_at),
          badge: 'Study',
          rawDate: new Date(s.created_at)
        });
      });
    }

    if (predictions.data) {
      predictions.data.forEach(p => {
        activities.push({
          text: `Burnout risk assessed — Result: ${p.risk_level} Risk (${p.risk_score}%)`,
          time: formatTimeAgo(p.updated_at),
          badge: 'Wellbeing',
          rawDate: new Date(p.updated_at)
        });
      });
    }

    // Sort descending by date
    activities.sort((a, b) => b.rawDate - a.rawDate);
    activities = activities.slice(0, 4); // Limit to top 4

    // Dynamic study streak calculation
    // Count distinct days with any activity in the last 30 days
    const allActivityDates = [
      ...(quizzes.data || []).map(q => q.created_at),
      ...(notes.data || []).map(n => n.created_at),
      ...(sessions.data || []).map(s => s.created_at),
    ].map(d => new Date(d).toDateString());

    const uniqueActiveDays = new Set(allActivityDates);
    let streak = 0;
    let checkDate = new Date();
    
    // Check backwards from today to find consecutive active days
    for (let i = 0; i < 30; i++) {
      if (uniqueActiveDays.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If yesterday was active but today hasn't been active yet, keep checking from yesterday
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (uniqueActiveDays.has(checkDate.toDateString())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    // Today's focus time
    const totalFocusMinutes = (todaySessions.data || [])
      .filter(s => s.mode === 'Focus')
      .reduce((sum, curr) => sum + curr.duration, 0);

    return res.json({
      success: true,
      stats: {
        quizScore: latestQuiz.data?.[0] ? latestQuiz.data[0].percentage : null,
        mlPrediction: latestBurnout.data?.[0] ? latestBurnout.data[0].risk_level : null,
        riskScore: latestBurnout.data?.[0] ? latestBurnout.data[0].risk_score : null,
        studyStreak: streak || 0,
        focusDurationToday: totalFocusMinutes
      },
      activities
    });

  } catch (err) {
    console.error('Dashboard summary aggregation error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

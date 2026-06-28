const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

// 1. Save Focus Session
exports.saveSession = async (req, res) => {
  const { userId = 'student_001', duration = 25, mode = 'Focus' } = req.body;

  const { data, error } = await supabase.from('focus_sessions').insert({
    user_id: userId,
    duration: Number(duration),
    mode
  }).select();

  if (error) {
    console.error('[focus_sessions] Supabase error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  console.log(`[focus_sessions] Saved: user=${userId} duration=${duration} mode=${mode}`);
  return res.json({ success: true, session: data[0] });
};

// 2. Get Focus Stats for Today
exports.getStats = async (req, res) => {
  const { userId = 'student_001' } = req.query;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('duration, mode')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());

  if (error) {
    console.error('[focus_sessions] Fetch error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  const focusSessions = data.filter(s => s.mode === 'Focus');
  const sessionsCount = focusSessions.length;
  const totalMinutes = focusSessions.reduce((acc, curr) => acc + curr.duration, 0);

  return res.json({
    success: true,
    sessionsDone: sessionsCount,
    totalFocusTime: totalMinutes
  });
};

// 3. Get Tasks
exports.getTasks = async (req, res) => {
  const { userId = 'student_001' } = req.query;

  const { data, error } = await supabase
    .from('pomodoro_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[pomodoro_tasks] Fetch error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, tasks: data });
};

// 4. Add Task
exports.addTask = async (req, res) => {
  const { userId = 'student_001', text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Task text is required.' });
  }

  const { data, error } = await supabase
    .from('pomodoro_tasks')
    .insert({
      user_id: userId,
      text: text.trim(),
      completed: false
    })
    .select();

  if (error) {
    console.error('[pomodoro_tasks] Insert error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, task: data[0] });
};

// 5. Toggle Task (Update)
exports.toggleTask = async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const { data, error } = await supabase
    .from('pomodoro_tasks')
    .update({ completed })
    .eq('id', id)
    .select();

  if (error) {
    console.error('[pomodoro_tasks] Update error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, task: data[0] });
};

// 6. Delete Task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('pomodoro_tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[pomodoro_tasks] Delete error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true });
};

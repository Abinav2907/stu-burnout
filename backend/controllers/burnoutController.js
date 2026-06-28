const axios = require('axios');

exports.predictRisk = async (req, res) => {
  const {
    attendance,
    gpa,
    studyHours,
    sleepHours,
    exerciseDays,
    screenTime,
    stressLevel,
    motivationLevel,
    socialActivity,
  } = req.body;

  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000/predict';

  try {
    const mlResponse = await axios.post(mlServiceUrl, {
      attendance,
      gpa,
      studyHours,
      sleepHours,
      exerciseDays,
      screenTime,
      stressLevel,
      motivationLevel,
      socialActivity,
    });
    return res.json(mlResponse.data);
  } catch (error) {
    console.warn('Flask ML service unreachable, calculating locally:', error.message);

    // Calculate score locally using structured formula
    const attendancePenalty = (100 - attendance) * 0.35;
    const gpaPenalty = (10 - gpa) * 4;
    const stressPenalty = stressLevel * 5;
    const motivationBuffer = (10 - motivationLevel) * 3;
    const screenPenalty = screenTime * 1.5;
    const sleepBuffer = (8 - sleepHours) * 2;
    const exerciseBuffer = (3 - exerciseDays) * 1.5;

    const baseScore = attendancePenalty + gpaPenalty + stressPenalty + motivationBuffer + screenPenalty + sleepBuffer + exerciseBuffer;
    const riskScore = Math.min(Math.max(Math.round(baseScore), 5), 98);

    let riskLevel = 'LOW';
    let recommendations = [
      'Balance study times with relaxation hours',
      'Maintain your excellent attendance and GPA habits',
    ];

    if (riskScore >= 35 && riskScore < 70) {
      riskLevel = 'MEDIUM';
      recommendations = [
        'Organize assignments using structured study planners',
        'Aim to increase sleep duration to 7+ hours per night',
        'Add a short walk or exercise break during study blocks',
      ];
    } else if (riskScore >= 70) {
      riskLevel = 'HIGH';
      recommendations = [
        'Consider reducing non-critical screen time to lower cognitive strain',
        'Schedule a check-in session with an academic counselor',
        'Use Pomodoro intervals (25 mins focus, 5 mins rest) to pace yourself',
        'Increase rest intervals and lower weekend study hours',
      ];
    }

    return res.json({
      riskScore,
      riskLevel,
      recommendations,
    });
  }
};

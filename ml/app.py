"""
app.py
Flask ML service for PrepPilot Burnout Risk Prediction.
Runs on port 5001 by default.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os

app = Flask(__name__)
CORS(app)

# ── Load model and scaler on startup ──────────────────────────────────────
BASE = os.path.dirname(__file__)
try:
    MODEL  = joblib.load(os.path.join(BASE, 'burnout_model.pkl'))
    SCALER = joblib.load(os.path.join(BASE, 'scaler.pkl'))
    with open(os.path.join(BASE, 'model_info.txt')) as f:
        ACCURACY = f.read().strip()
    print(f"✅ Model loaded | Accuracy: {ACCURACY}%")
except FileNotFoundError:
    print("❌ Model not found. Run: python generate_dataset.py && python train.py")
    MODEL  = None
    SCALER = None
    ACCURACY = "N/A"

# Feature order must match train.py FEATURES list
FEATURE_ORDER = [
    'attendance', 'gpa', 'study_hours', 'sleep_hours', 'exercise_days',
    'screen_time', 'stress_level', 'motivation_level', 'social_activity'
]
LABEL_MAP = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'}


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status':   'ok',
        'model':    'RandomForest',
        'accuracy': f"{ACCURACY}%",
        'ready':    MODEL is not None,
    })


@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None or SCALER is None:
        return jsonify({'error': 'Model not loaded. Run train.py first.'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body provided.'}), 400

    # Map incoming keys (camelCase from JS) to snake_case feature order
    key_map = {
        'attendance':       data.get('attendance',       75),
        'gpa':              data.get('gpa',              7.0),
        'study_hours':      data.get('studyHours',       data.get('study_hours', 5)),
        'sleep_hours':      data.get('sleepHours',       data.get('sleep_hours', 7)),
        'exercise_days':    data.get('exercise',         data.get('exercise_days', 3)),
        'screen_time':      data.get('screenTime',       data.get('screen_time', 4)),
        'stress_level':     data.get('stressLevel',      data.get('stress_level', 5)),
        'motivation_level': data.get('motivationLevel',  data.get('motivation_level', 7)),
        'social_activity':  data.get('socialActivity',   data.get('social_activity', 6)),
    }

    try:
        features = np.array([[float(key_map[f]) for f in FEATURE_ORDER]])
        scaled   = SCALER.transform(features)
        label_id = int(MODEL.predict(scaled)[0])
        proba    = MODEL.predict_proba(scaled)[0]   # [P(LOW), P(MEDIUM), P(HIGH)]

        risk_level          = LABEL_MAP[label_id]
        risk_score          = int(proba[2] * 100 * 0.7 + proba[1] * 100 * 0.3)
        burnout_probability = int(min(proba[2] * 100 + proba[1] * 50, 99))
        dropout_probability = int(min(proba[2] * 80  + proba[1] * 30, 99))
        model_confidence    = round(float(max(proba)) * 100, 2)

        return jsonify({
            'riskLevel':          risk_level,
            'riskScore':          risk_score,
            'burnoutProbability': burnout_probability,
            'dropoutProbability': dropout_probability,
            'modelConfidence':    model_confidence,
            'source':             'ml_model',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5001))
    print(f"\n🚀 PrepPilot ML Service running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)

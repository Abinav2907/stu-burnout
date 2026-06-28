"""
generate_dataset.py
Generates a synthetic dataset of 2000 student records and saves it as dataset.csv.
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 2000

# Raw feature generation
attendance       = np.random.uniform(40,  100, N)
gpa              = np.random.uniform(3.0, 10.0, N)
study_hours      = np.random.uniform(1,   12,  N)
sleep_hours      = np.random.uniform(4,   10,  N)
exercise_days    = np.random.randint(0,   8,   N).astype(float)
screen_time      = np.random.uniform(1,   14,  N)
stress_level     = np.random.randint(1,   11,  N).astype(float)
motivation_level = np.random.randint(1,   11,  N).astype(float)
social_activity  = np.random.randint(1,   11,  N).astype(float)

# Deterministic risk_score label generation
def compute_risk_score(att, gpa, sleep, stress, motiv, study, exercise, screen):
    score = 0
    if att < 60:    score += 30
    elif att < 75:  score += 15
    if gpa < 5.0:   score += 25
    elif gpa < 6.5: score += 12
    if sleep < 5:   score += 20
    elif sleep < 6: score += 10
    if stress > 8:  score += 20
    elif stress > 6:score += 10
    if motiv < 3:   score += 15
    elif motiv < 5: score += 8
    if study < 2:   score += 10
    if exercise == 0: score += 5
    if screen > 10: score += 8
    return score

risk_scores = np.array([
    compute_risk_score(
        attendance[i], gpa[i], sleep_hours[i], stress_level[i],
        motivation_level[i], study_hours[i], exercise_days[i], screen_time[i]
    )
    for i in range(N)
])

labels = np.where(risk_scores >= 50, 2, np.where(risk_scores >= 25, 1, 0))

# Add Gaussian noise to numeric features to make data realistic
def add_noise(arr, std):
    return np.clip(arr + np.random.normal(0, std, len(arr)), arr.min(), arr.max())

df = pd.DataFrame({
    'attendance':       add_noise(attendance,       3.0),
    'gpa':              add_noise(gpa,              0.3),
    'study_hours':      add_noise(study_hours,      0.5),
    'sleep_hours':      add_noise(sleep_hours,      0.4),
    'exercise_days':    np.clip(exercise_days + np.random.randint(-1, 2, N), 0, 7).astype(int),
    'screen_time':      add_noise(screen_time,      0.8),
    'stress_level':     np.clip(stress_level + np.random.randint(-1, 2, N), 1, 10).astype(int),
    'motivation_level': np.clip(motivation_level + np.random.randint(-1, 2, N), 1, 10).astype(int),
    'social_activity':  np.clip(social_activity + np.random.randint(-1, 2, N), 1, 10).astype(int),
    'label':            labels,
})

df.to_csv('dataset.csv', index=False)
print(f"dataset.csv created - {N} records")
print(f"   Label distribution: LOW={sum(labels==0)} | MEDIUM={sum(labels==1)} | HIGH={sum(labels==2)}")

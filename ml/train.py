"""
train.py
Loads dataset.csv, trains a RandomForestClassifier, and saves model + scaler.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

FEATURES = ['attendance','gpa','study_hours','sleep_hours','exercise_days',
            'screen_time','stress_level','motivation_level','social_activity']
TARGET   = 'label'

# ── Load data ─────────────────────────────────────────────────────────────
df = pd.read_csv('dataset.csv')
X  = df[FEATURES].values
y  = df[TARGET].values

# ── Split ──────────────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# ── Scale ──────────────────────────────────────────────────────────────────
scaler  = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test  = scaler.transform(X_test)

# ── Train ──────────────────────────────────────────────────────────────────
model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────────────────────────────
y_pred   = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel trained! Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['LOW','MEDIUM','HIGH']))

# ── Save ───────────────────────────────────────────────────────────────────
joblib.dump(model,  'burnout_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

# Persist accuracy for the /health endpoint
with open('model_info.txt', 'w') as f:
    f.write(f"{accuracy * 100:.2f}")

print("Saved: burnout_model.pkl, scaler.pkl, model_info.txt")

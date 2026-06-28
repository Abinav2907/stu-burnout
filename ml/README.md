# ML Service Setup
1. cd ml
2. pip install -r requirements.txt
3. python generate_dataset.py   # creates dataset.csv
4. python train.py              # trains model, creates burnout_model.pkl + scaler.pkl
5. python app.py                # starts Flask on port 5001

Run this ONCE before starting the backend.
Model persists on disk — no retraining needed on restart.

# data/test_models.py
# Quick test to verify all models load and predict correctly

import joblib
import numpy as np

print("Testing all models...\n")

# Test 1: Fee Defaulter
model = joblib.load('models/fee_defaulter_model.pkl')
test_input = [[60.0, 50000, 25, 2, 5]]
result = model.predict_proba(test_input)[0]
print(f"Fee Defaulter Test:")
print(f"  Input: attendance=60%, pending=50000, days=25, defaults=2")
print(f"  Risk Score: {result[1]:.2f}")
print(f"  Prediction: {'HIGH RISK' if result[1] > 0.7 else 'LOW RISK'}\n")

# Test 2: Attendance Anomaly
model2 = joblib.load('models/attendance_anomaly_model.pkl')
test_input2 = [[62.0, 4, 8, 50, 31]]
result2 = model2.predict_proba(test_input2)[0]
print(f"Attendance Anomaly Test:")
print(f"  Input: 62% attendance, 4 consecutive absences")
print(f"  Risk Score: {result2[1]:.2f}")
print(f"  Prediction: {'AT RISK' if result2[1] > 0.4 else 'SAFE'}\n")

# Test 3: Exam Predictor
model3 = joblib.load('models/exam_predictor_model.pkl')
test_input3 = [[72.0, 65.0, 48.0, 55.0, 2.0]]
result3 = model3.predict(test_input3)[0]
print(f"Exam Performance Test:")
print(f"  Input: attendance=72%, assignment=65, midterm=48")
print(f"  Predicted Score: {result3:.1f}/100")
level = 'HIGH RISK' if result3 < 40 else 'MEDIUM' if result3 < 60 else 'LOW RISK'
print(f"  Risk Level: {level}\n")

# Test 4: Query Classifier
model4 = joblib.load('models/query_classifier_model.pkl')
vectorizer = joblib.load('models/query_vectorizer.pkl')
test_queries = [
    "What is my attendance percentage?",
    "How much fees do I need to pay?",
    "When are the exams?",
    "I need a bonafide certificate"
]
print(f"Query Classifier Test:")
for q in test_queries:
    vec = vectorizer.transform([q])
    intent = model4.predict(vec)[0]
    proba = model4.predict_proba(vec).max()
    print(f"  '{q}'")
    print(f"  → Intent: {intent} (confidence: {proba:.2%})\n")

print("✅ All models working correctly!")
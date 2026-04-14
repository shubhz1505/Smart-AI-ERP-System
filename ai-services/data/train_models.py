# data/train_models.py
# Trains all ML models and saves them as .pkl files

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os

os.makedirs('models', exist_ok=True)

print("="*50)
print("TRAINING ALL ML MODELS")
print("="*50)


# ================================================
# MODEL 1: Fee Defaulter Predictor
# ================================================
print("\n[1/4] Training Fee Defaulter Model...")

df_fee = pd.read_csv('data/fee_defaulter_data.csv')

features = ['attendance_percentage', 'pending_amount',
            'days_since_last_payment', 'previous_defaults', 'semester']
X = df_fee[features]
y = df_fee['defaulted']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

fee_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
fee_model.fit(X_train, y_train)

y_pred = fee_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"   Accuracy: {accuracy:.2%}")
print(f"   Feature importance:")
for feat, imp in zip(features, fee_model.feature_importances_):
    print(f"     {feat}: {imp:.3f}")

joblib.dump(fee_model, 'models/fee_defaulter_model.pkl')
print("   ✅ Saved: models/fee_defaulter_model.pkl")


# ================================================
# MODEL 2: Attendance Anomaly Detector
# ================================================
print("\n[2/4] Training Attendance Anomaly Model...")

df_att = pd.read_csv('data/attendance_anomaly_data.csv')

features_att = ['overall_percentage', 'consecutive_absences',
                'monday_absences', 'total_classes', 'present_classes']
X_att = df_att[features_att]
y_att = df_att['at_risk']

X_train, X_test, y_train, y_test = train_test_split(
    X_att, y_att, test_size=0.2, random_state=42)

att_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=8,
    random_state=42
)
att_model.fit(X_train, y_train)

y_pred = att_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"   Accuracy: {accuracy:.2%}")

joblib.dump(att_model, 'models/attendance_anomaly_model.pkl')
print("   ✅ Saved: models/attendance_anomaly_model.pkl")


# ================================================
# MODEL 3: Exam Performance Predictor
# ================================================
print("\n[3/4] Training Exam Performance Model...")

df_exam = pd.read_csv('data/exam_performance_data.csv')

features_exam = ['attendance_percentage', 'assignment_score',
                 'midterm_score', 'quiz_average', 'study_hours_per_day']
X_exam = df_exam[features_exam]
y_exam = df_exam['final_score']

X_train, X_test, y_train, y_test = train_test_split(
    X_exam, y_exam, test_size=0.2, random_state=42)

exam_model = RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
exam_model.fit(X_train, y_train)

# For regression use R2 score
from sklearn.metrics import r2_score, mean_absolute_error
y_pred = exam_model.predict(X_test)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
print(f"   R2 Score: {r2:.3f}")
print(f"   Mean Absolute Error: {mae:.2f} marks")

joblib.dump(exam_model, 'models/exam_predictor_model.pkl')
print("   ✅ Saved: models/exam_predictor_model.pkl")


# ================================================
# MODEL 4: Query Classifier
# ================================================
print("\n[4/4] Training Query Classifier Model...")

df_query = pd.read_csv('data/query_classifier_data.csv')

X_query = df_query['query']
y_query = df_query['intent']

X_train, X_test, y_train, y_test = train_test_split(
    X_query, y_query, test_size=0.2, random_state=42)

# TF-IDF Vectorizer
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    max_features=5000,
    stop_words='english'
)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Naive Bayes classifier
query_model = MultinomialNB(alpha=0.1)
query_model.fit(X_train_tfidf, y_train)

y_pred = query_model.predict(X_test_tfidf)
accuracy = accuracy_score(y_test, y_pred)
print(f"   Accuracy: {accuracy:.2%}")
print(f"\n   Classification Report:")
print(classification_report(y_test, y_pred))

joblib.dump(query_model, 'models/query_classifier_model.pkl')
joblib.dump(vectorizer, 'models/query_vectorizer.pkl')
print("   ✅ Saved: models/query_classifier_model.pkl")
print("   ✅ Saved: models/query_vectorizer.pkl")


# ================================================
# SUMMARY
# ================================================
print("\n" + "="*50)
print("ALL MODELS TRAINED SUCCESSFULLY!")
print("="*50)
print("\nModels saved in 'models/' folder:")
for f in os.listdir('models'):
    size = os.path.getsize(f'models/{f}') / 1024
    print(f"  {f} ({size:.1f} KB)")
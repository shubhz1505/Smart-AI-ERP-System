# data/generate_data.py
# Generates synthetic student data for training all ML models

import pandas as pd
import numpy as np
import random
from faker import Faker
import os

fake = Faker('en_IN')
np.random.seed(42)
random.seed(42)

print("Generating synthetic student data...")

# ================================================
# DATASET 1: Fee Defaulter Data
# ================================================
def generate_fee_data(n=1000):
    data = []
    
    for i in range(n):
        attendance = round(random.uniform(30, 100), 1)
        semester = random.randint(1, 8)
        pending_amount = random.choice([0, 5000, 10000, 25000, 50000, 75000, 100000])
        days_since_payment = random.randint(0, 120)
        previous_defaults = random.randint(0, 5)
        
        # Logic: high risk if high pending + low attendance + many defaults
        risk_score = 0.0
        
        if pending_amount > 50000:
            risk_score += 0.35
        elif pending_amount > 25000:
            risk_score += 0.20
        elif pending_amount > 0:
            risk_score += 0.10
            
        if attendance < 60:
            risk_score += 0.25
        elif attendance < 75:
            risk_score += 0.15
            
        if days_since_payment > 60:
            risk_score += 0.25
        elif days_since_payment > 30:
            risk_score += 0.15
            
        if previous_defaults >= 3:
            risk_score += 0.20
        elif previous_defaults >= 1:
            risk_score += 0.10
            
        # Add some noise
        risk_score += random.uniform(-0.05, 0.05)
        risk_score = max(0.0, min(1.0, risk_score))
        
        # Label: 1 = defaulted, 0 = paid on time
        defaulted = 1 if risk_score > 0.5 else 0
        
        data.append({
            'attendance_percentage': attendance,
            'pending_amount': pending_amount,
            'days_since_last_payment': days_since_payment,
            'previous_defaults': previous_defaults,
            'semester': semester,
            'defaulted': defaulted,
            'risk_score': round(risk_score, 2)
        })
    
    df = pd.DataFrame(data)
    df.to_csv('data/fee_defaulter_data.csv', index=False)
    print(f"✅ Fee defaulter data: {len(df)} records")
    print(f"   Defaulters: {df['defaulted'].sum()} | Non-defaulters: {(df['defaulted']==0).sum()}")
    return df


# ================================================
# DATASET 2: Attendance Anomaly Data
# ================================================
def generate_attendance_data(n=1000):
    data = []
    
    for i in range(n):
        overall_percentage = round(random.uniform(25, 100), 1)
        consecutive_absences = random.randint(0, 15)
        monday_absences = random.randint(0, 20)
        total_classes = random.randint(30, 80)
        present_classes = int(total_classes * overall_percentage / 100)
        
        # Anomaly types
        low_attendance = 1 if overall_percentage < 75 else 0
        suspicious_pattern = 1 if monday_absences > 8 else 0
        critical = 1 if overall_percentage < 60 else 0
        
        # Combined risk
        risk = 0.0
        if overall_percentage < 60:
            risk = 0.9
        elif overall_percentage < 75:
            risk = 0.6
        elif consecutive_absences > 5:
            risk = 0.5
        elif monday_absences > 8:
            risk = 0.4
        else:
            risk = random.uniform(0.0, 0.3)
            
        risk += random.uniform(-0.05, 0.05)
        risk = max(0.0, min(1.0, risk))
        
        at_risk = 1 if risk > 0.4 else 0
        
        data.append({
            'overall_percentage': overall_percentage,
            'consecutive_absences': consecutive_absences,
            'monday_absences': monday_absences,
            'total_classes': total_classes,
            'present_classes': present_classes,
            'at_risk': at_risk,
            'risk_score': round(risk, 2)
        })
    
    df = pd.DataFrame(data)
    df.to_csv('data/attendance_anomaly_data.csv', index=False)
    print(f"✅ Attendance anomaly data: {len(df)} records")
    print(f"   At risk: {df['at_risk'].sum()} | Safe: {(df['at_risk']==0).sum()}")
    return df


# ================================================
# DATASET 3: Exam Performance Data
# ================================================
def generate_exam_data(n=1000):
    data = []
    
    for i in range(n):
        attendance = round(random.uniform(30, 100), 1)
        assignment_score = round(random.uniform(20, 100), 1)
        midterm_score = round(random.uniform(10, 100), 1)
        quiz_average = round(random.uniform(20, 100), 1)
        study_hours = round(random.uniform(0, 10), 1)
        
        # Predict final score based on these factors
        predicted = (
            attendance * 0.20 +
            assignment_score * 0.25 +
            midterm_score * 0.35 +
            quiz_average * 0.15 +
            study_hours * 0.5
        )
        
        # Add noise
        predicted += random.uniform(-8, 8)
        predicted = max(0, min(100, round(predicted, 1)))
        
        # Risk levels
        if predicted < 40:
            risk_level = 'HIGH'
        elif predicted < 60:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        data.append({
            'attendance_percentage': attendance,
            'assignment_score': assignment_score,
            'midterm_score': midterm_score,
            'quiz_average': quiz_average,
            'study_hours_per_day': study_hours,
            'final_score': predicted,
            'risk_level': risk_level
        })
    
    df = pd.DataFrame(data)
    df.to_csv('data/exam_performance_data.csv', index=False)
    print(f"✅ Exam performance data: {len(df)} records")
    print(f"   High risk: {(df['risk_level']=='HIGH').sum()}")
    print(f"   Medium: {(df['risk_level']=='MEDIUM').sum()}")
    print(f"   Low risk: {(df['risk_level']=='LOW').sum()}")
    return df


# ================================================
# DATASET 4: Query Classifier Data
# ================================================
def generate_query_data():
    queries = {
        'FEE_QUERY': [
            "What is my pending fee amount?",
            "How much fees do I need to pay?",
            "When is my fee due date?",
            "What is my fee status?",
            "Did my payment go through?",
            "How much have I paid so far?",
            "Is my fee paid for this semester?",
            "What are the fee details for semester 5?",
            "Can I pay fees in installments?",
            "My fee receipt is not generated",
            "Show me my payment history",
            "What is my outstanding balance?",
            "Fee deadline reminder please",
            "Is there any late fee penalty?",
            "How do I pay my tuition fees?",
        ],
        'ATTENDANCE_QUERY': [
            "What is my attendance percentage?",
            "How many classes have I attended?",
            "Am I short on attendance?",
            "What is my attendance in Data Structures?",
            "How many leaves can I take?",
            "I was marked absent but was present",
            "Show me my attendance report",
            "What is the minimum attendance required?",
            "My attendance is below 75%",
            "How many classes did I miss this month?",
            "Can I get attendance condonation?",
            "What is my attendance in all subjects?",
            "I need medical leave for attendance",
            "Who marked my attendance today?",
            "Show attendance for last week",
        ],
        'EXAM_QUERY': [
            "When are the exams?",
            "What is the exam schedule?",
            "When is the next internal exam?",
            "What is my predicted exam score?",
            "How should I prepare for exams?",
            "What topics are important for exam?",
            "When will results be declared?",
            "I missed my exam what to do?",
            "Can I apply for revaluation?",
            "What is the passing marks?",
            "Show me my previous exam results",
            "Is there any supplementary exam?",
            "What is the exam hall ticket procedure?",
            "When does exam registration start?",
            "What is the exam pattern?",
        ],
        'CERTIFICATE_REQUEST': [
            "I need a bonafide certificate",
            "How to get transfer certificate?",
            "I need character certificate",
            "Apply for leaving certificate",
            "I need a course completion certificate",
            "How long does certificate take?",
            "I need certificate for bank loan",
            "Apply for no dues certificate",
            "I need caste certificate verification",
            "How to get provisional certificate?",
            "Apply for migration certificate",
            "I need an NOC from college",
            "Request bonafide for passport",
            "Certificate for scholarship application",
            "I need fee payment certificate",
        ],
        'GENERAL_QUERY': [
            "What are college timings?",
            "When does the semester start?",
            "What is the library timing?",
            "How to contact the principal?",
            "What are the hostel rules?",
            "When is the next holiday?",
            "How to apply for scholarship?",
            "What clubs are available?",
            "College bus schedule please",
            "What is the canteen timing?",
            "How to change my address?",
            "I forgot my student ID",
            "How to update my phone number?",
            "What is the dress code?",
            "Sports day schedule?",
        ]
    }
    
    data = []
    for intent, questions in queries.items():
        for q in questions:
            data.append({'query': q, 'intent': intent})
            
            # Add variations
            variations = [
                q.lower(),
                q.upper(),
                "please " + q.lower(),
                q.replace("?", ""),
                "hi " + q.lower(),
            ]
            for v in variations:
                data.append({'query': v, 'intent': intent})
    
    df = pd.DataFrame(data)
    df = df.drop_duplicates()
    df.to_csv('data/query_classifier_data.csv', index=False)
    print(f"✅ Query classifier data: {len(df)} records")
    for intent in queries.keys():
        count = (df['intent'] == intent).sum()
        print(f"   {intent}: {count}")
    return df


# ================================================
# RUN ALL GENERATORS
# ================================================
if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    
    print("\n" + "="*50)
    print("GENERATING SYNTHETIC TRAINING DATA")
    print("="*50 + "\n")
    
    generate_fee_data(1000)
    generate_attendance_data(1000)
    generate_exam_data(1000)
    generate_query_data()
    
    print("\n" + "="*50)
    print("ALL DATA GENERATED SUCCESSFULLY!")
    print("Check the 'data/' folder")
    print("="*50)
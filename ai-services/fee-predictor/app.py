# fee-predictor/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import Optional

app = FastAPI(title="Fee Defaulter Predictor", version="1.0.0")

# Load model at startup
model = joblib.load("../models/fee_defaulter_model.pkl")

class FeeInput(BaseModel):
    studentId: int
    attendancePercentage: float
    pendingAmount: float
    daysSinceLastPayment: int
    previousDefaults: int
    semester: int

class FeeOutput(BaseModel):
    studentId: int
    riskScore: float
    riskLevel: str
    recommendation: str
    shouldSendReminder: bool

@app.get("/health")
def health():
    return {"status": "running", "service": "fee-predictor"}

@app.post("/predict/fee-defaulter", response_model=FeeOutput)
def predict_fee_defaulter(data: FeeInput):

    # Prepare input as DataFrame (matches training feature names)
    input_df = pd.DataFrame([{
        'attendance_percentage': data.attendancePercentage,
        'pending_amount': data.pendingAmount,
        'days_since_last_payment': data.daysSinceLastPayment,
        'previous_defaults': data.previousDefaults,
        'semester': data.semester
    }])

    # Get probability of defaulting
    proba = model.predict_proba(input_df)[0]
    risk_score = round(float(proba[1]), 2)

    # Determine risk level
    if risk_score >= 0.7:
        risk_level = "HIGH"
        recommendation = "Send urgent reminder immediately"
        should_send = True
    elif risk_score >= 0.5:
        risk_level = "MEDIUM"
        recommendation = "Send normal reminder"
        should_send = True
    elif risk_score >= 0.3:
        risk_level = "LOW"
        recommendation = "Monitor student"
        should_send = False
    else:
        risk_level = "SAFE"
        recommendation = "No action needed"
        should_send = False

    return FeeOutput(
        studentId=data.studentId,
        riskScore=risk_score,
        riskLevel=risk_level,
        recommendation=recommendation,
        shouldSendReminder=should_send
    )

@app.post("/predict/fee-defaulter/batch")
def predict_batch(students: list[FeeInput]):
    results = []
    for student in students:
        result = predict_fee_defaulter(student)
        results.append(result)
    return {
        "total": len(results),
        "highRisk": sum(1 for r in results if r.riskLevel == "HIGH"),
        "mediumRisk": sum(1 for r in results if r.riskLevel == "MEDIUM"),
        "predictions": results
    }
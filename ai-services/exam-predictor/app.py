# exam-predictor/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="Exam Performance Predictor", version="1.0.0")

model = joblib.load("../models/exam_predictor_model.pkl")

class ExamInput(BaseModel):
    studentId: int
    attendancePercentage: float
    assignmentScore: float
    midtermScore: float
    quizAverage: float
    studyHoursPerDay: float = 2.0

class ExamOutput(BaseModel):
    studentId: int
    predictedScore: float
    predictedGrade: str
    riskLevel: str
    recommendation: str
    sendAlert: bool

@app.get("/health")
def health():
    return {"status": "running", "service": "exam-predictor"}

@app.post("/predict/exam-performance", response_model=ExamOutput)
def predict_exam(data: ExamInput):

    input_df = pd.DataFrame([{
        'attendance_percentage': data.attendancePercentage,
        'assignment_score': data.assignmentScore,
        'midterm_score': data.midtermScore,
        'quiz_average': data.quizAverage,
        'study_hours_per_day': data.studyHoursPerDay
    }])

    predicted_score = float(model.predict(input_df)[0])
    predicted_score = round(max(0, min(100, predicted_score)), 1)

    # Grade
    if predicted_score >= 90:
        grade = "A+"
    elif predicted_score >= 80:
        grade = "A"
    elif predicted_score >= 70:
        grade = "B"
    elif predicted_score >= 60:
        grade = "C"
    elif predicted_score >= 40:
        grade = "D"
    else:
        grade = "F"

    # Risk and recommendation
    if predicted_score < 40:
        risk_level = "HIGH"
        recommendation = "Immediate intervention needed. Schedule extra classes."
        send_alert = True
    elif predicted_score < 60:
        risk_level = "MEDIUM"
        recommendation = "Student needs improvement. Send study resources."
        send_alert = True
    else:
        risk_level = "LOW"
        recommendation = "Student is on track. Keep monitoring."
        send_alert = False

    return ExamOutput(
        studentId=data.studentId,
        predictedScore=predicted_score,
        predictedGrade=grade,
        riskLevel=risk_level,
        recommendation=recommendation,
        sendAlert=send_alert
    )

@app.post("/predict/exam-performance/batch")
def predict_batch(students: list[ExamInput]):
    results = []
    for student in students:
        result = predict_exam(student)
        results.append(result)
    return {
        "total": len(results),
        "highRisk": sum(1 for r in results if r.riskLevel == "HIGH"),
        "mediumRisk": sum(1 for r in results if r.riskLevel == "MEDIUM"),
        "alertsToSend": sum(1 for r in results if r.sendAlert),
        "predictions": results
    }
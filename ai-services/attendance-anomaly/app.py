from fastapi.middleware.cors import CORSMiddleware
# attendance-anomaly/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="Attendance Anomaly Detector", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])


model = joblib.load("../models/attendance_anomaly_model.pkl")

class AttendanceInput(BaseModel):
    studentId: int
    overallPercentage: float
    consecutiveAbsences: int
    mondayAbsences: int
    totalClasses: int
    presentClasses: int

class AttendanceOutput(BaseModel):
    studentId: int
    riskScore: float
    anomalyType: str
    actionRequired: str
    notifyParent: bool
    flagAdmin: bool

@app.get("/health")
def health():
    return {"status": "running", "service": "attendance-anomaly"}

@app.post("/predict/attendance-anomaly", response_model=AttendanceOutput)
def predict_attendance(data: AttendanceInput):

    input_df = pd.DataFrame([{
        'overall_percentage': data.overallPercentage,
        'consecutive_absences': data.consecutiveAbsences,
        'monday_absences': data.mondayAbsences,
        'total_classes': data.totalClasses,
        'present_classes': data.presentClasses
    }])

    proba = model.predict_proba(input_df)[0]
    risk_score = round(float(proba[1]), 2)

    # Determine anomaly type and actions
    notify_parent = False
    flag_admin = False

    if data.overallPercentage < 60:
        anomaly_type = "CRITICAL_LOW_ATTENDANCE"
        action = "Send urgent warning to student and parent"
        notify_parent = True
        flag_admin = True
    elif data.overallPercentage < 75:
        anomaly_type = "LOW_ATTENDANCE"
        action = "Send warning to student"
        notify_parent = False
        flag_admin = False
    elif data.consecutiveAbsences >= 5:
        anomaly_type = "CONSECUTIVE_ABSENCES"
        action = "Check on student welfare"
        notify_parent = True
        flag_admin = True
    elif data.mondayAbsences > 8:
        anomaly_type = "SUSPICIOUS_PATTERN"
        action = "Flag for admin review"
        notify_parent = False
        flag_admin = True
    else:
        anomaly_type = "NORMAL"
        action = "No action needed"

    return AttendanceOutput(
        studentId=data.studentId,
        riskScore=risk_score,
        anomalyType=anomaly_type,
        actionRequired=action,
        notifyParent=notify_parent,
        flagAdmin=flag_admin
    )

@app.post("/predict/attendance-anomaly/batch")
def predict_batch(students: list[AttendanceInput]):
    results = []
    for student in students:
        result = predict_attendance(student)
        results.append(result)
    return {
        "total": len(results),
        "atRisk": sum(1 for r in results if r.anomalyType != "NORMAL"),
        "needParentNotification": sum(1 for r in results if r.notifyParent),
        "flaggedForAdmin": sum(1 for r in results if r.flagAdmin),
        "predictions": results
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8002)


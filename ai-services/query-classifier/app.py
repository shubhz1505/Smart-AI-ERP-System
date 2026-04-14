# query-classifier/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI(title="Smart Query Classifier", version="1.0.0")

model = joblib.load("../models/query_classifier_model.pkl")
vectorizer = joblib.load("../models/query_vectorizer.pkl")

# Response templates — Spring Boot fills {placeholders} with real DB data
TEMPLATES = {
    "FEE_QUERY": {
        "template": "Your current fee status: Total fee ₹{totalFee}, Paid ₹{paidAmount}, Due ₹{dueAmount}. Due date: {dueDate}.",
        "dataNeeded": ["totalFee", "paidAmount", "dueAmount", "dueDate"],
        "endpoint": "/api/fees/student/{studentId}"
    },
    "ATTENDANCE_QUERY": {
        "template": "Your attendance is {percentage}%. You attended {present} out of {total} classes. Status: {status}.",
        "dataNeeded": ["percentage", "present", "total", "status"],
        "endpoint": "/api/attendance/overall/student/{studentId}"
    },
    "EXAM_QUERY": {
        "template": "Your predicted exam score is {predictedScore}/100 (Grade: {grade}). Risk level: {riskLevel}.",
        "dataNeeded": ["predictedScore", "grade", "riskLevel"],
        "endpoint": "/api/ai/exam-prediction/{studentId}"
    },
    "CERTIFICATE_REQUEST": {
        "template": "Your certificate request has been noted. Admin will process it within 2-3 working days. Please visit the admin office with your ID card.",
        "dataNeeded": [],
        "endpoint": None
    },
    "GENERAL_QUERY": {
        "template": "Thank you for your query. Our admin team will assist you. Please visit the admin office or call the helpdesk.",
        "dataNeeded": [],
        "endpoint": None
    }
}

class QueryInput(BaseModel):
    studentId: int
    question: str

class QueryOutput(BaseModel):
    studentId: int
    question: str
    intent: str
    confidence: float
    autoAnswer: bool
    templateKey: str
    template: str
    dataNeeded: list[str]
    apiEndpoint: str | None
    escalateToAdmin: bool

@app.get("/health")
def health():
    return {"status": "running", "service": "query-classifier"}

@app.post("/classify/query", response_model=QueryOutput)
def classify_query(data: QueryInput):

    vec = vectorizer.transform([data.question])
    intent = model.predict(vec)[0]
    confidence = round(float(model.predict_proba(vec).max()), 4)

    template_info = TEMPLATES.get(intent, TEMPLATES["GENERAL_QUERY"])

    # Auto answer only if high confidence
    auto_answer = confidence >= 0.75
    escalate = confidence < 0.5

    return QueryOutput(
        studentId=data.studentId,
        question=data.question,
        intent=intent,
        confidence=confidence,
        autoAnswer=auto_answer,
        templateKey=intent,
        template=template_info["template"],
        dataNeeded=template_info["dataNeeded"],
        apiEndpoint=template_info["endpoint"],
        escalateToAdmin=escalate
    )
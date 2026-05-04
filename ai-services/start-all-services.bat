@echo off
echo Starting all AI microservices...
start cmd /k "cd C:\Users\DELL\OneDrive\Desktop\PROJECTS\Smart-AI-ERP-System\ai-services\fee-predictor && python -m uvicorn app:app --host 0.0.0.0 --port 8001"
start cmd /k "cd C:\Users\DELL\OneDrive\Desktop\PROJECTS\Smart-AI-ERP-System\ai-services\attendance-anomaly && python -m uvicorn app:app --host 0.0.0.0 --port 8002"
start cmd /k "cd C:\Users\DELL\OneDrive\Desktop\PROJECTS\Smart-AI-ERP-System\ai-services\exam-predictor && python -m uvicorn app:app --host 0.0.0.0 --port 8003"
start cmd /k "cd C:\Users\DELL\OneDrive\Desktop\PROJECTS\Smart-AI-ERP-System\ai-services\query-classifier && python -m uvicorn app:app --host 0.0.0.0 --port 8004"
start cmd /k "cd C:\Users\DELL\OneDrive\Desktop\PROJECTS\Smart-AI-ERP-System\ai-services\ocr-service && python -m uvicorn app:app --host 0.0.0.0 --port 8005"
echo All services started!
pause

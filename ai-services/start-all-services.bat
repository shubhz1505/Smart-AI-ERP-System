@echo off
echo Starting all AI microservices...

start "Fee Predictor - Port 8001" cmd /k "cd fee-predictor && ..\venv\Scripts\activate && uvicorn app:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 2

start "Attendance Anomaly - Port 8002" cmd /k "cd attendance-anomaly && ..\venv\Scripts\activate && uvicorn app:app --host 0.0.0.0 --port 8002 --reload"

timeout /t 2

start "Exam Predictor - Port 8003" cmd /k "cd exam-predictor && ..\venv\Scripts\activate && uvicorn app:app --host 0.0.0.0 --port 8003 --reload"

timeout /t 2

start "Query Classifier - Port 8004" cmd /k "cd query-classifier && ..\venv\Scripts\activate && uvicorn app:app --host 0.0.0.0 --port 8004 --reload"

timeout /t 2

start "OCR Service - Port 8005" cmd /k "cd ocr-service && ..\venv\Scripts\activate && uvicorn app:app --host 0.0.0.0 --port 8005 --reload"

echo.
echo All services starting...
echo Fee Predictor:      http://localhost:8001
echo Attendance Anomaly: http://localhost:8002
echo Exam Predictor:     http://localhost:8003
echo Query Classifier:   http://localhost:8004
echo OCR Service:        http://localhost:8005
echo.
pause
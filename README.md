# 🎓 Smart AI ERP System

<div align="center">

![Java](https://img.shields.io/badge/Java-17%2F26-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.5-brightgreen?style=for-the-badge&logo=springboot)
![Python](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-teal?style=for-the-badge&logo=fastapi)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-orange?style=for-the-badge&logo=scikitlearn)

**An enterprise-grade Student ERP system powered by AI automation, ML predictions, RAG-based chatbot, and automated decision-making — built without any external AI APIs.**

[Features](#-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-endpoints) • [AI Services](#-ai-microservices) • [Screenshots](#-project-structure)

</div>

---

## 🌟 What Makes This Different

Most college projects are CRUD apps. This is not.

This system **thinks and acts automatically**:
- Predicts which students will default on fees **before** they do
- Detects attendance anomalies and warns students automatically
- Predicts exam scores based on internal marks and attendance
- Answers student questions using a RAG chatbot that reads from the actual database
- Scans and extracts data from uploaded documents using OCR
- Runs daily scheduled automation jobs — no admin needed

> **Core philosophy:** AI predicts → Backend decides → System acts automatically

---

## ✨ Features

### 🏫 Core ERP
| Module | Features |
|--------|----------|
| **Authentication** | JWT-based login/register, BCrypt password hashing, role-based access (Admin/Student) |
| **Student Management** | CRUD, soft delete, search by name/roll number, department filter |
| **Fee Management** | Fee creation, payment recording, partial/full payment tracking, overdue detection |
| **Attendance** | Bulk attendance marking, percentage calculation, course-wise tracking |
| **Course Management** | Course catalog, student enrollment, credit tracking |
| **Marks/Grades** | Single/bulk marks entry, auto grade calculation, report card, class topper |
| **Dashboard** | Admin overview dashboard, student personal dashboard |

### 🤖 AI Automation Layer
| Feature | Description |
|---------|-------------|
| **Fee Defaulter Prediction** | Random Forest model predicts risk score (0–1) for each student |
| **Attendance Anomaly Detection** | Flags low attendance, consecutive absences, suspicious patterns |
| **Exam Performance Predictor** | Predicts final exam score from internal marks and attendance |
| **Smart Query Chatbot (RAG)** | Answers student questions using live database data + knowledge base |
| **Document OCR** | Extracts student data from uploaded marksheets and ID cards |
| **Automation Engine** | Spring Boot decision engine — acts on AI predictions automatically |
| **Daily Scheduler** | Runs fee and attendance automation every morning at 9AM and 10AM |
| **Knowledge Base** | Admin uploads college rules/notices; chatbot answers student queries from them |
| **AI Dashboard** | Admin sees all predictions, automation history, high-risk students |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│         React Frontend                          │
└─────────────────────┬───────────────────────────┘
                      │ HTTP Requests
┌─────────────────────▼───────────────────────────┐
│         Spring Boot Backend (Port 5000)          │
│                                                  │
│  Controllers → Services → Repositories           │
│  JWT Security + Role-Based Access Control        │
│  Automation Engine (Decision Maker)              │
│  Daily Scheduler (@Scheduled)                    │
└──────────┬──────────────────────┬────────────────┘
           │                      │
    REST API calls          MySQL Database
           │               (Hostinger Cloud)
┌──────────▼──────────────────────────────────────┐
│         Python FastAPI Microservices             │
│                                                  │
│  Port 8001 → Fee Defaulter Predictor            │
│  Port 8002 → Attendance Anomaly Detector        │
│  Port 8003 → Exam Performance Predictor         │
│  Port 8004 → Smart Query Classifier + RAG       │
│  Port 8005 → Document OCR Service               │
│                                                  │
│  All models trained locally — NO external APIs  │
└─────────────────────────────────────────────────┘
```

### AI Decision Flow
```
Student Data (MySQL)
       ↓
Python ML Model → Risk Score / Prediction
       ↓
Spring Boot Decision Engine
       ↓
Automated Action (Reminder / Warning / Answer)
       ↓
Logged to Database + Shown on AI Dashboard
```

---

## 🛠 Tech Stack

### Backend
- **Java 26** with **Spring Boot 4.0.5**
- **Spring Security 7.0.4** — JWT authentication + role-based access
- **Spring Data JPA** + **Hibernate 7.2.7** — ORM for MySQL
- **Spring WebFlux** — WebClient for calling Python microservices
- **Spring Scheduling** — `@Scheduled` cron jobs
- **Lombok** — boilerplate reduction
- **jjwt 0.11.5** — JWT token generation and validation
- **BCryptPasswordEncoder** — password hashing

### AI/ML Layer
- **Python 3.11+** with **FastAPI**
- **scikit-learn 1.8** — Random Forest, Naive Bayes, TF-IDF
- **pandas + numpy** — data processing
- **joblib** — model serialization (.pkl)
- **Pillow** — image processing for OCR
- **Tesseract OCR** — document text extraction (optional)
- **mysql-connector-python** — direct DB queries in RAG service

### Database
- **MySQL 8.0** hosted on **Hostinger Cloud**
- **19 tables** covering all ERP + AI modules
- **HikariCP** connection pooling

### ML Models (Trained Locally)
| Model | Algorithm | Accuracy |
|-------|-----------|----------|
| Fee Defaulter Predictor | Random Forest Classifier | 94% |
| Attendance Anomaly Detector | Random Forest Classifier | 95.5% |
| Exam Performance Predictor | Random Forest Regressor | R²=0.851, MAE=4.27 |
| Query Intent Classifier | TF-IDF + Naive Bayes | 100% |

---

## 🗂 Project Structure

```
Smart-AI-ERP-System/
│
├── backend/                          # Spring Boot Backend
│   └── src/main/java/com/studenterp/student_erp/
│       ├── config/
│       │   ├── HibernateConfig.java  # JPA + WebClient config
│       │   └── SecurityConfig.java   # JWT + CORS config
│       ├── controller/               # REST API endpoints
│       │   ├── AuthController.java
│       │   ├── StudentController.java
│       │   ├── FeeController.java
│       │   ├── AttendanceController.java
│       │   ├── CourseController.java
│       │   ├── MarksController.java
│       │   ├── DashboardController.java
│       │   ├── AiController.java
│       │   └── HealthController.java
│       ├── service/                  # Business logic
│       │   ├── AuthService.java
│       │   ├── StudentService.java
│       │   ├── FeeService.java
│       │   ├── AttendanceService.java
│       │   ├── CourseService.java
│       │   ├── MarksService.java
│       │   ├── DashboardService.java
│       │   ├── PythonAiClient.java   # Calls Python services
│       │   ├── AutomationEngineService.java  # AI Decision Engine
│       │   ├── SchedulerService.java # Daily automation
│       │   └── AiDashboardService.java
│       ├── entity/                   # Database models
│       │   ├── User.java
│       │   ├── Student.java
│       │   ├── Course.java
│       │   ├── Fee.java
│       │   ├── Payment.java
│       │   ├── Attendance.java
│       │   ├── Enrollment.java
│       │   ├── Marks.java
│       │   ├── AiPrediction.java
│       │   ├── AutomationAction.java
│       │   └── StudentQuery.java
│       ├── repository/               # Spring Data JPA interfaces
│       ├── dto/                      # Request/Response DTOs
│       ├── security/                 # JWT filter + utils
│       └── exception/                # Global exception handler
│
├── ai-services/                      # Python Microservices
│   ├── fee-predictor/
│   │   └── app.py                    # Port 8001
│   ├── attendance-anomaly/
│   │   └── app.py                    # Port 8002
│   ├── exam-predictor/
│   │   └── app.py                    # Port 8003
│   ├── query-classifier/
│   │   ├── app.py                    # Port 8004
│   │   └── rag_service.py            # RAG without external APIs
│   ├── ocr-service/
│   │   └── app.py                    # Port 8005
│   ├── data/
│   │   ├── generate_data.py          # Synthetic training data
│   │   ├── train_models.py           # Train all ML models
│   │   └── test_models.py            # Verify models work
│   ├── models/                       # Trained .pkl files
│   │   ├── fee_defaulter_model.pkl
│   │   ├── attendance_anomaly_model.pkl
│   │   ├── exam_predictor_model.pkl
│   │   ├── query_classifier_model.pkl
│   │   └── query_vectorizer.pkl
│   └── start-all-services.bat        # Start all 5 services
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17 or 26
- Maven 3.8+
- Python 3.11+
- MySQL 8.0
- IntelliJ IDEA (recommended)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Smart-AI-ERP-System.git
cd Smart-AI-ERP-System
```

---

### 2. Database Setup

Create a MySQL database and run the following table creation SQL:

```sql
-- Core tables
CREATE TABLE users ( ... );
CREATE TABLE students ( ... );
CREATE TABLE courses ( ... );
CREATE TABLE enrollments ( ... );
CREATE TABLE fees ( ... );
CREATE TABLE payments ( ... );
CREATE TABLE attendance ( ... );
CREATE TABLE marks ( ... );

-- AI tables
CREATE TABLE ai_predictions ( ... );
CREATE TABLE automation_actions ( ... );
CREATE TABLE student_queries ( ... );
CREATE TABLE document_extractions ( ... );
CREATE TABLE knowledge_base ( ... );
```

> Full SQL scripts available in `/database/` folder.

---

### 3. Configure Spring Boot

Edit `backend/src/main/resources/application.properties`:

```properties
spring.application.name=student-erp
server.port=5000

# Database
spring.datasource.url=jdbc:mysql://YOUR_HOST:3306/YOUR_DB?useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

# JWT
jwt.secret=your-super-secret-key-here
jwt.expiration=604800000

# Python AI Services
ai.fee-predictor.url=http://localhost:8001
ai.attendance-anomaly.url=http://localhost:8002
ai.exam-predictor.url=http://localhost:8003
ai.query-classifier.url=http://localhost:8004
ai.ocr-service.url=http://localhost:8005
```

---

### 4. Set Up Python AI Services

```bash
cd ai-services

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn scikit-learn pandas numpy joblib faker requests python-multipart pillow mysql-connector-python

# Generate training data
python data/generate_data.py

# Train all ML models
python data/train_models.py

# Verify models work
python data/test_models.py
```

Expected output:
```
[1/4] Fee Defaulter Model     → Accuracy: 94.00%
[2/4] Attendance Anomaly Model → Accuracy: 95.50%
[3/4] Exam Performance Model   → R2 Score: 0.851
[4/4] Query Classifier Model   → Accuracy: 100.00%
ALL MODELS TRAINED SUCCESSFULLY!
```

---

### 5. Start All Python Services

**Windows:**
```bash
.\start-all-services.bat
```

**Or manually (one terminal each):**
```bash
cd fee-predictor && uvicorn app:app --port 8001 --reload
cd attendance-anomaly && uvicorn app:app --port 8002 --reload
cd exam-predictor && uvicorn app:app --port 8003 --reload
cd query-classifier && uvicorn app:app --port 8004 --reload
cd ocr-service && uvicorn app:app --port 8005 --reload
```

Verify all services:
```
GET http://localhost:8001/health  → {"status": "running"}
GET http://localhost:8002/health  → {"status": "running"}
GET http://localhost:8003/health  → {"status": "running"}
GET http://localhost:8004/health  → {"status": "running"}
GET http://localhost:8005/health  → {"status": "running"}
```

---

### 6. Start Spring Boot Backend

```bash
cd backend
mvn spring-boot:run
```

Server starts at: `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

---

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| GET | `/api/auth/profile` | Get current user profile | Required |
| GET | `/api/auth/me` | Get logged in user info | Required |

### Students
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/students` | Get all students | Admin |
| GET | `/api/students/{id}` | Get student by ID | Any |
| GET | `/api/students/user/{userId}` | Get by user ID | Any |
| POST | `/api/students` | Create student | Admin |
| PUT | `/api/students/{id}` | Update student | Admin |
| DELETE | `/api/students/{id}` | Soft delete | Admin |
| GET | `/api/students/search?query=` | Search students | Admin |

### Fees
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/fees` | All fees | Admin |
| GET | `/api/fees/{id}` | Single fee | Any |
| GET | `/api/fees/student/{id}` | Student fees | Any |
| POST | `/api/fees` | Create fee | Admin |
| PUT | `/api/fees/{id}` | Update fee | Admin |
| DELETE | `/api/fees/{id}` | Delete fee | Admin |
| POST | `/api/fees/{id}/payment` | Record payment | Admin |
| GET | `/api/fees/statistics` | Fee statistics | Admin |
| GET | `/api/fees/pending` | Pending fees | Admin |
| GET | `/api/fees/overdue` | Overdue fees | Admin |
| GET | `/api/fees/{id}/payments` | Payment history | Any |

### Attendance
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/attendance/mark` | Mark attendance (bulk) | Admin |
| GET | `/api/attendance/student/{id}` | Student attendance | Any |
| GET | `/api/attendance/course/{id}` | Course attendance | Admin |
| GET | `/api/attendance/date/{date}` | By date | Admin |
| GET | `/api/attendance/percentage/student/{id}/course/{id}` | Percentage | Any |
| GET | `/api/attendance/overall/student/{id}` | Overall % | Any |

### Marks
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/marks` | Add single marks | Admin |
| POST | `/api/marks/bulk` | Add marks for entire class | Admin |
| GET | `/api/marks/{id}` | Get single entry | Any |
| GET | `/api/marks/student/{id}` | All marks for student | Any |
| GET | `/api/marks/student/{id}/semester/{sem}` | By semester | Any |
| GET | `/api/marks/course/{id}` | Course marks | Admin |
| GET | `/api/marks/report-card/{id}` | Full report card | Any |
| GET | `/api/marks/statistics/course/{id}` | Course stats | Admin |
| GET | `/api/marks/topper/course/{id}` | Class topper | Any |
| PUT | `/api/marks/{id}` | Update marks | Admin |
| DELETE | `/api/marks/{id}` | Delete marks | Admin |

### Courses
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/courses` | All courses | Any |
| GET | `/api/courses/{id}` | Single course | Any |
| POST | `/api/courses` | Create course | Admin |
| PUT | `/api/courses/{id}` | Update course | Admin |
| DELETE | `/api/courses/{id}` | Delete course | Admin |
| POST | `/api/courses/{id}/enroll/{studentId}` | Enroll student | Admin |
| GET | `/api/courses/student/{id}` | Student courses | Any |

### Dashboard
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/dashboard/admin` | Admin dashboard | Admin |
| GET | `/api/dashboard/student/{id}` | Student dashboard | Any |

### AI & Automation
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/ai/automation/fees` | Trigger fee automation | Admin |
| POST | `/api/ai/automation/attendance` | Trigger attendance check | Admin |
| POST | `/api/ai/query` | Student chatbot query | Any |
| POST | `/api/ai/exam-prediction/{id}` | Predict exam score | Any |
| GET | `/api/ai/dashboard` | AI dashboard | Admin |
| GET | `/api/ai/profile/student/{id}` | Student AI profile | Any |
| GET | `/api/ai/automation/history` | Automation history | Admin |
| GET | `/api/ai/services/health` | Python services status | Admin |
| GET | `/api/ai/students/high-risk` | High risk students | Admin |
| GET | `/api/ai/queries/escalated` | Escalated queries | Admin |

---

## 🤖 AI Microservices

### Service 1 — Fee Defaulter Predictor (Port 8001)

Predicts probability of a student defaulting on fees.

```json
POST http://localhost:8001/predict/fee-defaulter

{
    "studentId": 1,
    "attendancePercentage": 60.0,
    "pendingAmount": 50000,
    "daysSinceLastPayment": 25,
    "previousDefaults": 2,
    "semester": 5
}
```

Response:
```json
{
    "studentId": 1,
    "riskScore": 0.87,
    "riskLevel": "HIGH",
    "recommendation": "Send urgent reminder immediately",
    "shouldSendReminder": true
}
```

Spring Boot automation rules:
- `riskScore > 0.7` → Send urgent reminder
- `riskScore > 0.5` → Send normal reminder
- `riskScore < 0.5` → No action

---

### Service 2 — Attendance Anomaly Detector (Port 8002)

Detects students with attendance problems or suspicious patterns.

```json
POST http://localhost:8002/predict/attendance-anomaly

{
    "studentId": 1,
    "overallPercentage": 62.0,
    "consecutiveAbsences": 4,
    "mondayAbsences": 8,
    "totalClasses": 50,
    "presentClasses": 31
}
```

Response:
```json
{
    "studentId": 1,
    "riskScore": 0.96,
    "anomalyType": "LOW_ATTENDANCE",
    "actionRequired": "Send warning to student",
    "notifyParent": false,
    "flagAdmin": false
}
```

---

### Service 3 — Exam Performance Predictor (Port 8003)

Predicts final exam score before exams happen.

```json
POST http://localhost:8003/predict/exam-performance

{
    "studentId": 1,
    "attendancePercentage": 72.0,
    "assignmentScore": 65.0,
    "midtermScore": 48.0,
    "quizAverage": 55.0,
    "studyHoursPerDay": 2.0
}
```

Response:
```json
{
    "studentId": 1,
    "predictedScore": 58.0,
    "predictedGrade": "C",
    "riskLevel": "MEDIUM",
    "recommendation": "Student needs improvement. Send study resources.",
    "sendAlert": true
}
```

---

### Service 4 — Smart Query Classifier + RAG (Port 8004)

Classifies student questions and answers using live database data and knowledge base. **No external AI API needed.**

```json
POST http://localhost:8004/classify/query

{
    "studentId": 1,
    "question": "What is my attendance percentage?",
    "studentName": "Aryan Nagare",
    "department": "CSE",
    "semester": 6
}
```

Response:
```json
{
    "intent": "ATTENDANCE_QUERY",
    "confidence": 0.9940,
    "autoAnswer": true,
    "response": "📊 Attendance Report for Aryan:\n\n• Total Classes: 50\n• Classes Attended: 38\n• Attendance: 76.0%\n• Status: ✅ Safe",
    "ragUsed": true,
    "method": "direct_db_query"
}
```

**How the RAG works (no Gemini/OpenAI needed):**
```
Fee/Attendance/Marks queries → Query MySQL directly → Return real data
General queries → Search knowledge_base table → Extract relevant lines → Return answer
```

---

### Service 5 — Document OCR (Port 8005)

Extracts data from uploaded documents.

```
POST http://localhost:8005/extract/document
Body: form-data
  file: [marksheet image]
  documentType: marksheet
  title: Swimming Pool Rules
  category: facilities
  saveToKnowledgeBase: true
```

Supported document types: `marksheet`, `id_card`, `fee_receipt`, `rule`, `notice`, `general`

---

## 🗄 Database Schema

### Core Tables (8)
| Table | Purpose |
|-------|---------|
| `users` | Login credentials with role |
| `students` | Student personal information |
| `courses` | Course catalog |
| `enrollments` | Student-course relationships |
| `fees` | Fee records per semester |
| `payments` | Individual payment transactions |
| `attendance` | Daily attendance records |
| `marks` | Exam and assignment marks |

### AI Tables (5)
| Table | Purpose |
|-------|---------|
| `ai_predictions` | Log of all ML model predictions |
| `automation_actions` | Log of all automated actions taken |
| `student_queries` | Chatbot questions and answers |
| `document_extractions` | OCR results from uploaded documents |
| `knowledge_base` | College rules/notices for chatbot RAG |

---

## 🔐 Security

- **JWT Authentication** — stateless, tokens expire in 7 days
- **BCrypt Password Hashing** — industry-standard one-way hashing
- **Role-Based Access Control** — `admin` and `student` roles
- **Spring Security Filter Chain** — every request validated
- **CORS Configuration** — configured for frontend at `localhost:3000`

### Token Usage
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

Public routes (no token needed):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /health`

---

## 🤖 How Automation Works

The **Automation Engine** (`AutomationEngineService.java`) is the heart of the AI system.

### Daily Fee Automation (9:00 AM)
```
1. Fetch all students with pending fees
2. Calculate attendance % and days since payment
3. Call Python fee predictor → get risk score
4. Apply rules:
   riskScore > 0.7 → URGENT_REMINDER_SENT
   riskScore > 0.5 → NORMAL_REMINDER_SENT
   riskScore < 0.5 → No action
5. Save action to automation_actions table
6. Save prediction to ai_predictions table
```

### Daily Attendance Automation (10:00 AM)
```
1. Fetch all active students
2. Calculate attendance metrics
3. Call Python anomaly detector
4. Apply rules:
   < 60%  → Critical warning + notify parent
   < 75%  → Warning to student
   Consecutive absences > 5 → Flag admin
5. Log all actions to database
```

### Real-time Chatbot
```
1. Student sends question
2. ML model classifies intent (100% accuracy)
3. Fee/Attendance/Marks → Query MySQL live data
4. General queries → Search knowledge_base → Extract answer
5. Low confidence → Escalate to admin
6. Save Q&A to student_queries table
```

---

## 📊 Grade System

Marks module uses this grading scale:

| Percentage | Grade |
|------------|-------|
| 90 – 100 | A+ |
| 80 – 89 | A |
| 70 – 79 | B+ |
| 60 – 69 | B |
| 50 – 59 | C |
| 40 – 49 | D |
| Below 40 | F |

---

## 🧪 Testing

### Postman Collection

Import our Postman collection and test all 55+ endpoints.

**Quick test flow:**

1. Register admin user
2. Login → copy JWT token
3. Create a course
4. Register a student
5. Enroll student in course
6. Mark attendance
7. Add marks
8. Start Python services
9. Trigger AI automation
10. Ask chatbot a question

---

## 🔧 Troubleshooting

### Common Issues

**Database connection refused**
```
Solution: Add your current IP to Hostinger Remote MySQL
Hostinger → Databases → Remote MySQL → Add IP
```

**JWT token expired (401 error)**
```
Solution: Login again to get a fresh token
Tokens expire after 7 days
```

**Python service not found**
```
Solution: Activate venv before running
.\venv\Scripts\Activate.ps1
uvicorn app:app --port 800X --reload
```

**`uvicorn` not recognized**
```
Solution: Use full path to venv uvicorn
C:\path\to\venv\Scripts\uvicorn.exe app:app --port 8001
```

**Build failed — @Builder.Default warning**
```
Solution: Add @Builder.Default to entity fields with default values
@Builder.Default
private Status status = Status.active;
```

**`No module named mysql`**
```
Solution: pip install mysql-connector-python
```

---

## 📈 Project Stats

```
Total REST APIs:         55+
Spring Boot Services:     8
Python Microservices:     5
ML Models Trained:        4
Database Tables:         19
Lines of Java Code:    ~3500
Lines of Python Code:  ~1500
Training Data Records:  3427
```

---

## 🛣 Roadmap

- [ ] React Frontend (Admin + Student dashboards)
- [ ] Email/SMS notifications for automation actions
- [ ] Deploy Spring Boot to Railway/Render
- [ ] Deploy Python services to Railway
- [ ] Swagger/OpenAPI documentation
- [ ] JUnit + Mockito unit tests
- [ ] Docker containerization
- [ ] Real Tesseract OCR integration
- [ ] Student mobile app (React Native)

---

## 👨‍💻 Authors

**Shubham** — Backend Developer
- Java Spring Boot architecture
- AI automation engine design
- Python ML microservices
- Database design

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- scikit-learn for making ML accessible
- FastAPI for the lightning-fast Python APIs
- Hostinger for affordable cloud MySQL hosting
- The entire open-source community

---

<div align="center">


*"Not just a CRUD app — an AI-powered automation system"*

</div>

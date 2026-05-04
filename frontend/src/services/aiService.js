// frontend/src/services/aiService.js
import api from './api'

// ── ALL AI calls go through Spring Boot only ──────────────────────────
// Spring Boot persists every prediction / action / query to the database
// before returning the response. NEVER call Python microservices directly.

export const aiService = {
  // Automation (Spring Boot → Python → DB)
  triggerFeeAutomation:        ()         => api.post('/api/ai/automation/fees').then(r => r.data),
  triggerAttendanceAutomation: ()         => api.post('/api/ai/automation/attendance').then(r => r.data),

  // Smart query classifier (saves to chat_logs)
  studentQuery: (data) => api.post('/api/ai/query', data).then(r => r.data),

  // Exam prediction (saves to ai_predictions)
  examPrediction: (studentId, data) =>
    api.post(`/api/ai/exam-prediction/${studentId}`, data).then(r => r.data),

  // Dashboards & history (read from DB)
  getDashboard:          ()  => api.get('/api/ai/dashboard').then(r => r.data),
  getStudentAiProfile:   (id) => api.get(`/api/ai/profile/student/${id}`).then(r => r.data),
  getAutomationHistory:  ()  => api.get('/api/ai/automation/history').then(r => r.data),
  getEscalatedQueries:   ()  => api.get('/api/ai/queries/escalated').then(r => r.data),
  getHighRiskStudents: () => api.get('/api/ai/students/high-risk').then(r => {
  const result = r.data?.data
  return Array.isArray(result) ? result : []
}),

  // Health check (Spring Boot probes Python and returns aggregated status)
  getServicesHealth:     ()  => api.get('/api/ai/services/health').then(r => r.data),
}
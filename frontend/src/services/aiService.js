import api from './api'

export const aiService = {
  predictFeeDefault:        (studentId) => api.post('/api/ai/predict/fee-default', { studentId }).then(r => r.data),
  runFeeAutomation:         ()          => api.post('/api/ai/automation/fees').then(r => r.data),
  detectAttendanceAnomalies:()          => api.post('/api/ai/automation/attendance').then(r => r.data),
  predictPerformance:       (studentId) => api.post('/api/ai/predict/performance', { studentId }).then(r => r.data),
  classifyQuery:            (studentId, question) => api.post('/api/ai/query', { studentId, question }).then(r => r.data),
  getPredictions:           ()          => api.get('/api/ai/predictions').then(r => r.data),
  getAutomationLogs:        ()          => api.get('/api/ai/automation/logs').then(r => r.data),
}
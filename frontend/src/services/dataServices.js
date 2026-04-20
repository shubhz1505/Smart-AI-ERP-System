import api from './api'

export const feeService = {
  getAll:        ()         => api.get('/api/fees').then(r => r.data),
  getById:       (id)       => api.get(`/api/fees/${id}`).then(r => r.data),
  getByStudent:  (id)       => api.get(`/api/fees/student/${id}`).then(r => r.data),
  create:        (data)     => api.post('/api/fees', data).then(r => r.data),
  update:        (id, data) => api.put(`/api/fees/${id}`, data).then(r => r.data),
  delete:        (id)       => api.delete(`/api/fees/${id}`).then(r => r.data),
  recordPayment: (id, data) => api.post(`/api/fees/${id}/payment`, data).then(r => r.data),
  getStatistics: ()         => api.get('/api/fees/statistics').then(r => r.data),
  getPending:    ()         => api.get('/api/fees/pending').then(r => r.data),
  getOverdue:    ()         => api.get('/api/fees/overdue').then(r => r.data),
  getPayments:   (id)       => api.get(`/api/fees/${id}/payments`).then(r => r.data),
}

export const courseService = {
  getAll:       ()                => api.get('/api/courses').then(r => r.data),
  getById:      (id)              => api.get(`/api/courses/${id}`).then(r => r.data),
  create:       (data)            => api.post('/api/courses', data).then(r => r.data),
  update:       (id, data)        => api.put(`/api/courses/${id}`, data).then(r => r.data),
  delete:       (id)              => api.delete(`/api/courses/${id}`).then(r => r.data),
  enroll:       (courseId, stuId) => api.post(`/api/courses/${courseId}/enroll/${stuId}`).then(r => r.data),
  getByStudent: (id)              => api.get(`/api/courses/student/${id}`).then(r => r.data),
}

export const attendanceService = {
  mark:          (data)            => api.post('/api/attendance/mark', data).then(r => r.data),
  getByStudent:  (id)              => api.get(`/api/attendance/student/${id}`).then(r => r.data),
  getByCourse:   (id)              => api.get(`/api/attendance/course/${id}`).then(r => r.data),
  getByDate:     (date)            => api.get(`/api/attendance/date/${date}`).then(r => r.data),
  getPercentage: (stuId, courseId) => api.get(`/api/attendance/percentage/student/${stuId}/course/${courseId}`).then(r => r.data),
  getOverall:    (id)              => api.get(`/api/attendance/overall/student/${id}`).then(r => r.data),
}

export const dashboardService = {
  getAdmin:   ()   => api.get('/api/dashboard/admin').then(r => r.data),
  getStudent: (id) => api.get(`/api/dashboard/student/${id}`).then(r => r.data),
}
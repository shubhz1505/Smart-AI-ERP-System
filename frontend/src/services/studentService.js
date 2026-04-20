import api from './api'

export const studentService = {
  getAll:      (params) => api.get('/api/students', { params }).then(r => r.data),
  getById:     (id)     => api.get(`/api/students/${id}`).then(r => r.data),
  getByUserId: (userId) => api.get(`/api/students/user/${userId}`).then(r => r.data),
  create:      (data)   => api.post('/api/students', data).then(r => r.data),
  update:      (id, data) => api.put(`/api/students/${id}`, data).then(r => r.data),
  delete:      (id)     => api.delete(`/api/students/${id}`).then(r => r.data),
  search:      (q)      => api.get('/api/students/search', { params: { q } }).then(r => r.data),
}
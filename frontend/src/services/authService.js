import api from './api'

export const authService = {
  login:           (credentials) => api.post('/api/auth/login', credentials).then(r => r.data),
  register:        (data)        => api.post('/api/auth/register', data).then(r => r.data),
  getProfile:      ()            => api.get('/api/auth/profile').then(r => r.data),
  getMe:           ()            => api.get('/api/auth/me').then(r => r.data),
  changePassword:  (data)        => api.post('/api/auth/change-password', data).then(r => r.data),
}
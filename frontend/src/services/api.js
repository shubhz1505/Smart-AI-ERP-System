import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(config => {
  try {
    const auth = JSON.parse(localStorage.getItem('erp-auth') || '{}')
    const token = auth?.state?.token
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (e) {
    console.warn('Could not read token from storage', e)
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('erp-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
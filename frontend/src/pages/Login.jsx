import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      })

      // Backend shape: { success, message, data: { token, id, email, role, firstName, lastName } }
      const body  = res.data
      const inner = body?.data

      const token =
        inner?.token       ||
        inner?.accessToken ||
        body?.token        ||
        body?.accessToken  ||
        null

      if (!token) {
        toast.error('Login failed: no token received')
        console.error('Full response was:', body)
        return
      }

      const user = {
        id:    inner?.id,
        name:  `${inner?.firstName || ''} ${inner?.lastName || ''}`.trim() || inner?.email || email,
        email: inner?.email || email,
        role:  (inner?.role || 'admin').toLowerCase(),
      }

      setAuth(token, user)
      toast.success(`Welcome back, ${user.name || user.email}!`)
      navigate('/dashboard')
      // Get student ID after login
if ((userData?.role || 'student').toLowerCase() === 'student') {
  try {
    const studentRes = await axios.get(
      `http://localhost:5000/api/students/user/${userData?.id || ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const studentData = studentRes.data?.data || studentRes.data
    setAuth(token, { 
      ...user, 
      studentId: studentData?.id,
      name: `${studentData?.firstName || ''} ${studentData?.lastName || ''}`.trim() || user.name
    })
  } catch (e) {
    console.log('Could not fetch student ID', e)
  }
}

    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to backend. Is Spring Boot running on port 5000?')
      } else {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error   ||
          'Invalid email or password'
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#6c63ff,#06b6d4)' }}
        >
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-white text-lg">EduCore</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">AI-Powered ERP</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-display text-xl font-bold text-white mb-1">Sign in</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

        <div className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@school.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-purple-400 hover:text-purple-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
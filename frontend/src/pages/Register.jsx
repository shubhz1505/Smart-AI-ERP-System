import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

export default function Register() {
  const [form, setForm] = useState({
    fullName:   '',
    email:      '',
    password:   '',
    role:       'student',
    rollNumber: '',
    department: '',
    phone:      '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleRegister = async () => {
    if (!form.fullName.trim() || !form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (form.role === 'student' && !form.rollNumber.trim()) {
      toast.error('Roll number is required for students')
      return
    }

    const parts     = form.fullName.trim().split(' ')
    const firstName = parts[0]
    const lastName  = parts.slice(1).join(' ') || parts[0]

    setLoading(true)
    try {
      const payload = {
        firstName,
        lastName,
        email:    form.email,
        password: form.password,
        role:     form.role,
      }

      // Only send student fields if role is student
      if (form.role === 'student') {
        payload.rollNumber = form.rollNumber
        payload.department = form.department
        payload.phone      = form.phone
      }

      const res = await axios.post('http://localhost:5000/api/auth/register', payload)

      const body  = res.data
      const inner = body?.data

      const token =
        inner?.token       ||
        inner?.accessToken ||
        body?.token        ||
        null

      if (!token) {
        toast.error('Registration failed: no token received')
        return
      }

      const user = {
        id:    inner?.id,
        name:  `${inner?.firstName || firstName} ${inner?.lastName || lastName}`.trim(),
        email: inner?.email || form.email,
        role:  (inner?.role || form.role).toLowerCase(),
      }

      setAuth(token, user)
      toast.success('Account created! Welcome to EduCore.')
      navigate('/dashboard')

    } catch (err) {
      console.error('Register error:', err)
      if (err.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to backend. Is Spring Boot running on port 5000?')
      } else {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error   ||
          'Registration failed'
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
        <h2 className="font-display text-xl font-bold text-white mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-6">Get started with EduCore ERP</p>

        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" value={form.fullName}
              onChange={update('fullName')} placeholder="John Doe" />
          </div>

          <div>
            <label className="label">Email address</label>
            <input type="email" className="input" value={form.email}
              onChange={update('email')} placeholder="john@school.com" />
          </div>

          <div>
            <label className="label">Password <span className="text-gray-600 text-xs">(min 8 characters)</span></label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={update('role')}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Student-only fields */}
          {form.role === 'student' && (
            <>
              <div>
                <label className="label">Roll Number</label>
                <input type="text" className="input" value={form.rollNumber}
                  onChange={update('rollNumber')} placeholder="e.g. CS2024001" />
              </div>
              <div>
                <label className="label">Department</label>
                <input type="text" className="input" value={form.department}
                  onChange={update('department')} placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="label">Phone <span className="text-gray-600 text-xs">(optional)</span></label>
                <input type="text" className="input" value={form.phone}
                  onChange={update('phone')} placeholder="e.g. 9876543210" />
              </div>
            </>
          )}

          <button type="button" onClick={handleRegister} disabled={loading}
            className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
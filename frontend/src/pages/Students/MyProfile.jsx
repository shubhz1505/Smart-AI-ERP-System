import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { studentService } from '../../services/studentService'
import { Spinner } from '../../components/ui'
import { Mail, Phone, MapPin, BookOpen, User, Hash, Building, Calendar } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function MyProfile() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: () => studentService.getByUserId(user?.id),
    retry: 1,
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
  })

  if (isLoading) return <Spinner />

  const student = data?.data || data || {}

  const infoItems = [
    { icon: User,     label: 'Full Name',    value: `${student.firstName || ''} ${student.lastName || ''}`.trim() || '—' },
    { icon: Hash,     label: 'Roll Number',  value: student.rollNumber   || '—' },
    { icon: Mail,     label: 'Email',        value: student.email        || user?.email || '—' },
    { icon: Phone,    label: 'Phone',        value: student.phone        || '—' },
    { icon: Building, label: 'Department',   value: student.department   || '—' },
    { icon: BookOpen, label: 'Semester',     value: student.semester     ? `Semester ${student.semester}` : '—' },
    { icon: Calendar, label: 'Academic Year',value: student.academicYear || '—' },
    { icon: MapPin,   label: 'Address',      value: student.address      || '—' },
  ]

  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() ||
                   (user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST')

  return (
    <div className="page-wrapper space-y-5 max-w-full">

      {/* Profile Header */}
      <div className="rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #1a73e8 0%, #0891b2 100%)', boxShadow: '0 4px 20px rgba(26,115,232,0.25)' }}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)' }}>
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-white">
              {`${student.firstName || ''} ${student.lastName || ''}`.trim() || user?.name || 'Student'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {student.email || user?.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[student.rollNumber, student.department, `Semester ${student.semester || 'N/A'}`, student.status || 'active'].map((tag, i) => (
                tag && <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#dbeafe' }}>
            <User size={15} style={{ color: '#1d4ed8' }} />
          </div>
          <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {infoItems.map(item => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#eff6ff' }}>
                <item.icon size={14} style={{ color: '#1a73e8' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{item.label}</p>
                <p className="text-sm font-medium mt-0.5 truncate" style={{ color: '#0f172a' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
            <User size={15} style={{ color: '#16a34a' }} />
          </div>
          <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Parent / Guardian Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Phone, label: 'Parent Phone', value: student.parentPhone || '—' },
            { icon: Mail,  label: 'Parent Email', value: student.parentEmail || '—' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#f0fdf4' }}>
                <item.icon size={14} style={{ color: '#16a34a' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{item.label}</p>
                <p className="text-sm font-medium mt-0.5 truncate" style={{ color: '#0f172a' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fef3c7' }}>
            <Hash size={15} style={{ color: '#d97706' }} />
          </div>
          <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Account Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Email',           value: user?.email || '—' },
            { label: 'Role',            value: user?.role  || 'student' },
            { label: 'Account Status',  value: 'Active' },
            { label: 'Enrollment Date', value: student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('en-IN') : '—' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{item.label}</p>
              <p className="text-sm font-medium mt-0.5 capitalize" style={{ color: '#0f172a' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <ChangePassword />
    </div>
  )
}

// ── ChangePassword — all imports at file top level ────────────────────────────
function ChangePassword() {
  const { user } = useAuthStore()
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleChange = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Please fill all fields'); return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/change-password', {
        email:           user?.email,
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })
      toast.success('Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fee2e2' }}>
          <User size={15} style={{ color: '#dc2626' }} />
        </div>
        <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Change Password</h2>
      </div>
      <div className="space-y-3 max-w-sm">
        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input" value={form.currentPassword}
            onChange={set('currentPassword')} placeholder="••••••••" />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input" value={form.newPassword}
            onChange={set('newPassword')} placeholder="••••••••" />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input type="password" className="input" value={form.confirmPassword}
            onChange={set('confirmPassword')} placeholder="••••••••" />
        </div>
        <button type="button" onClick={handleChange} disabled={loading} className="btn-primary">
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  )
}
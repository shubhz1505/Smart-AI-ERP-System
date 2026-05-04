import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { studentService } from '../../services/studentService'
import { SectionHeader, Spinner } from '../../components/ui'
import { User, Mail, Phone, MapPin, Lock, Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function StudentSettings() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const [editMode, setEditMode] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileForm, setProfileForm] = useState(null)

  // Fetch student profile
const { data: studentRes, isLoading } = useQuery({
  queryKey: ['student-profile', user?.id],
  queryFn: () => studentService.getByUserId(user?.id),
  enabled: !!user?.id,
  retry: 1,
  onSuccess: (res) => {
    const data = res?.data || {}
    setProfileForm({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      address: data.address || '',
      parentPhone: data.parentPhone || '',
      parentEmail: data.parentEmail || '',
    })
  },
})

const student = studentRes?.data || {}

  // Initialize form when data loads
  const form = profileForm || {
    firstName:   student?.firstName   || '',
    lastName:    student?.lastName    || '',
    phone:       student?.phone       || '',
    address:     student?.address     || '',
    parentPhone: student?.parentPhone || '',
    parentEmail: student?.parentEmail || '',
  }

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data) => studentService.update(student?.id, data),
    onSuccess: () => {
      qc.invalidateQueries(['student-profile', user?.id])
      toast.success('Profile updated successfully!')
      setEditMode(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  })

  // Change password mutation
  const passMutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/change-password', data).then(r => r.data),
    onSuccess: () => {
      toast.success('Password changed successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  })

  const handleProfileSave = (e) => {
    e.preventDefault()
    if (!student?.id) { toast.error('Student ID not found'); return }
    updateMutation.mutate({ ...student, ...form })
  }

  const handlePassChange = (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    passMutation.mutate({
      email:           user?.email,
      currentPassword: passForm.currentPassword,
      newPassword:     passForm.newPassword,
    })
  }

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-5 w-full">

      <div>
        <h2 className="section-title">Settings</h2>
        <p className="section-sub">Manage your profile and account settings</p>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, #1a73e8, #0891b2)',
          boxShadow: '0 4px 20px rgba(26,115,232,0.25)',
        }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          {`${student?.firstName?.[0] || ''}${student?.lastName?.[0] || ''}`.toUpperCase() || user?.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-display font-bold text-white text-lg">
            {student?.firstName} {student?.lastName}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              {student?.rollNumber || 'Student'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              Sem {student?.semester || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Personal Information" sub="Update your profile details" />
          {!editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="btn-secondary text-xs flex items-center gap-2"
            >
              <User size={13} /> Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="label">First Name</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                     style={{ color: '#94a3b8' }} />
                <input
                  className="input pl-9"
                  value={form.firstName}
                  onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
                  disabled={!editMode}
                  style={{ background: editMode ? '#ffffff' : '#f8fafc' }}
                />
              </div>
            </div>

            <div>
              <label className="label">Last Name</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                     style={{ color: '#94a3b8' }} />
                <input
                  className="input pl-9"
                  value={form.lastName}
                  onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
                  disabled={!editMode}
                  style={{ background: editMode ? '#ffffff' : '#f8fafc' }}
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                     style={{ color: '#94a3b8' }} />
                <input
                  className="input pl-9"
                  value={user?.email || ''}
                  disabled
                  style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#94a3b8' }} />
                <input
                  className="input pl-9"
                  value={form.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  disabled={!editMode}
                  placeholder="9876543210"
                  style={{ background: editMode ? '#ffffff' : '#f8fafc' }}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-3"
                       style={{ color: '#94a3b8' }} />
                <textarea
                  className="input pl-9 resize-none"
                  rows={2}
                  value={form.address}
                  onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                  disabled={!editMode}
                  placeholder="Your address"
                  style={{ background: editMode ? '#ffffff' : '#f8fafc' }}
                />
              </div>
            </div>

            <div>
              <label className="label">Parent Phone</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#94a3b8' }} />
                <input
                  className="input pl-9"
                  value={form.parentPhone}
                  onChange={e => setProfileForm(f => ({ ...f, parentPhone: e.target.value }))}
                  disabled={!editMode}
                  placeholder="Parent phone number"
                  style={{ background: editMode ? '#ffffff' : '#f8fafc' }}
                />
              </div>
            </div>

            <div>
              <label className="label">Parent Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                     style={{ color: '#94a3b8' }} />
                <input
                  className="input pl-9"
                  value={form.parentEmail}
                  onChange={e => setProfileForm(f => ({ ...f, parentEmail: e.target.value }))}
                  disabled={!editMode}
                  placeholder="Parent email"
                  style={{ background: editMode ? '#ffffff' : '#f8fafc' }}
                />
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={14} />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false)
                  setProfileForm(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <SectionHeader title="Change Password" sub="Update your login password" />
        <form onSubmit={handlePassChange} className="space-y-4 mt-2 max-w-sm">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                   style={{ color: '#94a3b8' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="input pl-9 pr-10"
                value={passForm.currentPassword}
                onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#94a3b8' }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                   style={{ color: '#94a3b8' }} />
              <input
                type="password"
                className="input pl-9"
                value={passForm.newPassword}
                onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                   style={{ color: '#94a3b8' }} />
              <input
                type="password"
                className="input pl-9"
                value={passForm.confirmPassword}
                onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {passForm.newPassword && passForm.confirmPassword &&
           passForm.newPassword !== passForm.confirmPassword && (
            <p className="text-xs" style={{ color: '#dc2626' }}>
              Passwords do not match
            </p>
          )}

          <button
            type="submit"
            disabled={passMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Lock size={14} />
            {passMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Read-only Academic Info */}
      <div className="card">
        <SectionHeader title="Academic Details" sub="Contact admin to update these details" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Roll Number',   value: student?.rollNumber  },
            { label: 'Department',    value: student?.department  },
            { label: 'Semester',      value: student?.semester ? `Semester ${student.semester}` : null },
            { label: 'Academic Year', value: student?.academicYear },
            { label: 'Status',        value: student?.status      },
            { label: 'Student ID',    value: student?.id ? `#${student.id}` : null },
          ].map(item => (
            <div
              key={item.label}
              className="p-3 rounded-xl"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                 style={{ color: '#94a3b8' }}>
                {item.label}
              </p>
              <p className="text-sm font-medium capitalize"
                 style={{ color: item.value ? '#0f172a' : '#94a3b8' }}>
                {item.value || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
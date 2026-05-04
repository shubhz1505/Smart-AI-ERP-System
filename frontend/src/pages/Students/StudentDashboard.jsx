import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { dashboardService } from '../../services/dataServices'
import { ProgressBar, SectionHeader, Spinner } from '../../components/ui'
import { formatCurrency } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, ClipboardList, CreditCard, User,
  AlertCircle, CheckCircle, Clock, ArrowRight
} from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const studentId = user?.studentId || user?.id

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard', studentId],
    queryFn: () => dashboardService.getStudent(studentId),
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!studentId,
  })

  if (isLoading) return <Spinner />

  const dash       = data?.data || {}
  const student    = dash.student || {}
  const attendance = dash.attendance || {}
  const feeStatus  = dash.feeStatus || {}
  const courses    = dash.enrolledCourses || []

  const attPct    = attendance.percentage || 0
  const attSafe   = attPct >= 75
  const feePaid   = feeStatus.totalPaid || 0
  const feeTotal  = feeStatus.totalFee || 0
  const feeDue    = feeStatus.totalDue || 0
  const feePayPct = feeTotal > 0 ? Math.round((feePaid / feeTotal) * 100) : 0

  return (
    <div className="page-wrapper space-y-6">

      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #1a73e8 0%, #0891b2 100%)',
          boxShadow: '0 4px 20px rgba(26,115,232,0.3)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Welcome back
            </p>
            <h1 className="font-display text-2xl font-bold text-white">
              {student.name || user?.name || user?.email}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {student.rollNumber || 'N/A'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {student.department || 'N/A'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                Semester {student.semester || 'N/A'}
              </span>
            </div>
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            {(student.name || user?.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="card cursor-pointer hover:shadow-lg transition-all"
          style={{ borderTop: '3px solid #1a73e8' }}
          onClick={() => navigate('/my-courses')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: '#dbeafe' }}>
              <BookOpen size={18} style={{ color: '#1d4ed8' }} />
            </div>
            <ArrowRight size={14} style={{ color: '#94a3b8' }} />
          </div>
          <p className="font-display text-2xl font-bold" style={{ color: '#0f172a' }}>
            {dash.totalEnrolledCourses || courses.length || 0}
          </p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Enrolled Courses</p>
        </div>

        <div
          className="card cursor-pointer hover:shadow-lg transition-all"
          style={{ borderTop: `3px solid ${attSafe ? '#16a34a' : '#dc2626'}` }}
          onClick={() => navigate('/my-attendance')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: attSafe ? '#dcfce7' : '#fee2e2' }}>
              <ClipboardList size={18} style={{ color: attSafe ? '#16a34a' : '#dc2626' }} />
            </div>
            <ArrowRight size={14} style={{ color: '#94a3b8' }} />
          </div>
          <p className="font-display text-2xl font-bold"
             style={{ color: attSafe ? '#16a34a' : '#dc2626' }}>
            {attPct}%
          </p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Attendance Rate</p>
        </div>

        <div
          className="card cursor-pointer hover:shadow-lg transition-all"
          style={{ borderTop: `3px solid ${feeDue > 0 ? '#d97706' : '#16a34a'}` }}
          onClick={() => navigate('/my-fees')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: feeDue > 0 ? '#fef3c7' : '#dcfce7' }}>
              <CreditCard size={18} style={{ color: feeDue > 0 ? '#d97706' : '#16a34a' }} />
            </div>
            <ArrowRight size={14} style={{ color: '#94a3b8' }} />
          </div>
          <p className="font-display text-2xl font-bold" style={{ color: '#0f172a' }}>
            {feePayPct}%
          </p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>Fee Paid</p>
        </div>

        <div
          className="card cursor-pointer hover:shadow-lg transition-all"
          style={{ borderTop: '3px solid #7c3aed' }}
          onClick={() => navigate('/my-profile')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: '#f3e8ff' }}>
              <User size={18} style={{ color: '#7c3aed' }} />
            </div>
            <ArrowRight size={14} style={{ color: '#94a3b8' }} />
          </div>
          <p className="font-display text-2xl font-bold" style={{ color: '#0f172a' }}>
            Sem {student.semester || '—'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>My Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <SectionHeader title="Attendance Overview" sub="This semester" />
            <button
              onClick={() => navigate('/my-attendance')}
              className="btn-sm flex items-center gap-1 flex-shrink-0"
              style={{ color: '#1a73e8', borderColor: '#93c5fd' }}
            >
              Details <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-6 mb-5">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#e2e8f0" strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={attSafe ? '#16a34a' : '#dc2626'}
                  strokeWidth="3"
                  strokeDasharray={`${attPct}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-lg font-bold"
                      style={{ color: attSafe ? '#16a34a' : '#dc2626' }}>
                  {attPct}%
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: 'Present', value: `${attendance.presentClasses || 0} classes`, color: '#16a34a' },
                { label: 'Absent',  value: `${(attendance.totalClasses || 0) - (attendance.presentClasses || 0)} classes`, color: '#dc2626' },
                { label: 'Total',   value: `${attendance.totalClasses || 0} classes`,  color: '#0f172a' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: '#64748b' }}>{row.label}</span>
                  <span className="font-semibold text-sm" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {attSafe ? (
            <div className="flex items-center gap-2 p-3 rounded-xl"
                 style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={15} style={{ color: '#16a34a' }} />
              <p className="text-sm font-medium" style={{ color: '#15803d' }}>
                Your attendance is good. Keep it up!
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl"
                 style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
              <AlertCircle size={15} style={{ color: '#dc2626' }} />
              <p className="text-sm font-medium" style={{ color: '#dc2626' }}>
                Attendance below 75%. Risk of exam disqualification!
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <SectionHeader title="Fee Summary" sub="Current academic year" />
            <button
              onClick={() => navigate('/my-fees')}
              className="btn-sm flex items-center gap-1 flex-shrink-0"
              style={{ color: '#1a73e8', borderColor: '#93c5fd' }}
            >
              Details <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {[
              { label: 'Total Fee', value: formatCurrency(feeTotal), color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' },
              { label: 'Paid',      value: formatCurrency(feePaid),  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
              { label: 'Due',       value: formatCurrency(feeDue),   color: feeDue > 0 ? '#dc2626' : '#16a34a', bg: feeDue > 0 ? '#fff5f5' : '#f0fdf4', border: feeDue > 0 ? '#fecaca' : '#bbf7d0' },
            ].map(item => (
              <div key={item.label}
                   className="flex justify-between items-center p-3 rounded-xl"
                   style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                <span className="text-sm font-medium" style={{ color: '#374151' }}>{item.label}</span>
                <span className="font-display font-bold text-sm" style={{ color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#64748b' }}>
              <span>Payment Progress</span>
              <span className="font-semibold">{feePayPct}% paid</span>
            </div>
            <ProgressBar value={feePayPct} color="#1a73e8" />
          </div>

          {feeDue > 0 && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl"
                 style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <Clock size={14} style={{ color: '#d97706' }} />
              <p className="text-xs" style={{ color: '#92400e' }}>
                Pending due of {formatCurrency(feeDue)}. Please pay on time.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <SectionHeader
            title="Enrolled Courses"
            sub={`${courses.length} courses · Semester ${student.semester || ''}`}
          />
          <button
            onClick={() => navigate('/my-courses')}
            className="btn-sm flex items-center gap-1 flex-shrink-0"
            style={{ color: '#1a73e8', borderColor: '#93c5fd' }}
          >
            View All <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {courses.map((c, i) => (
            <div
              key={c.courseId || i}
              className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              onClick={() => navigate('/my-courses')}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#eff6ff'
                e.currentTarget.style.borderColor = '#93c5fd'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs text-white"
                style={{ background: `hsl(${(i * 47) % 360}, 55%, 50%)` }}
              >
                {c.courseCode?.slice(0, 2) || 'CS'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                  {c.courseName}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  {c.courseCode} · {c.credits} Credits
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <SectionHeader title="Student Information" sub="Your academic profile" />
          <button
            onClick={() => navigate('/my-profile')}
            className="btn-sm flex items-center gap-1 flex-shrink-0"
            style={{ color: '#1a73e8', borderColor: '#93c5fd' }}
          >
            Full Profile <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Full Name',   value: student.name       || '—' },
            { label: 'Roll Number', value: student.rollNumber || '—' },
            { label: 'Email',       value: student.email      || user?.email || '—' },
            { label: 'Department',  value: student.department || '—' },
            { label: 'Semester',    value: student.semester   ? `Semester ${student.semester}` : '—' },
            { label: 'Student ID',  value: student.id         ? `#${student.id}` : '—' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl"
                 style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                 style={{ color: '#94a3b8' }}>
                {item.label}
              </p>
              <p className="text-sm font-medium truncate" style={{ color: '#0f172a' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'My Courses',  route: '/my-courses',    icon: BookOpen,     color: '#1a73e8', bg: '#dbeafe' },
          { label: 'Attendance',  route: '/my-attendance', icon: ClipboardList,color: '#16a34a', bg: '#dcfce7' },
          { label: 'My Fees',     route: '/my-fees',       icon: CreditCard,   color: '#d97706', bg: '#fef3c7' },
          { label: 'My Profile',  route: '/my-profile',    icon: User,         color: '#7c3aed', bg: '#f3e8ff' },
        ].map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.route)}
            className="card flex flex-col items-center gap-3 py-5 cursor-pointer hover:shadow-lg transition-all"
            style={{ border: `1px solid ${item.bg}`, width: '100%' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{ background: item.bg }}>
              <item.icon size={22} style={{ color: item.color }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: '#374151' }}>{item.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
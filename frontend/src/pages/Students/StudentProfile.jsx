import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { studentService } from '../../services/studentService'
import { attendanceService, feeService } from '../../services/dataServices'
import { Spinner, Empty, ProgressBar, SectionHeader } from '../../components/ui'
import { Mail, Phone, MapPin, BookOpen, User, Hash, Building, Calendar, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: studentData, isLoading } = useQuery({
    queryKey: ['student-detail', id],
    queryFn: () => studentService.getById(id),
    retry: 1,
    enabled: !!id,
  })

  const { data: feesData } = useQuery({
    queryKey: ['student-fees', id],
    queryFn: () => feeService.getByStudent(id),
    retry: 1,
    enabled: !!id,
  })

  const { data: attendanceData } = useQuery({
    queryKey: ['student-attendance', id],
    queryFn: () => attendanceService.getOverall(id),
    retry: 1,
    enabled: !!id,
  })

  const { data: attendanceRecordsData } = useQuery({
    queryKey: ['student-attendance-records', id],
    queryFn: () => attendanceService.getByStudent(id),
    retry: 1,
    enabled: !!id,
  })

  const student   = studentData?.data || studentData || {}
  const fees      = (feesData?.data || feesData || []).map(f => ({
    ...f,
    amount: f.totalAmount  || f.amount || 0,
    paid:   f.paidAmount   || f.paid   || 0,
    due:    f.dueAmount    || f.due    || Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0)),
    status: (f.paymentStatus || f.status || 'pending').toLowerCase(),
  }))
  const attendance        = attendanceData?.data || attendanceData || {}
  const attendanceRecords = attendanceRecordsData?.data || attendanceRecordsData || []

  const overallPct   = attendance?.overallPercentage || attendance?.percentage || 0
  const totalClasses = attendance?.totalClasses || attendanceRecords.length || 0
  const present      = attendance?.presentClasses || attendanceRecords.filter(r => r.status === 'present').length || 0
  const absent       = totalClasses - present

  const totalFee   = fees.reduce((a, f) => a + f.amount, 0)
  const totalPaid  = fees.reduce((a, f) => a + f.paid,   0)
  const totalDue   = fees.reduce((a, f) => a + f.due,    0)

  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || 'ST'
  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown'

  if (isLoading) return <Spinner />
  if (!student?.id) return (
    <div className="page-wrapper">
      <Empty icon="👤" message="Student not found" />
      <button onClick={() => navigate('/students')} className="btn-secondary mt-4 flex items-center gap-2">
        <ArrowLeft size={14} /> Back to Students
      </button>
    </div>
  )

  return (
    <div className="page-wrapper space-y-5 max-w-4xl">

      {/* Back button */}
      <button onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Students
      </button>

      {/* Profile Header */}
      <div className="rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #1a73e8 0%, #0891b2 100%)', boxShadow: '0 4px 20px rgba(26,115,232,0.25)' }}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)' }}>
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-white">{fullName}</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{student.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
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
              <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                style={{
                  background: student.status === 'active' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)',
                  color: 'white',
                }}>
                {student.status || 'active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="font-display text-3xl font-bold"
            style={{ color: overallPct >= 75 ? '#10b981' : '#ef4444' }}>{overallPct}%</p>
          <p className="text-xs text-gray-500 mt-1">Attendance</p>
          <span className={`pill text-[10px] mt-2 ${overallPct >= 75 ? 'pill-green' : 'pill-red'}`}>
            {overallPct >= 75 ? 'Safe' : 'Low'}
          </span>
        </div>
        <div className="card text-center">
          <p className="font-display text-3xl font-bold text-white">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">Fee Paid</p>
          <p className="text-xs text-red-400 mt-1">Due: {formatCurrency(totalDue)}</p>
        </div>
        <div className="card text-center">
          <p className="font-display text-3xl font-bold text-purple-400">{fees.length}</p>
          <p className="text-xs text-gray-500 mt-1">Fee Records</p>
          <span className={`pill text-[10px] mt-2 ${
            fees.some(f => f.status === 'overdue') ? 'pill-red' :
            fees.some(f => f.status === 'pending') ? 'pill-amber' : 'pill-green'
          }`}>
            {fees.some(f => f.status === 'overdue') ? 'Overdue' :
             fees.some(f => f.status === 'pending') ? 'Pending' : 'Paid'}
          </span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#dbeafe' }}>
            <User size={15} style={{ color: '#1d4ed8' }} />
          </div>
          <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: User,     label: 'Full Name',    value: fullName },
            { icon: Hash,     label: 'Roll Number',  value: student.rollNumber   || '—' },
            { icon: Mail,     label: 'Email',        value: student.email        || '—' },
            { icon: Phone,    label: 'Phone',        value: student.phone        || '—' },
            { icon: Building, label: 'Department',   value: student.department   || '—' },
            { icon: BookOpen, label: 'Semester',     value: student.semester ? `Semester ${student.semester}` : '—' },
            { icon: Calendar, label: 'Date of Birth',value: student.dateOfBirth  || '—' },
            { icon: MapPin,   label: 'Address',      value: student.address      || '—' },
          ].map(item => (
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

      {/* Attendance Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
            <Calendar size={15} style={{ color: '#16a34a' }} />
          </div>
          <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Attendance</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Present',       value: present,      color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Absent',        value: absent,       color: '#dc2626', bg: '#fff5f5' },
            { label: 'Total Classes', value: totalClasses, color: '#1a73e8', bg: '#eff6ff' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: s.bg }}>
              <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1" style={{ color: '#64748b' }}>
            <span>Overall Attendance</span>
            <span style={{ color: overallPct >= 75 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{overallPct}%</span>
          </div>
          <ProgressBar value={overallPct} color={overallPct >= 75 ? '#10b981' : '#ef4444'} />
        </div>

        {overallPct < 75 && (
          <div className="p-3 rounded-lg mt-3" style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
            <p className="text-xs font-medium" style={{ color: '#dc2626' }}>
              ⚠️ Attendance below 75% — student may not be eligible for exams
            </p>
          </div>
        )}

        {attendanceRecords.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Recent Records</p>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr>{['Date', 'Course', 'Status'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {attendanceRecords.slice(0, 20).map((r, i) => (
                    <tr key={i}>
                      <td className="table-td text-xs text-gray-300">{r.date}</td>
                      <td className="table-td text-xs text-gray-300">{r.courseName || `Course ${r.courseId}`}</td>
                      <td className="table-td">
                        <span className={`pill text-[10px] ${
                          r.status === 'present' ? 'pill-green' :
                          r.status === 'late'    ? 'pill-amber' : 'pill-red'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fee Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fef3c7' }}>
            <Hash size={15} style={{ color: '#d97706' }} />
          </div>
          <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Fee Details</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Total Fee', value: formatCurrency(totalFee),  color: '#1a73e8', bg: '#eff6ff' },
            { label: 'Paid',      value: formatCurrency(totalPaid), color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Due',       value: formatCurrency(totalDue),  color: '#dc2626', bg: '#fff5f5' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: s.bg }}>
              <p className="font-display text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {fees.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr>{['Type', 'Semester', 'Amount', 'Paid', 'Due', 'Status'].map(h => (
                <th key={h} className="table-th">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id}>
                  <td className="table-td text-white">{f.feeType || 'Tuition'}</td>
                  <td className="table-td text-gray-300">Sem {f.semester}</td>
                  <td className="table-td text-gray-300">{formatCurrency(f.amount)}</td>
                  <td className="table-td text-green-400">{formatCurrency(f.paid)}</td>
                  <td className="table-td text-red-400">{formatCurrency(f.due)}</td>
                  <td className="table-td">
                    <span className={`pill text-[10px] ${
                      f.status === 'paid'    ? 'pill-green' :
                      f.status === 'overdue' ? 'pill-red'   : 'pill-amber'
                    }`}>{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">No fee records found</p>
        )}
      </div>

      {/* Parent Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
            <User size={15} style={{ color: '#16a34a' }} />
          </div>
          <h2 className="font-display font-semibold text-base" style={{ color: '#0f172a' }}>Parent / Guardian</h2>
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
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{item.label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#0f172a' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
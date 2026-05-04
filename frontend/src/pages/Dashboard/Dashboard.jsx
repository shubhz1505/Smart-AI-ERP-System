import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell } from 'recharts'
import { Users, CreditCard, ClipboardList, AlertTriangle, BookOpen, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { dashboardService, feeService, attendanceService } from '../../services/dataServices'
import { studentService } from '../../services/studentService'
import { aiService } from '../../services/aiService'
import { StatCard, AlertItem, SectionHeader, ProgressBar, Spinner, Empty } from '../../components/ui'
import { formatCurrency } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

// ─── ATTENDANCE CELL ──────────────────────────────────────────────────────────
function AttendanceCell({ studentId }) {
  const { data } = useQuery({
    queryKey: ['attendance-overall', studentId],
    queryFn: () => attendanceService.getOverall(studentId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: !!studentId,
  })

  const pct = data?.data?.overallPercentage
    || data?.data?.percentage
    || data?.overallPercentage
    || data?.percentage
    || 0

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div className="h-full rounded-full"
          style={{ width: `${pct}%`, background: pct > 75 ? '#10b981' : '#ef4444' }} />
      </div>
      <span className="text-xs text-gray-400">{pct}%</span>
    </div>
  )
}

// ─── FEE STATUS CELL ──────────────────────────────────────────────────────────
function FeeStatusCell({ studentId }) {
  const { data } = useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: () => feeService.getByStudent(studentId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: !!studentId,
  })

  const fees = data?.data || data || []
  const feeList = Array.isArray(fees) ? fees : []

  let status = feeList.length === 0 ? 'no record' : 'paid'
  if (feeList.some(f => (f.paymentStatus || f.status || '').toLowerCase() === 'overdue')) {
    status = 'overdue'
  } else if (feeList.some(f => (f.paymentStatus || f.status || '').toLowerCase() === 'pending')) {
    status = 'pending'
  }

  return (
    <span className={`pill ${
      status === 'paid'      ? 'pill-green' :
      status === 'overdue'   ? 'pill-red'   :
      status === 'no record' ? 'pill-blue'  : 'pill-amber'
    }`}>
      {status}
    </span>
  )
}

// ─── STUDENT DASHBOARD ───────────────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: studentData, isLoading } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => studentService.getByUserId(user?.id),
    retry: 1,
    enabled: !!user?.id,
  })

  const student = studentData?.data || studentData || {}

  const { data: myFeesRes } = useQuery({
    queryKey: ['my-fees', student?.id],
    queryFn: () => feeService.getByStudent(student?.id),
    retry: 1,
    enabled: !!student?.id,
  })

  const { data: myAttendance } = useQuery({
    queryKey: ['my-attendance-overall', student?.id],
    queryFn: () => attendanceService.getOverall(student?.id),
    retry: 1,
    enabled: !!student?.id,
  })

  const feeRecords = myFeesRes?.data || myFeesRes || []
  const fees = Array.isArray(feeRecords)
    ? feeRecords.reduce((acc, f) => ({
        totalAmount: acc.totalAmount + (f.totalAmount || 0),
        paidAmount:  acc.paidAmount  + (f.paidAmount  || 0),
        dueAmount:   acc.dueAmount   + (f.dueAmount   ?? Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0))),
        status:      f.paymentStatus || acc.status,
        dueDate:     f.dueDate || acc.dueDate,
      }), { totalAmount: 0, paidAmount: 0, dueAmount: 0, status: 'pending', dueDate: null })
    : feeRecords

  const attendance = myAttendance?.data || myAttendance || {}

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-6">
      <div className="ai-card">
        <h2 className="font-display text-lg font-bold text-white mb-1">
          Welcome back, {user?.name || 'Student'} 👋
        </h2>
        <p className="text-xs text-gray-500">
          {student?.department || 'N/A'} · Roll No: {student?.rollNumber || 'N/A'} · Semester {student?.semester || 'N/A'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}   label="My Courses"  value={student?.enrolledCourses || '—'}               color="blue"  />
        <StatCard icon={Calendar}   label="Attendance"  value={attendance?.overallPercentage || 0} suffix="%" color="green" />
        <StatCard icon={DollarSign} label="Fee Status"  value={fees?.status || 'Pending'}                     color="amber" />
        <StatCard icon={TrendingUp} label="Performance" value={student?.cgpa || '—'}                          color="red"   />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionHeader title="My Fee Summary" sub="Current semester" />
          <div className="space-y-3 mt-2">
            {[
              { label: 'Total Fee', value: formatCurrency(fees?.totalAmount || 0) },
              { label: 'Paid',      value: formatCurrency(fees?.paidAmount  || 0) },
              { label: 'Due',       value: formatCurrency(fees?.dueAmount   || 0) },
              { label: 'Due Date',  value: fees?.dueDate || 'N/A' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm border-b border-border pb-2">
                <span className="text-gray-500">{row.label}</span>
                <span className="text-black font-medium">{row.value}</span>
              </div>
            ))}
            <button onClick={() => navigate('/my-fees')} className="btn-primary w-full justify-center mt-2 text-xs">
              View Fee Details
            </button>
          </div>
        </div>

        <div className="card">
          <SectionHeader title="My Attendance" sub="Overall percentage" />
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="text-5xl font-display font-bold"
              style={{ color: (attendance?.overallPercentage || 0) >= 75 ? '#10b981' : '#ef4444' }}>
              {attendance?.overallPercentage || 0}%
            </div>
            <p className="text-xs text-gray-500">
              {(attendance?.overallPercentage || 0) >= 75
                ? '✅ Above minimum requirement'
                : '⚠️ Below 75% — attendance shortage'}
            </p>
            <button onClick={() => navigate('/my-attendance')} className="btn-sm text-xs">View Details</button>
          </div>
        </div>
      </div>

      <div className="card">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {[
            { label: 'My Courses',   path: '/my-courses',    icon: '📚' },
            { label: 'Attendance',   path: '/my-attendance', icon: '📋' },
            { label: 'My Fees',      path: '/my-fees',       icon: '💰' },
            { label: 'My Profile',   path: '/my-profile',    icon: '👤' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className="card p-4 flex flex-col items-center gap-2 hover:border-purple-500/50 transition-colors cursor-pointer">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-gray-400">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate()

  const { data: adminDash, isLoading: dashLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: dashboardService.getAdmin,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAll,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const { data: feesData } = useQuery({
    queryKey: ['fees-stats'],
    queryFn: feeService.getStatistics,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const { data: overdueData } = useQuery({
    queryKey: ['fees-overdue'],
    queryFn: feeService.getOverdue,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const { data: aiData } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: aiService.getDashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const dash          = adminDash?.data    || adminDash    || {}
  const students      = studentsData?.data || studentsData || []
  const feeStats      = feesData?.data     || feesData     || {}
  const overdueList   = overdueData?.data  || overdueData  || []
  const aiDash        = aiData?.data       || {}
  const recentActions = aiDash.recentActions || []

  const totalStudents = dash.totalStudents || students?.length   || 0
  const revenue       = dash.revenue       || feeStats.totalPaid || 0
  const avgAttendance = dash?.avgAttendance ?? dash?.data?.avgAttendance ?? 0
  const aiAlerts      = aiDash.pendingEscalationCount || overdueList?.length || 0

  const rawStudents    = Array.isArray(students) ? students : []
  const recentStudents = rawStudents.slice(0, 5).map(s => ({
    ...s,
    name:      s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
    studentId: s.studentId || s.rollNumber || String(s.id),
    course:    s.course || s.department || '—',
  }))

  const totalPaid    = feeStats.totalPaid    || 0
  const totalPending = feeStats.totalPending || 0
  const totalOverdue = feeStats.totalOverdue || 0
  const totalFees    = totalPaid + totalPending + totalOverdue
  const feePieData   = totalFees > 0 ? [
    { name: 'Paid',    value: Math.round((totalPaid    / totalFees) * 100), color: '#10b981' },
    { name: 'Pending', value: Math.round((totalPending / totalFees) * 100), color: '#f59e0b' },
    { name: 'Overdue', value: Math.round((totalOverdue / totalFees) * 100), color: '#ef4444' },
  ] : [
    { name: 'Paid',    value: 0, color: '#10b981' },
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Overdue', value: 0, color: '#ef4444' },
  ]

  return (
    <div className="page-wrapper space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Students"  value={totalStudents}           color="blue"  />
        <StatCard icon={CreditCard}    label="Total Revenue"   value={formatCurrency(revenue)} color="green" />
        <StatCard icon={ClipboardList} label="Avg Attendance"  value={avgAttendance} suffix="%" color="amber" />
        <StatCard icon={AlertTriangle} label="AI Alerts"       value={aiAlerts}                color="red"   />
      </div>

      {/* Fee Pie + AI Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card flex flex-col items-center">
          <SectionHeader title="Fee Collection" sub="Real-time from database" />
          <PieChart width={160} height={160}>
            <Pie data={feePieData} cx={80} cy={80} innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
              {feePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
          </PieChart>
          <div className="space-y-2 w-full mt-2">
            {feePieData.map(f => (
              <div key={f.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: f.color }} />{f.name}
                </span>
                <span className="font-semibold text-white">{f.value}%</span>
              </div>
            ))}
          </div>
          <div className="w-full mt-3 space-y-1 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Total Paid</span><span className="text-green-400">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Pending</span><span className="text-amber-400">{formatCurrency(totalPending)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Overdue</span><span className="text-red-400">{formatCurrency(totalOverdue)}</span>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <SectionHeader title="Recent AI Actions" sub="From automation engine">
            <button onClick={() => navigate('/ai')} className="btn-sm text-purple-400 border-purple-500/30">View All</button>
          </SectionHeader>
          {recentActions.length > 0 ? recentActions.slice(0, 5).map(a => (
            <AlertItem key={a.id}
              type={a.actionType?.includes('URGENT') ? 'danger' : 'warning'}
              icon={a.actionType?.includes('URGENT') ? '🚨' : '⚠️'}
              title={a.actionType?.replace(/_/g, ' ')}
              desc={a.triggerReason || a.messageSent || '—'}
              time={`Student ${a.studentId} · ${new Date(a.createdAt).toLocaleString()}`}
            />
          )) : (
            <p className="text-gray-500 text-sm text-center py-6">
              No automation actions yet. Go to AI Dashboard and run automation.
            </p>
          )}
        </div>
      </div>

      {/* Recent Students */}
      <div className="card">
        <SectionHeader title="Recent Students">
          <button onClick={() => navigate('/students')} className="btn-sm">View All</button>
        </SectionHeader>
        {dashLoading ? <Spinner /> : recentStudents.length === 0 ? (
          <Empty icon="👥" message="No students found" />
        ) : (
          <div className="table-wrap">
            <table className="w-full">
              <thead>
                <tr>
                  {['Student', 'Course', 'Semester', 'Attendance', 'Fee Status'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentStudents.map(s => (
                  <tr key={s.id} className="cursor-pointer"
                    onClick={() => navigate(`/students/${s.id}`)}>
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                          {(s.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-black">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-600">{s.course}</td>
                    <td className="table-td text-gray-600">Sem {s.semester || '—'}</td>
                    <td className="table-td">
                      <AttendanceCell studentId={s.id} />
                    </td>
                    <td className="table-td">
                      <FeeStatusCell studentId={s.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore()
  const role = user?.role?.toLowerCase()
  if (role === 'student') return <StudentDashboard />
  return <AdminDashboard />
}
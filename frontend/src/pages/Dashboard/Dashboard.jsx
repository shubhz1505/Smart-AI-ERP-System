import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, CreditCard, ClipboardList, AlertTriangle, BookOpen, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { dashboardService, feeService, attendanceService } from '../../services/dataServices'
import { studentService } from '../../services/studentService'
import { StatCard, AIBadge, AlertItem, SectionHeader, ProgressBar, StatusDot, Spinner } from '../../components/ui'
import { formatCurrency, CHART_COLORS } from '../../utils/helpers'
import { mockAIAlerts, revenueData, attendanceWeekly, mockStudents } from '../../utils/mockData'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const FEE_PIE = [
  { name: 'Paid',    value: 68, color: '#10b981' },
  { name: 'Pending', value: 22, color: '#f59e0b' },
  { name: 'Overdue', value: 10, color: '#ef4444' },
]

const MICROSERVICES = [
  { name: 'Fee Defaulter Predictor', port: 8001, tech: 'scikit-learn',    status: 'online' },
  { name: 'Attendance Anomaly',      port: 8002, tech: 'IsolationForest', status: 'online' },
  { name: 'Exam Performance',        port: 8003, tech: 'Random Forest',   status: 'online' },
  { name: 'Smart Query Classifier',  port: 8004, tech: 'NLP + BERT',      status: 'online' },
  { name: 'OCR Service',             port: 8005, tech: 'Tesseract',       status: 'idle'   },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
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

  const { data: myFees } = useQuery({
    queryKey: ['my-fees', student?.id],
    queryFn: () => feeService.getByStudent(student?.id),
    retry: 1,
    enabled: !!student?.id,
  })

  const { data: myAttendance } = useQuery({
    queryKey: ['my-attendance', student?.id],
    queryFn: () => attendanceService.getOverall(student?.id),
    retry: 1,
    enabled: !!student?.id,
  })

  const fees       = myFees?.data       || myFees       || {}
  const attendance = myAttendance?.data || myAttendance || {}

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-6">
      {/* Welcome */}
      <div className="ai-card">
        <h2 className="font-display text-lg font-bold text-white mb-1">
          Welcome back, {user?.name || 'Student'} 👋
        </h2>
        <p className="text-xs text-gray-500">
          {student?.department || 'N/A'} · Roll No: {student?.rollNumber || 'N/A'} · Semester {student?.semester || 'N/A'}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}     label="My Courses"    value={student?.enrolledCourses || '—'}                        color="blue"  />
        <StatCard icon={Calendar}     label="Attendance"    value={attendance?.overallPercentage || 0} suffix="%"           color="green" />
        <StatCard icon={DollarSign}   label="Fee Status"    value={fees?.status || 'Pending'}                              color="amber" />
        <StatCard icon={TrendingUp}   label="Performance"   value={student?.cgpa || '—'}                                   color="red"   />
      </div>

      {/* My Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionHeader title="My Fee Summary" sub="Current semester" />
          <div className="space-y-3 mt-2">
            {[
              { label: 'Total Fee',   value: formatCurrency(fees?.totalAmount  || 0) },
              { label: 'Paid',        value: formatCurrency(fees?.paidAmount   || 0) },
              { label: 'Due',         value: formatCurrency(fees?.dueAmount    || 0) },
              { label: 'Due Date',    value: fees?.dueDate || 'N/A' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm border-b border-border pb-2">
                <span className="text-gray-500">{row.label}</span>
                <span className="text-white font-medium">{row.value}</span>
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
            <button onClick={() => navigate('/my-attendance')} className="btn-sm text-xs">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {[
            { label: 'My Courses',    path: '/my-courses',    icon: '📚' },
            { label: 'Attendance',    path: '/my-attendance', icon: '📋' },
            { label: 'My Fees',       path: '/my-fees',       icon: '💰' },
            { label: 'My Profile',    path: '/profile',       icon: '👤' },
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

  const dash        = adminDash?.data   || adminDash   || {}
  const students    = studentsData?.data || studentsData || mockStudents
  const feeStats    = feesData?.data     || feesData     || {}
  const overdueList = overdueData?.data  || overdueData  || []

  const totalStudents = dash.totalStudents  || students?.length   || 1284
  const revenue       = dash.revenue        || feeStats.totalPaid || 1840000
  const avgAttendance = dash.avgAttendance  || 87.3
  const aiAlerts      = dash.aiAlerts       || overdueList?.length || 7

  const recentStudents = Array.isArray(students) ? students.slice(0, 5) : mockStudents.slice(0, 5)

  const totalPaid    = feeStats.totalPaid    || 0
  const totalPending = feeStats.totalPending || 0
  const totalOverdue = feeStats.totalOverdue || 0
  const totalFees    = totalPaid + totalPending + totalOverdue
  const feePieData   = totalFees > 0 ? [
    { name: 'Paid',    value: Math.round((totalPaid    / totalFees) * 100), color: '#10b981' },
    { name: 'Pending', value: Math.round((totalPending / totalFees) * 100), color: '#f59e0b' },
    { name: 'Overdue', value: Math.round((totalOverdue / totalFees) * 100), color: '#ef4444' },
  ] : FEE_PIE

  return (
    <div className="page-wrapper space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Students"  value={totalStudents}           delta="8.2% vs last month"  deltaUp color="blue"  />
        <StatCard icon={CreditCard}    label="Monthly Revenue" value={formatCurrency(revenue)} delta="12.1% vs last month" deltaUp color="green" />
        <StatCard icon={ClipboardList} label="Avg Attendance"  value={avgAttendance} suffix="%" delta="2.4% this week"            color="amber" />
        <StatCard icon={AlertTriangle} label="AI Alerts"       value={aiAlerts}                delta="3 critical"                 color="red"   />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionHeader title="Revenue Trend" sub="Monthly fee collection (₹ Lakhs)" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill={CHART_COLORS.brand} radius={[4,4,0,0]} name="₹ Lakhs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <SectionHeader title="Attendance Overview" sub="Weekly % by department" />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={attendanceWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="day" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60,100]} tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="cs"   stroke={CHART_COLORS.brand} strokeWidth={2} dot={{ r: 3 }} name="CS" />
              <Line type="monotone" dataKey="mba"  stroke={CHART_COLORS.cyan}  strokeWidth={2} dot={{ r: 3 }} name="MBA" />
              <Line type="monotone" dataKey="bca"  stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 3 }} name="BCA" />
              <Line type="monotone" dataKey="bcom" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 3 }} name="B.Com" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-card">
        <AIBadge label="AI Engine Active — 5 microservices running" />
        <h2 className="font-display text-base font-bold text-white mb-1">AI-Powered Insights</h2>
        <p className="text-xs text-gray-500 mb-4">Last scan: 2 min ago · Scheduled: 9AM & 10AM daily</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'FEE DEFAULTER RISK',    value: overdueList?.length || 23, sub: 'students flagged', pct: 65, color: '#ef4444' },
            { label: 'ATTENDANCE ANOMALIES',  value: 11,    sub: 'unusual patterns', pct: 38, color: '#f59e0b' },
            { label: 'AVG PERFORMANCE SCORE', value: '82%', sub: 'predicted grade',  pct: 82, color: '#10b981' },
          ].map(item => (
            <div key={item.label} className="bg-black/30 rounded-lg p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{item.label}</p>
              <p className="font-display text-2xl font-bold mb-0.5" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs text-gray-500 mb-2">{item.sub}</p>
              <ProgressBar value={item.pct} color={item.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionHeader title="Recent AI Alerts">
            <button onClick={() => navigate('/ai')} className="btn-sm text-purple-400 border-purple-500/30">View All</button>
          </SectionHeader>
          {mockAIAlerts.slice(0,3).map(a => (
            <AlertItem key={a.id} type={a.type}
              icon={a.type==='danger'?'🚨':a.type==='warning'?'⚠️':a.type==='success'?'✅':'📊'}
              title={a.title} desc={a.desc}
              time={`${a.service} · Port ${a.port} · ${a.time}`} />
          ))}
        </div>

        <div className="space-y-5">
          <div className="card">
            <SectionHeader title="Fee Collection" sub="Current semester" />
            <div className="flex items-center gap-6">
              <PieChart width={100} height={100}>
                <Pie data={feePieData} cx={50} cy={50} innerRadius={30} outerRadius={48} dataKey="value" strokeWidth={0}>
                  {feePieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2 flex-1">
                {feePieData.map(f => (
                  <div key={f.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: f.color }} />{f.name}
                    </span>
                    <span className="font-semibold text-white">{f.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <SectionHeader title="Python Microservices" sub="FastAPI · scikit-learn" />
            {MICROSERVICES.map(s => (
              <div key={s.name} className="service-row">
                <div>
                  <p className="text-xs font-semibold text-white">{s.name}</p>
                  <p className="text-[10px] text-gray-500">localhost:{s.port} · {s.tech}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={s.status} />
                  <span className={`text-xs font-medium ${s.status==='online'?'text-green-400':'text-gray-500'}`}>
                    {s.status==='online'?'Online':'Idle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students */}
      <div className="card">
        <SectionHeader title="Recent Students">
          <button onClick={() => navigate('/students')} className="btn-sm">View All</button>
        </SectionHeader>
        {dashLoading ? <Spinner /> : (
          <div className="table-wrap">
            <table className="w-full">
              <thead>
                <tr>{['Student','Course','Semester','Attendance','Fee Status'].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentStudents.map(s => (
                  <tr key={s.id} className="cursor-pointer" onClick={() => navigate(`/students/${s.id}`)}>
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                          {(s.name||'').split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.studentId || s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-300">{s.course || s.department || '—'}</td>
                    <td className="table-td text-gray-300">Sem {s.semester || '—'}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={s.attendancePct || s.attendancePercentage || 0}
                          color={(s.attendancePct||s.attendancePercentage||0)>75?'#10b981':'#ef4444'}
                          className="w-16"
                        />
                        <span className="text-xs text-gray-400">{s.attendancePct || s.attendancePercentage || 0}%</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`pill ${
                        (s.feeStatus||s.paymentStatus)==='paid'    ? 'pill-green' :
                        (s.feeStatus||s.paymentStatus)==='overdue' ? 'pill-red'   : 'pill-amber'
                      }`}>
                        {s.feeStatus || s.paymentStatus || 'pending'}
                      </span>
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

// ─── MAIN EXPORT — role router ────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuthStore()
  const role = user?.role?.toLowerCase()

  if (role === 'student') return <StudentDashboard />
  return <AdminDashboard />
}
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { SectionHeader, Spinner, Empty } from '../components/ui'
import { dashboardService, feeService, attendanceService } from '../services/dataServices'
import { studentService } from '../services/studentService'
import { formatCurrency } from '../utils/helpers'
import { Download, TrendingUp, Users, CreditCard, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function Reports() {

  const { data: dashData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/api/dashboard/admin').then(r => r.data.data),
    retry: 1,
  })

  const { data: feeStatsData } = useQuery({
    queryKey: ['fees-stats'],
    queryFn: () => feeService.getStatistics(),
    retry: 1,
  })

  const { data: studentsRaw } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getAll(),
    retry: 1,
  })

  const { data: summaryRaw } = useQuery({
    queryKey: ['students-summary'],
    queryFn: () => attendanceService.getAllSummary(),
    retry: 1,
  })

  const dash     = dashData     || {}
  const feeStats = feeStatsData || {}

  const students = Array.isArray(studentsRaw) ? studentsRaw
    : Array.isArray(studentsRaw?.data) ? studentsRaw.data : []

  const summary = Array.isArray(summaryRaw) ? summaryRaw
    : Array.isArray(summaryRaw?.data) ? summaryRaw.data : []

  // Merge students with real attendance + fee data from summary
  const enrichedStudents = students.map(s => {
    const sum = summary.find(x => x.studentId === s.id) || {}
    return {
      ...s,
      name:          `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
      department:    s.department || '—',
      attendancePct: Number(sum.attendancePct ?? 0),
      feeStatus:     (sum.feeStatus || s.feeStatus || 'pending').toLowerCase(),
      dueAmount:     Number(sum.dueAmount ?? 0),
      totalFee:      Number(sum.totalFee ?? 0),
      paidAmount:    Number(sum.paidAmount ?? 0),
    }
  })

  // Stats
  const totalRevenue   = Number(feeStats.totalPaid   ?? dash.feeSummary?.totalPaid   ?? 0)
  const totalPending   = Number(feeStats.totalPending ?? dash.feeSummary?.totalPending ?? 0)
  const totalFees      = Number(feeStats.totalFees    ?? dash.feeSummary?.totalFees    ?? 0)
  const collectionRate = totalFees > 0
    ? Math.round((totalRevenue / totalFees) * 100) : 0
  const avgAttendance  = dash.avgAttendance
    ?? (enrichedStudents.length > 0
      ? Math.round(enrichedStudents.reduce((a, s) => a + s.attendancePct, 0) / enrichedStudents.length * 10) / 10
      : 0)
  const passRate = enrichedStudents.length > 0
    ? Math.round(enrichedStudents.filter(s => s.attendancePct >= 75).length / enrichedStudents.length * 100)
    : 0

  // Department attendance chart — REAL
  const deptMap = {}
  enrichedStudents.forEach(s => {
    const dept = s.department || 'Unknown'
    if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 }
    deptMap[dept].total += s.attendancePct
    deptMap[dept].count += 1
  })
  const attendanceByDept = Object.entries(deptMap).map(([dept, val]) => ({
    department: dept.length > 12 ? dept.slice(0, 12) + '...' : dept,
    percentage: Math.round((val.total / val.count) * 10) / 10,
  }))

  // Fee distribution pie — REAL
  const paidCount    = enrichedStudents.filter(s => s.feeStatus === 'paid').length
  const pendingCount = enrichedStudents.filter(s => s.feeStatus === 'pending').length
  const overdueCount = enrichedStudents.filter(s => s.feeStatus === 'overdue').length
  const pieData = [
    { name: 'Paid',    value: paidCount,    color: '#16a34a' },
    { name: 'Pending', value: pendingCount, color: '#d97706' },
    { name: 'Overdue', value: overdueCount, color: '#dc2626' },
  ].filter(d => d.value > 0)

  // Revenue from fee summary
  const revenueData = [
    { month: 'Total Fee',  amount: totalFees },
    { month: 'Collected',  amount: totalRevenue },
    { month: 'Pending',    amount: totalPending },
  ]

  const DEPT_COLORS = ['#1a73e8', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#dc2626']

  const exportCSV = () => {
    if (enrichedStudents.length === 0) { toast.error('No data to export'); return }
    const rows = [
      ['Roll No', 'Name', 'Department', 'Attendance %', 'Fee Status', 'Due Amount', 'Risk', 'Grade'],
      ...enrichedStudents.map(s => {
        const risk  = s.attendancePct < 65 ? 'High' : s.attendancePct < 75 ? 'Medium' : 'Low'
        const grade = s.attendancePct >= 90 ? 'A' : s.attendancePct >= 75 ? 'B' :
                      s.attendancePct >= 60 ? 'C' : s.attendancePct >= 50 ? 'D' : 'F'
        return [s.rollNumber, s.name, s.department, s.attendancePct + '%',
                s.feeStatus, '₹' + s.dueAmount, risk, grade]
      }),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = `report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported!')
  }

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Reports & Analytics</h2>
          <p className="section-sub">Live data from database · {enrichedStudents.length} students</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-xs">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => { window.print(); toast.success('Print dialog opened') }}
                  className="btn-primary flex items-center gap-2 text-xs">
            <Download size={13} /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            sub: `${collectionRate}% collected`,
            color: '#16a34a', bg: '#dcfce7', icon: CreditCard,
          },
          {
            label: 'Pending Fees',
            value: formatCurrency(totalPending),
            sub: `${dash.feeSummary?.overdueCount ?? 0} overdue`,
            color: '#d97706', bg: '#fef3c7', icon: TrendingUp,
          },
          {
            label: 'Avg Attendance',
            value: `${avgAttendance}%`,
            sub: `${enrichedStudents.filter(s => s.attendancePct < 75 && s.attendancePct > 0).length} below 75%`,
            color: '#1a73e8', bg: '#dbeafe', icon: BookOpen,
          },
          {
            label: 'Pass Rate',
            value: `${passRate}%`,
            sub: `${enrichedStudents.filter(s => s.attendancePct >= 75).length} of ${enrichedStudents.length} students`,
            color: '#7c3aed', bg: '#f3e8ff', icon: Users,
          },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#0f172a' }}>{s.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Chart */}
        <div className="card lg:col-span-2">
          <SectionHeader title="Fee Collection Summary" sub="Total vs Collected vs Pending" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }}
                     axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }}
                     axisLine={false} tickLine={false}
                     tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0',
                                borderRadius: 8, fontSize: 12 }}
                formatter={v => [formatCurrency(v), 'Amount']}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {revenueData.map((_, i) => (
                  <Cell key={i}
                        fill={i === 0 ? '#1a73e8' : i === 1 ? '#16a34a' : '#d97706'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Pie Chart */}
        <div className="card flex flex-col items-center">
          <SectionHeader title="Fee Distribution" sub="By payment status" />
          {pieData.length === 0 ? (
            <Empty message="No fee data" />
          ) : (
            <>
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={80} cy={80}
                     innerRadius={45} outerRadius={75}
                     dataKey="value" strokeWidth={0}>
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0',
                                  borderRadius: 8, fontSize: 12 }}
                  formatter={(v, n) => [`${v} students`, n]}
                />
              </PieChart>
              <div className="space-y-2 w-full mt-2">
                {pieData.map(f => (
                  <div key={f.name}
                       className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2" style={{ color: '#374151' }}>
                      <span className="w-2.5 h-2.5 rounded-sm"
                            style={{ background: f.color }} />
                      {f.name}
                    </span>
                    <span className="font-semibold" style={{ color: '#0f172a' }}>
                      {f.value} students
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attendance by Department */}
      <div className="card">
        <SectionHeader title="Attendance by Department" sub="Average attendance percentage per department" />
        {attendanceByDept.length === 0 ? (
          <Empty message="No attendance data" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceByDept} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 11 }}
                     axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }}
                     axisLine={false} tickLine={false}
                     tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0',
                                borderRadius: 8, fontSize: 12 }}
                formatter={v => [`${v}%`, 'Avg Attendance']}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {attendanceByDept.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Student Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>
            Student Performance Report
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
            {enrichedStudents.length} students · real attendance + fee data from database
          </p>
        </div>
        {enrichedStudents.length === 0 ? (
          <Empty message="No students" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Student', 'Department', 'Attendance', 'Fee Status', 'Due Amount', 'Risk', 'Grade'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrichedStudents.map(s => {
                  const risk  = s.attendancePct === 0 ? '—'
                    : s.attendancePct < 65 ? 'High'
                    : s.attendancePct < 75 ? 'Medium' : 'Low'
                  const grade = s.attendancePct >= 90 ? 'A'
                    : s.attendancePct >= 75 ? 'B'
                    : s.attendancePct >= 60 ? 'C'
                    : s.attendancePct >= 50 ? 'D'
                    : s.attendancePct === 0 ? '—' : 'F'
                  return (
                    <tr key={s.id}>
                      <td className="table-td">
                        <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                          {s.name}
                        </p>
                        <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                          {s.rollNumber}
                        </p>
                      </td>
                      <td className="table-td" style={{ color: '#374151' }}>
                        {s.department}
                      </td>
                      <td className="table-td">
                        <span className="font-semibold"
                              style={{ color: s.attendancePct === 0 ? '#94a3b8'
                                : s.attendancePct >= 75 ? '#16a34a' : '#dc2626' }}>
                          {s.attendancePct > 0 ? `${s.attendancePct}%` : '—'}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className={`pill ${
                          s.feeStatus === 'paid'    ? 'pill-green' :
                          s.feeStatus === 'overdue' ? 'pill-red'   : 'pill-amber'
                        }`}>
                          {s.feeStatus}
                        </span>
                      </td>
                      <td className="table-td" style={{
                        color: s.dueAmount > 0 ? '#dc2626' : '#16a34a',
                        fontWeight: 600,
                      }}>
                        {s.dueAmount > 0 ? formatCurrency(s.dueAmount) : '—'}
                      </td>
                      <td className="table-td">
                        <span className={`pill ${
                          risk === 'High'   ? 'pill-red'   :
                          risk === 'Medium' ? 'pill-amber' :
                          risk === 'Low'    ? 'pill-green' : 'pill-gray'
                        }`}>
                          {risk}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className="font-mono font-bold text-base"
                              style={{ color: grade === 'A' ? '#16a34a'
                                : grade === 'B' ? '#1a73e8'
                                : grade === 'C' ? '#d97706'
                                : grade === 'F' ? '#dc2626' : '#94a3b8' }}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
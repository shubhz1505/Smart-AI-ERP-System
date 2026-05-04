import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { attendanceService } from '../../services/dataServices'
import { studentService } from '../../services/studentService'
import { SectionHeader, ProgressBar, Spinner, Empty } from '../../components/ui'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function MyAttendance() {
  const { user } = useAuthStore()

  const { data: studentData } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => studentService.getByUserId(user?.id),
    retry: 1,
    enabled: !!user?.id,
  })

  const student   = studentData?.data || studentData || {}
  const studentId = user?.studentId || student?.id

  const { data: overallData, isLoading } = useQuery({
    queryKey: ['my-attendance-overall', studentId],
    queryFn: () => attendanceService.getOverall(studentId),
    retry: 1,
    enabled: !!studentId,
  })

  const { data: recordsData } = useQuery({
    queryKey: ['my-attendance-records', studentId],
    queryFn: () => attendanceService.getByStudent(studentId),
    retry: 1,
    enabled: !!studentId,
  })

  const overall = overallData?.data || overallData || {}
  const records = recordsData?.data || recordsData || []

  const percentage    = overall?.overallPercentage || overall?.percentage || 0
  const presentCount  = overall?.presentClasses    || records.filter(r => r.status === 'present').length || 0
  const absentCount   = (overall?.totalClasses || records.length) - presentCount
  const totalClasses  = overall?.totalClasses      || records.length || 0
  const isSafe        = percentage >= 75

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-5">
      <div>
        <h2 className="section-title">My Attendance</h2>
        <p className="section-sub">Track your attendance records</p>
      </div>

      {/* Overall Card */}
      <div className="ai-card text-center py-8">
        <p className="text-gray-400 text-sm mb-2">Overall Attendance</p>
        <p className="font-display text-7xl font-bold mb-3"
          style={{ color: isSafe ? '#10b981' : '#ef4444' }}>
          {percentage}%
        </p>
        <span className={`pill text-sm px-4 py-1 ${isSafe ? 'pill-green' : 'pill-red'}`}>
          {isSafe ? '✅ Safe — Above 75%' : '⚠️ Danger — Below 75%'}
        </span>
        {!isSafe && (
          <p className="text-red-400 text-xs mt-3">
            You may not be eligible for exams. Please attend more classes.
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <CheckCircle size={20} className="text-green-400 mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-green-400">{presentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </div>
        <div className="card text-center">
          <XCircle size={20} className="text-red-400 mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-red-400">{absentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Absent</p>
        </div>
        <div className="card text-center">
          <Calendar size={20} className="text-purple-400 mx-auto mb-2" />
          <p className="font-display text-2xl font-bold text-purple-400">{totalClasses}</p>
          <p className="text-xs text-gray-500 mt-1">Total Classes</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <SectionHeader title="Attendance Progress" sub="Minimum required: 75%" />
        <ProgressBar value={percentage} color={isSafe ? '#10b981' : '#ef4444'} />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span className="text-amber-400">75% minimum</span>
          <span>100%</span>
        </div>
        <div className="mt-3 p-3 bg-bg-tertiary rounded-lg text-xs text-gray-400">
          {isSafe
            ? `You are safe! You can afford ${Math.floor(((percentage - 75) * totalClasses) / 100)} more absences.`
            : `You need to attend ${Math.ceil(((75 * totalClasses) - (presentCount * 100)) / 25)} more classes to reach 75%.`
          }
        </div>
      </div>

      {/* Attendance Records */}
      {records.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-black">Attendance Records</h3>
            <p className="text-xs text-gray-500 mt-0.5">{records.length} records</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Date', 'Course', 'Status'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td className="table-td text-gray-800 text-xs">{r.date}</td>
                    <td className="table-td text-gray-800 text-xs">{r.courseName || r.courseId || '—'}</td>
                    <td className="table-td">
                      <span className={`pill text-[10px] ${
                        r.status === 'present' ? 'pill-green' :
                        r.status === 'late'    ? 'pill-amber' : 'pill-red'
                      }`}>
                        {r.status === 'present' ? '✅' : r.status === 'late' ? '⏰' : '❌'} {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {records.length === 0 && !isLoading && (
        <Empty icon="📋" message="No attendance records found yet" />
      )}
    </div>
  )
}
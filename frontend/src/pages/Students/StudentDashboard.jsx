import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { dashboardService } from '../../services/dataServices'
import { ProgressBar, SectionHeader, AIBadge, Spinner } from '../../components/ui'
import { BookOpen, ClipboardList, CreditCard, User } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard', user?.id],
    queryFn: () => dashboardService.getStudent(user?.id || 1),
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const dash = data?.data || {}
  const student = dash.student || {}
  const attendance = dash.attendance || {}
  const feeStatus = dash.feeStatus || {}
  const courses = dash.enrolledCourses || []

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-6">
      {/* Welcome */}
      <div className="ai-card">
        <AIBadge label="Student Portal" />
        <h1 className="font-display text-xl font-bold text-white mt-1">
          Welcome back, {student.name || user?.email}! 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {student.rollNumber} · {student.department} · Semester {student.semester}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-purple-400" />
            <div>
              <p className="text-xs text-gray-500">Enrolled Courses</p>
              <p className="font-display text-lg font-bold text-purple-400">
                {dash.totalEnrolledCourses || courses.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} className="text-green-400" />
            <div>
              <p className="text-xs text-gray-500">Attendance</p>
              <p className={`font-display text-lg font-bold ${attendance.percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                {attendance.percentage || 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-cyan-400" />
            <div>
              <p className="text-xs text-gray-500">Fee Status</p>
              <p className={`font-display text-lg font-bold ${
                feeStatus.status === 'Paid' ? 'text-green-400' :
                feeStatus.status === 'Pending' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {feeStatus.status || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <User size={20} className="text-amber-400" />
            <div>
              <p className="text-xs text-gray-500">Semester</p>
              <p className="font-display text-lg font-bold text-amber-400">
                Sem {student.semester || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="card">
        <SectionHeader title="My Attendance" sub="This semester" />
        <div className="text-center py-4">
          <p className={`font-display text-5xl font-bold ${attendance.percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
            {attendance.percentage || 0}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {attendance.presentClasses} present out of {attendance.totalClasses} classes
          </p>
          <span className={`pill mt-3 inline-flex ${attendance.status === 'Safe' ? 'pill-green' : 'pill-red'}`}>
            {attendance.status || 'N/A'}
          </span>
        </div>
        {attendance.percentage < 75 && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
            ⚠️ Attendance below 75%! You may not be eligible for exams.
          </div>
        )}
        <ProgressBar
          value={attendance.percentage || 0}
          color={attendance.percentage >= 75 ? '#10b981' : '#ef4444'}
          className="mt-4"
        />
      </div>

      {/* Fee Status */}
      <div className="card">
        <SectionHeader title="My Fee Status" sub="Current semester" />
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div className="bg-bg-tertiary rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Fee</p>
            <p className="font-display text-lg font-bold text-white">
              {formatCurrency(feeStatus.totalFee || 0)}
            </p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Paid</p>
            <p className="font-display text-lg font-bold text-green-400">
              {formatCurrency(feeStatus.totalPaid || 0)}
            </p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Due</p>
            <p className="font-display text-lg font-bold text-red-400">
              {formatCurrency(feeStatus.totalDue || 0)}
            </p>
          </div>
        </div>
        <ProgressBar
          value={feeStatus.totalFee ? (feeStatus.totalPaid / feeStatus.totalFee) * 100 : 0}
          color="#10b981"
        />
      </div>

      {/* Enrolled Courses */}
      <div className="card">
        <SectionHeader title="My Enrolled Courses" sub={`${courses.length} courses this semester`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {courses.map(c => (
            <div key={c.courseId} className="bg-bg-tertiary rounded-lg p-3 flex items-center gap-3">
              <div className="p-2 bg-brand/15 rounded-lg">
                <BookOpen size={15} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{c.courseName}</p>
                <p className="text-xs text-gray-500">{c.courseCode} · {c.credits} Credits</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
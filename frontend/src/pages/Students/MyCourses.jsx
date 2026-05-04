import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { courseService } from '../../services/dataServices'
import { studentService } from '../../services/studentService'
import { SectionHeader, Spinner, Empty } from '../../components/ui'
import { BookOpen } from 'lucide-react'

export default function MyCourses() {
  const { user } = useAuthStore()

  const { data: studentData } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => studentService.getByUserId(user?.id),
    retry: 1,
    enabled: !!user?.id && !user?.studentId,
  })

  const studentId = user?.studentId || studentData?.data?.id || studentData?.id

  const { data, isLoading } = useQuery({
    queryKey: ['my-courses', studentId],
    queryFn: () => courseService.getByStudent(studentId),
    retry: 1,
    enabled: !!studentId,
  })

  const courses = (data?.data || data || []).map(c => ({
    ...c,
    name:       c.courseName  || c.name       || '—',
    code:       c.courseCode  || c.code       || '—',
    instructor: c.instructor  || c.description || '—',
    department: c.department  || '—',
    credits:    c.credits     || 0,
    semester:   c.semester    || '—',
  }))

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-5">
      <div>
        <h2 className="section-title">My Courses</h2>
        <p className="section-sub">Enrolled courses this semester · {courses.length} courses</p>
      </div>

      {courses.length === 0 ? <Empty icon="📚" message="You are not enrolled in any courses yet"/> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(c => (
            <div key={c.id} className="card hover:border-border-strong transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-brand/15 rounded-lg">
                  <BookOpen size={18} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-black text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.code} · {c.credits} Credits · Sem {c.semester}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.instructor}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="pill pill-blue text-[10px]">{c.department}</span>
                    <span className="pill pill-green text-[10px]">Enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
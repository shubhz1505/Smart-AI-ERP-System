import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { courseService } from '../../services/dataServices'
import { SectionHeader } from '../../components/ui'
import { mockCourses } from '../../utils/mockData'
import { BookOpen } from 'lucide-react'

export default function MyCourses() {
  const { user } = useAuthStore()

  const { data } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => courseService.getByStudent(user?.id || 1),
    retry: false,
    placeholderData: { data: mockCourses },
  })

  const courses = Array.isArray(data?.data || data) ? (data?.data || data) : mockCourses

  return (
    <div className="page-wrapper space-y-5">
      <div>
        <h2 className="section-title">My Courses</h2>
        <p className="section-sub">Enrolled courses this semester</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c.id} className="card hover:border-border-strong transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-brand/15 rounded-lg">
                <BookOpen size={18} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.code} · {c.credits} Credits · Sem {c.semester}</p>
                <p className="text-xs text-gray-500 mt-0.5">👤 {c.instructor}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="pill pill-blue text-[10px]">{c.department}</span>
                  <span className="pill pill-green text-[10px]">Enrolled</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
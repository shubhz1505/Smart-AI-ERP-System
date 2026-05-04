import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '../../services/dataServices'
import { Modal, Spinner, Empty } from '../../components/ui'
import { Plus, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { courseCode: '', courseName: '', department: 'Computer Science', credits: 3, semester: 1, capacity: 60, description: '' }

// ── Real enrollment count per course ─────────────────────────────────────────
function EnrollmentCount({ courseId, capacity }) {
  const { data } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => courseService.getEnrollments(courseId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: !!courseId,
  })

  // API returns { success, data: [...enrollments] }
  const enrollments = data?.data || data || []
  const enrolled    = Array.isArray(enrollments) ? enrollments.length : 0
  const cap         = capacity || 60
  const fillPct     = Math.round((enrolled / cap) * 100)

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <Users size={11} /> {enrolled}/{cap} enrolled
        </span>
        <span className={fillPct > 90 ? 'text-red-400' : fillPct > 70 ? 'text-amber-400' : 'text-green-400'}>
          {fillPct}% full
        </span>
      </div>
      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${fillPct}%`,
            background: fillPct > 90 ? '#ef4444' : fillPct > 70 ? '#f59e0b' : '#10b981'
          }} />
      </div>
    </div>
  )
}

export default function Courses() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY)

  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
    retry: 1,
  })

  const courses = (data?.data || data || []).map(c => ({
    ...c,
    code:        c.courseCode  || c.code        || '—',
    name:        c.courseName  || c.name        || '—',
    description: c.description || '',
    credits:     c.credits     || 0,
    semester:    c.semester    || '—',
    capacity:    c.capacity    || 60,
    department:  c.department  || '—',
  }))

  // Fetch all enrollments to calculate totals for stat cards
  const { data: allEnrollmentsData } = useQuery({
    queryKey: ['all-enrollments-count'],
    queryFn: async () => {
      const results = await Promise.all(
        courses.map(c => courseService.getEnrollments(c.id))
      )
      return results.map((r, i) => ({
        courseId: courses[i]?.id,
        count: Array.isArray(r?.data) ? r.data.length : Array.isArray(r) ? r.length : 0,
      }))
    },
    enabled: courses.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const enrollmentCounts = allEnrollmentsData || []
  const totalEnrolled    = enrollmentCounts.reduce((a, e) => a + e.count, 0)
  const avgFillRate      = courses.length > 0
    ? Math.round(enrollmentCounts.reduce((a, e) => {
        const cap = courses.find(c => c.id === e.courseId)?.capacity || 60
        return a + (e.count / cap * 100)
      }, 0) / courses.length)
    : 0

  const createMutation = useMutation({
    mutationFn: courseService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      qc.invalidateQueries({ queryKey: ['all-enrollments-count'] })
      toast.success('Course created')
      setShowModal(false)
      setForm(EMPTY)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create course'),
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const DEPT_COLORS = {
    'Computer Science':       'bg-purple-500/15 text-purple-400',
    'Management':             'bg-cyan-500/15 text-cyan-400',
    'IT':                     'bg-blue-500/15 text-blue-400',
    'Information Technology': 'bg-blue-500/15 text-blue-400',
    'Electronics':            'bg-green-500/15 text-green-400',
    'Mechanical':             'bg-amber-500/15 text-amber-400',
    'CSE':                    'bg-purple-500/15 text-purple-400',
  }

  const departments = [...new Set(courses.map(c => c.department))].length

  return (
    <div className="page-wrapper space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Course Management</h2>
          <p className="section-sub">{courses.length} courses from database</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-xs">
          <Plus size={13} /> Add Course
        </button>
      </div>

      {/* Stats — real data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses',  value: courses.length,  color: 'text-purple-400' },
          { label: 'Total Enrolled', value: totalEnrolled,   color: 'text-cyan-400'   },
          { label: 'Avg Fill Rate',  value: avgFillRate+'%', color: 'text-green-400'  },
          { label: 'Departments',    value: departments,     color: 'text-amber-400'  },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? <Spinner /> : courses.length === 0 ? (
        <Empty icon="📚" message="No courses found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(c => (
            <div key={c.id} className="card hover:border-border-strong transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <span className={`pill text-[10px] ${DEPT_COLORS[c.department] || 'bg-gray-500/15 text-gray-400'}`}>
                  {c.department}
                </span>
                <span className="text-xs font-mono text-gray-500 bg-bg-tertiary px-2 py-0.5 rounded">
                  {c.code}
                </span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-purple-400 transition-colors">
                {c.name}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {c.description || 'No description'} · {c.credits} credits · Sem {c.semester}
              </p>
              {/* Real enrollment count per course */}
              <EnrollmentCount courseId={c.id} capacity={c.capacity} />
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Course">
        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Course Code *</label>
              <input className="input" value={form.courseCode} onChange={set('courseCode')}
                placeholder="CS-301" required />
            </div>
            <div>
              <label className="label">Credits</label>
              <select className="input" value={form.credits} onChange={set('credits')}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Credits</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Course Name *</label>
              <input className="input" value={form.courseName} onChange={set('courseName')}
                placeholder="Data Structures & Algorithms" required />
            </div>
            <div>
              <label className="label">Department</label>
              <select className="input" value={form.department} onChange={set('department')}>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Management</option>
                <option>Electronics</option>
                <option>Mechanical</option>
                <option>CSE</option>
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select className="input" value={form.semester} onChange={set('semester')}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Capacity</label>
              <input type="number" className="input" value={form.capacity}
                onChange={set('capacity')} min={1} />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={set('description')}
                placeholder="Course description..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createMutation.isPending}
              className="btn-primary flex-1 justify-center">
              {createMutation.isPending ? 'Creating...' : 'Create Course'}
            </button>
            <button type="button" onClick={() => setShowModal(false)}
              className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '../../services/dataServices'
import { Modal, SectionHeader } from '../../components/ui'
import { Plus, Users } from 'lucide-react'
import { mockCourses } from '../../utils/mockData'
import toast from 'react-hot-toast'

const EMPTY = { code: '', name: '', department: 'Computer Science', credits: 3, semester: 1, instructor: '', capacity: 60 }

export default function Courses() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const { data } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
    retry: false,
    placeholderData: { data: mockCourses },
  })
  const courses = data?.data || data || mockCourses

  const createMutation = useMutation({
    mutationFn: courseService.create,
    onSuccess: () => { qc.invalidateQueries(['courses']); toast.success('Course created'); setShowModal(false) },
    onError: () => { toast.success('Course created (Demo)'); setShowModal(false) },
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const DEPT_COLORS = {
    'Computer Science': 'bg-purple-500/15 text-purple-400',
    'Management':       'bg-cyan-500/15 text-cyan-400',
    'IT':               'bg-blue-500/15 text-blue-400',
  }

  return (
    <div className="page-wrapper space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Course Management</h2>
          <p className="section-sub">{courses.length} courses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-xs"><Plus size={13} /> Add Course</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses',  value: courses.length,                                                                                    color: 'text-purple-400' },
          { label: 'Total Enrolled', value: courses.reduce((a,c)=>a+(c.enrolled||0),0),                                                        color: 'text-cyan-400' },
          { label: 'Avg Fill Rate',  value: Math.round(courses.reduce((a,c)=>a+((c.enrolled||0)/(c.capacity||1)*100),0)/courses.length)+'%',   color: 'text-green-400' },
          { label: 'Departments',    value: [...new Set(courses.map(c=>c.department))].length,                                                  color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map(c => {
          const fillPct = Math.round(((c.enrolled||0)/(c.capacity||1))*100)
          return (
            <div key={c.id} className="card hover:border-border-strong transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <span className={`pill text-[10px] ${DEPT_COLORS[c.department]||'bg-gray-500/15 text-gray-400'}`}>{c.department}</span>
                <span className="text-xs font-mono text-gray-500 bg-bg-tertiary px-2 py-0.5 rounded">{c.code}</span>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-purple-400 transition-colors">{c.name}</h3>
              <p className="text-xs text-gray-500 mb-3">👤 {c.instructor} · {c.credits} credits · Sem {c.semester}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1"><Users size={11} /> {c.enrolled}/{c.capacity} enrolled</span>
                <span className={fillPct>90?'text-red-400':fillPct>70?'text-amber-400':'text-green-400'}>{fillPct}% full</span>
              </div>
              <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width:`${fillPct}%`, background: fillPct>90?'#ef4444':fillPct>70?'#f59e0b':'#10b981' }} />
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Course">
        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Course Code *</label><input className="input" value={form.code} onChange={set('code')} placeholder="CS-301" required /></div>
            <div><label className="label">Credits</label><select className="input" value={form.credits} onChange={set('credits')}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} Credits</option>)}</select></div>
            <div className="col-span-2"><label className="label">Course Name *</label><input className="input" value={form.name} onChange={set('name')} placeholder="Data Structures & Algorithms" required /></div>
            <div><label className="label">Department</label><select className="input" value={form.department} onChange={set('department')}><option>Computer Science</option><option>Management</option><option>IT</option></select></div>
            <div><label className="label">Semester</label><select className="input" value={form.semester} onChange={set('semester')}>{[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Sem {s}</option>)}</select></div>
            <div><label className="label">Instructor</label><input className="input" value={form.instructor} onChange={set('instructor')} placeholder="Dr. A. Kumar" /></div>
            <div><label className="label">Capacity</label><input type="number" className="input" value={form.capacity} onChange={set('capacity')} min={1} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Create Course</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
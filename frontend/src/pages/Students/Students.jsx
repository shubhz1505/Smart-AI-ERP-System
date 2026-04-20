import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentService } from '../../services/studentService'
import { Modal, Avatar, Empty, Spinner } from '../../components/ui'
import { Search, Plus, Download } from 'lucide-react'
import { mockStudents } from '../../utils/mockData'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', email: '', phone: '', course: '', semester: 1, address: '' }

export default function Students() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal]     = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAll,
    retry: false,
    placeholderData: { data: mockStudents },
  })

  const rawStudents = data?.data || data || mockStudents

  // Normalize: backend sends firstName/lastName, component needs name
  const students = rawStudents.map(s => ({
    ...s,
    name:          s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
    studentId:     s.studentId || s.rollNumber || String(s.id),
    course:        s.course || s.department || 'N/A',
    feeStatus:     s.feeStatus || 'pending',
    attendancePct: s.attendancePct ?? 0,
  }))

  const createMutation = useMutation({
    mutationFn: studentService.create,
    onSuccess: () => { qc.invalidateQueries(['students']); toast.success('Student added'); closeModal() },
    onError: ()  => { toast.success('Student added (Demo)'); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => { qc.invalidateQueries(['students']); toast.success('Student deleted') },
    onError: ()  => toast.success('Student deleted (Demo)'),
  })

  const filtered = students.filter(s => {
    const matchSearch =
      (s.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.studentId || '').includes(search)
    const matchStatus = filterStatus === 'all' || s.feeStatus === filterStatus
    return matchSearch && matchStatus
  })

  const openAdd   = () => { setEditStudent(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit  = (s) => {
    setEditStudent(s)
    setForm({ name: s.name, email: s.email, phone: s.phone || '', course: s.course, semester: s.semester || 1, address: s.address || '' })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditStudent(null) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editStudent) { toast.success('Student updated (Demo)'); closeModal() }
    else createMutation.mutate(form)
  }

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Course', 'Semester', 'Fee Status', 'Attendance'],
      ...filtered.map(s => [s.studentId, s.name, s.email, s.course, s.semester, s.feeStatus, s.attendancePct + '%'])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'students.csv'
    a.click()
    toast.success('CSV exported')
  }

  return (
    <div className="page-wrapper space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Student Management</h2>
          <p className="section-sub">{filtered.length} of {students.length} students</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-xs">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={13} /> Add Student
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9"
            placeholder="Search by name, email or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="paid">Fee Paid</option>
          <option value="pending">Fee Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="👥" message="No students found" />
        ) : (
          <div className="table-wrap">
            <table className="w-full">
              <thead>
                <tr>
                  {['Student', 'Course', 'Semester', 'Attendance', 'Fee Status', 'Actions'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <p className="font-medium text-sm text-white">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.studentId} · {s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-300">{s.course}</td>
                    <td className="table-td text-gray-300">Sem {s.semester}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.attendancePct}%`,
                              background: s.attendancePct > 75 ? '#10b981' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{s.attendancePct}%</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`pill ${s.feeStatus === 'paid' ? 'pill-green' : s.feeStatus === 'overdue' ? 'pill-red' : 'pill-amber'}`}>
                        {s.feeStatus}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1.5">
                        <button onClick={() => navigate(`/students/${s.id}`)} className="btn-sm text-xs">View</button>
                        <button onClick={() => openEdit(s)} className="btn-sm text-xs text-purple-400 border-purple-500/30">Edit</button>
                        <button onClick={() => { if (confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id) }} className="btn-danger">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={closeModal} title={editStudent ? 'Edit Student' : 'Add New Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Priya Patel" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label">Course *</label>
              <select className="input" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} required>
                <option value="">Select course</option>
                {['B.Tech CS', 'MBA', 'BCA', 'B.Com', 'B.Sc IT', 'B.Tech EC'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select className="input" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: +e.target.value }))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">
              {editStudent ? 'Update' : 'Add Student'}
            </button>
            <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
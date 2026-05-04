import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentService } from '../../services/studentService'
import { attendanceService, feeService } from '../../services/dataServices'
import { Modal, Avatar, Empty, Spinner } from '../../components/ui'
import { Search, Plus, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', department: '', semester: 1, rollNumber: '' }

// ── Real attendance per student ───────────────────────────────────────────────
function StudentAttendanceCell({ studentId }) {
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

// ── Real fee status per student ───────────────────────────────────────────────
function StudentFeeStatusCell({ studentId }) {
  const { data } = useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: () => feeService.getByStudent(studentId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: !!studentId,
  })

  const fees = data?.data || data || []
  const feeList = Array.isArray(fees) ? fees : []

  // Determine worst status: overdue > pending > paid
  let status = 'paid'
  if (feeList.some(f => (f.paymentStatus || f.status || '').toLowerCase() === 'overdue')) {
    status = 'overdue'
  } else if (feeList.some(f => (f.paymentStatus || f.status || '').toLowerCase() === 'pending')) {
    status = 'pending'
  } else if (feeList.length === 0) {
    status = 'no record'
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

export default function Students() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal]       = useState(false)
  const [editStudent, setEditStudent]   = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAll,
    retry: 1,
  })

  const rawStudents = data?.data || data || []
  const students = rawStudents.map(s => ({
    ...s,
    name:      s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
    studentId: s.studentId || s.rollNumber || String(s.id),
    course:    s.course || s.department || 'N/A',
  }))

  const createMutation = useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('Student added')
      closeModal()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add student'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => studentService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      qc.invalidateQueries({ queryKey: ['student-profile'] })
      toast.success('Student updated')
      closeModal()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update student'),
  })

  const deleteMutation = useMutation({
  mutationFn: studentService.delete,

  onSuccess: (_, deletedId) => {
    // 🔥 remove student instantly from UI
    qc.setQueryData(['students'], (oldData) => {
      if (!oldData) return oldData

      const data = oldData.data || oldData

      return {
        ...oldData,
        data: data.filter(s => s.id !== deletedId)
      }
    })

    qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
    toast.success('Student deleted')
  },

  onError: (err) => {
    toast.error(err.response?.data?.message || 'Failed to delete student')
  },
})

  const filtered = students.filter(s => {
    const matchSearch =
      (s.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (s.studentId || '').includes(search)
    return matchSearch
  })

  const openAdd  = () => { setEditStudent(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (s) => {
    setEditStudent(s)
    setForm({
      firstName:  s.firstName  || '',
      lastName:   s.lastName   || '',
      email:      s.email      || '',
      phone:      s.phone      || '',
      department: s.department || '',
      semester:   s.semester   || 1,
      rollNumber: s.rollNumber || '',
    })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditStudent(null) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editStudent) {
      updateMutation.mutate({ id: editStudent.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const exportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Course', 'Semester'],
      ...filtered.map(s => [s.studentId, s.name, s.email, s.course, s.semester])
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
          <input className="input pl-9" placeholder="Search by name, email or ID..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="👥" message="No students found" />
        ) : (
          <div className="table-wrap">
            <table className="w-full">
              <thead>
                <tr>{['Student', 'Course', 'Semester', 'Attendance', 'Fee Status', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <p className="font-medium text-sm text-black">{s.name}</p>
                          <p className="text-[10px] text-gray-500">{s.studentId} · {s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-600">{s.course}</td>
                    <td className="table-td text-gray-600">Sem {s.semester}</td>
                    <td className="table-td">
                      <StudentAttendanceCell studentId={s.id} />
                    </td>
                    <td className="table-td">
                      <StudentFeeStatusCell studentId={s.id} />
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1.5">
                        <button onClick={() => navigate(`/students/${s.id}`)} className="btn-sm text-xs">View</button>
                        <button onClick={() => openEdit(s)} className="btn-sm text-xs text-purple-400 border-purple-500/30">Edit</button>
                        <button onClick={() => { if (confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id) }}
                          className="btn-danger">Del</button>
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
            <div><label className="label">First Name *</label>
              <input className="input" value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            </div>
            <div><label className="label">Last Name *</label>
              <input className="input" value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
            </div>
            <div><label className="label">Email *</label>
              <input type="email" className="input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div><label className="label">Phone</label>
              <input className="input" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div><label className="label">Roll Number *</label>
              <input className="input" value={form.rollNumber}
                onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} required />
            </div>
            <div><label className="label">Department</label>
              <input className="input" value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
            </div>
            <div><label className="label">Semester</label>
              <select className="input" value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: +e.target.value }))}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex-1 justify-center">
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editStudent ? 'Update' : 'Add Student')}
            </button>
            <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
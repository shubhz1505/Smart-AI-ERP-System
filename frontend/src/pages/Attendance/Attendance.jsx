import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService, courseService } from '../../services/dataServices'
import { studentService } from '../../services/studentService'
import { SectionHeader, Avatar, Spinner, Empty } from '../../components/ui'
import toast from 'react-hot-toast'

const TODAY = new Date().toISOString().split('T')[0]

export default function Attendance() {
  const qc = useQueryClient()
  const [tab, setTab]           = useState('mark')
  const [date, setDate]         = useState(TODAY)
  const [courseId, setCourseId] = useState('')
  const [records, setRecords]   = useState({})

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
    retry: 1,
  })

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAll,
    retry: 1,
  })

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance-by-date', date],
    queryFn: () => attendanceService.getByDate(date),
    retry: 1,
    enabled: tab === 'history',
  })

  const courses     = (coursesData?.data || coursesData || []).map(c => ({
    ...c,
    code: c.code || c.courseCode,
    name: c.name || c.courseName,
  }))
  const rawStudents = studentsData?.data || studentsData || []
  const students    = rawStudents.map(s => ({
    ...s,
    name:      s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
    studentId: s.studentId || s.rollNumber || String(s.id),
  }))

  useEffect(() => {
    if (students.length > 0) {
      setRecords(students.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {}))
    }
  }, [studentsData])

  const markMutation = useMutation({
    mutationFn: attendanceService.mark,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-by-date'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      qc.invalidateQueries({ queryKey: ['my-attendance-overall'] })
      qc.invalidateQueries({ queryKey: ['my-attendance-records'] })
      qc.invalidateQueries({ queryKey: ['ai-dashboard'] })
      toast.success('Attendance marked successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark attendance'),
  })

  const handleMark = () => {
    if (!courseId) { toast.error('Please select a course'); return }
    if (students.length === 0) { toast.error('No students to mark'); return }

    const attendanceList = Object.entries(records).map(([studentId, status]) => ({
      studentId: +studentId,
      status:    status,
    }))

    markMutation.mutate({
      courseId:       +courseId,
      date:           date,
      attendanceList: attendanceList,
    })
  }

  const setAllStatus = (status) => {
    setRecords(students.reduce((a, s) => ({ ...a, [s.id]: status }), {}))
  }

  const presentCount = Object.values(records).filter(v => v === 'present').length
  const absentCount  = Object.values(records).filter(v => v === 'absent').length
  const lateCount    = Object.values(records).filter(v => v === 'late').length

  const attendanceHistory = attendanceData?.data || attendanceData || []

  const studentsWithAttendance = students.map(s => {
  const records = attendanceHistory.filter(a => a.studentId === s.id)

  const total = records.length
  const present = records.filter(r => (r.status || '').toLowerCase() === 'present').length

  const attendancePct = total > 0
    ? Math.round((present / total) * 100)
    : 0

  return {
    ...s,
    attendancePct
  }
})

  return (
    <div className="page-wrapper space-y-5">
      <SectionHeader title="Attendance Management" sub="Mark & track student attendance">
        <div className="tabs !mb-0">
          {['mark', 'history', 'analytics'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? 'active' : ''} capitalize`}>{t}</button>
          ))}
        </div>
      </SectionHeader>

      {tab === 'mark' && (
        <div className="space-y-4">
          <div className="card p-4 flex flex-wrap gap-4">
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Course</label>
              <select className="input" value={courseId} onChange={e => setCourseId(e.target.value)}>
                <option value="">Select course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => setAllStatus('present')} className="btn-secondary text-xs">All Present</button>
              <button onClick={() => setAllStatus('absent')}  className="btn-secondary text-xs">All Absent</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Present', count: presentCount,    color: 'text-green-400',  bg: 'bg-green-500/10'  },
              { label: 'Absent',  count: absentCount,     color: 'text-red-400',    bg: 'bg-red-500/10'    },
              { label: 'Late',    count: lateCount,       color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
              { label: 'Total',   count: students.length, color: 'text-purple-400', bg: 'bg-brand/10'      },
            ].map(s => (
              <div key={s.label} className={`card text-center ${s.bg}`}>
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {studentsLoading ? <Spinner /> : students.length === 0 ? (
            <Empty icon="👥" message="No students found" />
          ) : (
            <div className="card p-0 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>{['Student', 'Roll No', 'Status'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.name} size="sm" />
                          <span className="text-sm font-medium text-black">{s.name}</span>
                        </div>
                      </td>
                      <td className="table-td text-xs text-gray-500">{s.studentId}</td>
                      <td className="table-td">
                        <div className="flex gap-2">
                          {['present', 'absent', 'late'].map(status => (
                            <button key={status}
                              onClick={() => setRecords(r => ({ ...r, [s.id]: status }))}
                              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all capitalize
                                ${records[s.id] === status
                                  ? status === 'present' ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : status === 'absent'  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                    : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                  : 'border-border text-gray-500 hover:border-border-strong'}`}>
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={handleMark} disabled={markMutation.isPending}
            className="btn-primary w-full py-3 justify-center text-sm">
            {markMutation.isPending ? 'Submitting...' : `Submit Attendance — ${date}`}
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <SectionHeader title="Attendance Records" sub={`Date: ${date}`} />
          <div className="mb-4">
            <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          {attendanceHistory.length === 0 ? (
            <Empty icon="📋" message="No attendance records for this date" />
          ) : (
            <div className="table-wrap">
              <table className="w-full">
                <thead>
                  <tr>{['Student', 'Course', 'Status', 'Date'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((a, i) => (
                    <tr key={i}>
                      <td className="table-td text-black">{a.studentName || `Student ${a.studentId}`}</td>
                      <td className="table-td text-gray-600">{a.courseName || `Course ${a.courseId}`}</td>
                      <td className="table-td">
                        <span className={`pill ${
                          a.status === 'present' ? 'pill-green' :
                          a.status === 'late'    ? 'pill-amber' : 'pill-red'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="table-td text-gray-500 text-xs">{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="card">
            <SectionHeader title="Student Attendance Overview" sub="From your database" />
            {students.length === 0 ? <Empty icon="📊" message="No data available" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {studentsWithAttendance.map(s => (
                  <div key={s.id} className="card p-4 flex items-center gap-3">
                    <Avatar name={s.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.studentId} · {s.department || 'N/A'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${s.attendancePct || 0}%`,
                              background: (s.attendancePct || 0) > 75 ? '#10b981' : '#ef4444'
                            }} />
                        </div>
                        <span className="text-xs text-gray-400">{s.attendancePct || 0}%</span>
                      </div>
                    </div>
                    {(s.attendancePct || 0) < 75 && <span className="pill pill-red text-[10px]">Low</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
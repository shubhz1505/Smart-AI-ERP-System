import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { studentService } from '../../services/studentService'
import { Avatar, ProgressBar, SectionHeader } from '../../components/ui'
import { ArrowLeft, Mail, Phone, BookOpen } from 'lucide-react'
import { mockStudents, mockFees } from '../../utils/mockData'
import { formatCurrency } from '../../utils/helpers'

const RADAR_DATA = [
  { subject: 'Attendance', A: 87 }, { subject: 'Assignments', A: 72 },
  { subject: 'Exams', A: 80 },     { subject: 'Projects', A: 90 },
  { subject: 'Labs', A: 76 },      { subject: 'Participation', A: 65 },
]

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: studentData } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getById(id),
    retry: false,
    placeholderData: mockStudents.find(s => s.id === +id) || mockStudents[0],
  })

  const student = studentData?.data || studentData || mockStudents[0]
  const fee = mockFees.find(f => f.studentId === student.studentId) || mockFees[0]

  return (
    <div className="page-wrapper space-y-5">
      <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={15} /> Back to Students
      </button>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar name={student.name} size="lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{student.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{student.studentId} · {student.course} · Semester {student.semester}</p>
              </div>
              <span className={`pill ${student.feeStatus==='paid'?'pill-green':student.feeStatus==='overdue'?'pill-red':'pill-amber'}`}>Fee {student.feeStatus}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-400"><Mail size={13} className="text-gray-600" />{student.email}</div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><Phone size={13} className="text-gray-600" />{student.phone}</div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><BookOpen size={13} className="text-gray-600" />{student.course}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card">
          <SectionHeader title="Attendance" sub="This semester" />
          <div className="text-center py-4">
            <div className="text-4xl font-display font-bold" style={{ color: student.attendancePct>75?'#10b981':'#ef4444' }}>{student.attendancePct}%</div>
            <p className="text-sm text-gray-500 mt-1">Overall Attendance</p>
          </div>
          <ProgressBar value={student.attendancePct} color={student.attendancePct>75?'#10b981':'#ef4444'} className="mb-3" />
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-bg-tertiary rounded-lg p-2"><p className="font-bold text-green-400 text-lg">78</p><p className="text-gray-500">Present</p></div>
            <div className="bg-bg-tertiary rounded-lg p-2"><p className="font-bold text-red-400 text-lg">12</p><p className="text-gray-500">Absent</p></div>
            <div className="bg-bg-tertiary rounded-lg p-2"><p className="font-bold text-amber-400 text-lg">3</p><p className="text-gray-500">Late</p></div>
          </div>
        </div>

        <div className="card">
          <SectionHeader title="Fee Details" sub="Current semester" />
          <div className="space-y-3">
            {[
              { label: 'Total Fee',  value: formatCurrency(fee.amount), color: '' },
              { label: 'Paid',       value: formatCurrency(fee.paid),   color: 'text-green-400' },
              { label: 'Due Amount', value: formatCurrency(fee.due),    color: fee.due>0?'text-red-400':'text-green-400' },
              { label: 'Due Date',   value: fee.dueDate,                color: '' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color||'text-white'}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Payment Progress</span><span>{Math.round((fee.paid/fee.amount)*100)}%</span>
            </div>
            <ProgressBar value={(fee.paid/fee.amount)*100} color="#10b981" />
          </div>
        </div>

        <div className="card">
          <SectionHeader title="AI Performance" sub="Predicted by ML model" />
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Radar dataKey="A" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="bg-bg-tertiary rounded-lg p-3 mt-2">
            <p className="text-xs text-gray-500 mb-1">AI Risk Assessment</p>
            <div className="flex items-center gap-2">
              <span className="pill pill-green">Low Risk</span>
              <span className="text-xs text-gray-400">Predicted pass rate: 92%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
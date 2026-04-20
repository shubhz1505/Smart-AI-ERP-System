import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { attendanceService } from '../../services/dataServices'
import { SectionHeader, Avatar } from '../../components/ui'
import { mockStudents, mockCourses, attendanceWeekly } from '../../utils/mockData'
import { CHART_COLORS } from '../../utils/helpers'
import toast from 'react-hot-toast'

const TODAY = new Date().toISOString().split('T')[0]
const CALENDAR = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  status: ['present','present','present','absent','late','present','present','empty'][Math.floor(Math.random()*8)],
}))

export default function Attendance() {
  const [tab, setTab] = useState('mark')
  const [date, setDate] = useState(TODAY)
  const [courseId, setCourseId] = useState('1')
  const [records, setRecords] = useState(mockStudents.reduce((acc,s) => ({...acc,[s.id]:'present'}),{}))

  const markMutation = useMutation({
    mutationFn: attendanceService.mark,
    onSuccess: () => toast.success('Attendance marked successfully'),
    onError: () => toast.success('Attendance marked (Demo)'),
  })

  const handleMark = () => {
    const entries = Object.entries(records).map(([studentId, status]) => ({ studentId: +studentId, courseId: +courseId, date, status }))
    markMutation.mutate({ entries })
  }

  const presentCount = Object.values(records).filter(v => v==='present').length
  const absentCount  = Object.values(records).filter(v => v==='absent').length

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return <div className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-1">{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color}}>{p.name}: {p.value}%</p>)}</div>
  }

  return (
    <div className="page-wrapper space-y-5">
      <SectionHeader title="Attendance Management" sub="Mark & track student attendance">
        <div className="tabs !mb-0">
          {['mark','history','analytics'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`tab ${tab===t?'active':''} capitalize`}>{t}</button>
          ))}
        </div>
      </SectionHeader>

      {tab === 'mark' && (
        <div className="space-y-4">
          <div className="card p-4 flex flex-wrap gap-4">
            <div><label className="label">Date</label><input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)} /></div>
            <div><label className="label">Course</label>
              <select className="input" value={courseId} onChange={e=>setCourseId(e.target.value)}>
                {mockCourses.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={()=>setRecords(mockStudents.reduce((a,s)=>({...a,[s.id]:'present'}),{}))} className="btn-secondary text-xs">All Present</button>
              <button onClick={()=>setRecords(mockStudents.reduce((a,s)=>({...a,[s.id]:'absent'}),{}))} className="btn-secondary text-xs">All Absent</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'Present', count:presentCount, color:'text-green-400', bg:'bg-green-500/10' },
              { label:'Absent',  count:absentCount,  color:'text-red-400',   bg:'bg-red-500/10' },
              { label:'Total',   count:mockStudents.length, color:'text-purple-400', bg:'bg-brand/10' },
            ].map(s=>(
              <div key={s.label} className={`card text-center ${s.bg}`}>
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead><tr>{['Student','ID','Status'].map(h=><th key={h} className="table-th">{h}</th>)}</tr></thead>
              <tbody>
                {mockStudents.map(s=>(
                  <tr key={s.id}>
                    <td className="table-td"><div className="flex items-center gap-2.5"><Avatar name={s.name} size="sm" /><span className="text-sm font-medium text-white">{s.name}</span></div></td>
                    <td className="table-td text-xs text-gray-500">{s.studentId}</td>
                    <td className="table-td">
                      <div className="flex gap-2">
                        {['present','absent','late'].map(status=>(
                          <button key={status} onClick={()=>setRecords(r=>({...r,[s.id]:status}))}
                            className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all capitalize
                              ${records[s.id]===status
                                ? status==='present'?'bg-green-500/20 border-green-500/50 text-green-400'
                                  :status==='absent'?'bg-red-500/20 border-red-500/50 text-red-400'
                                  :'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                :'border-border text-gray-500 hover:border-border-strong'}`}>
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
          <button onClick={handleMark} className="btn-primary w-full py-3 justify-center text-sm">Submit Attendance — {date}</button>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <SectionHeader title="April 2025 Calendar" sub="P = Present · A = Absent · L = Late" />
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="text-center text-[10px] text-gray-600 font-semibold py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(2).fill(null).map((_,i)=><div key={i} />)}
            {CALENDAR.map(({day,status})=>(
              <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer hover:scale-105 transition-transform
                ${status==='present'?'bg-green-500/20 text-green-400':status==='absent'?'bg-red-500/15 text-red-400':status==='late'?'bg-amber-500/15 text-amber-400':'bg-bg-tertiary text-gray-600'}`}>
                {day}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="card">
            <SectionHeader title="Weekly Attendance by Department" sub="% attendance per day" />
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={attendanceWeekly} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="day" tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis domain={[60,100]} tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip content={({active,payload,label})=>active&&payload?.length?<div className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-1">{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color}}>{p.name}: {p.value}%</p>)}</div>:null} />
                <Bar dataKey="cs"   fill={CHART_COLORS.brand} radius={[3,3,0,0]} name="CS" />
                <Bar dataKey="mba"  fill={CHART_COLORS.cyan}  radius={[3,3,0,0]} name="MBA" />
                <Bar dataKey="bca"  fill={CHART_COLORS.green} radius={[3,3,0,0]} name="BCA" />
                <Bar dataKey="bcom" fill={CHART_COLORS.amber} radius={[3,3,0,0]} name="B.Com" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockStudents.slice(0,6).map(s=>(
              <div key={s.id} className="card p-4 flex items-center gap-3">
                <Avatar name={s.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${s.attendancePct}%`,background:s.attendancePct>75?'#10b981':'#ef4444'}} />
                    </div>
                    <span className="text-xs text-gray-400">{s.attendancePct}%</span>
                  </div>
                </div>
                {s.attendancePct < 75 && <span className="pill pill-red text-[10px]">Low</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
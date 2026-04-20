import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { SectionHeader } from '../components/ui'
import { revenueData, attendanceWeekly, mockStudents } from '../utils/mockData'
import { CHART_COLORS, formatCurrency } from '../utils/helpers'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Reports() {
  return (
    <div className="page-wrapper space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="section-title">Reports & Analytics</h2><p className="section-sub">Export data as CSV or PDF</p></div>
        <div className="flex gap-2">
          <button onClick={()=>toast.success('CSV exported')} className="btn-secondary flex items-center gap-2 text-xs"><Download size={13}/> CSV</button>
          <button onClick={()=>toast.success('PDF exported')} className="btn-primary flex items-center gap-2 text-xs"><Download size={13}/> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Revenue (YTD)', value:formatCurrency(10600000), color:'text-green-400' },
          { label:'Collection Rate',     value:'78%',                    color:'text-purple-400' },
          { label:'Avg Attendance',      value:'87.3%',                  color:'text-cyan-400' },
          { label:'Pass Rate',           value:'91%',                    color:'text-amber-400' },
        ].map(s=>(
          <div key={s.label} className="card"><p className="text-xs text-gray-500 mb-1">{s.label}</p><p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionHeader title="Revenue — FY 2025-26" sub="Monthly fee collection"/>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false}/>
              <XAxis dataKey="month" tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#141d33',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,fontSize:12}}/>
              <Area type="monotone" dataKey="amount" stroke="#6c63ff" fill="url(#revGrad)" strokeWidth={2} name="₹ Lakhs"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <SectionHeader title="Attendance by Department" sub="Weekly average"/>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attendanceWeekly} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false}/>
              <XAxis dataKey="day" tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={[60,100]} tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#141d33',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,fontSize:12}}/>
              <Bar dataKey="cs"   fill={CHART_COLORS.brand} radius={[3,3,0,0]} name="CS"/>
              <Bar dataKey="mba"  fill={CHART_COLORS.cyan}  radius={[3,3,0,0]} name="MBA"/>
              <Bar dataKey="bca"  fill={CHART_COLORS.green} radius={[3,3,0,0]} name="BCA"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold text-white">Student Performance Report</h3><p className="text-[10px] text-gray-500 mt-0.5">AI-generated · Exam Performance Model · Port 8003</p></div>
        <table className="w-full">
          <thead><tr>{['Student','Course','Attendance','Fee Status','AI Risk','Predicted Grade'].map(h=><th key={h} className="table-th">{h}</th>)}</tr></thead>
          <tbody>
            {mockStudents.map(s=>{
              const risk = s.attendancePct<65?'High':s.attendancePct<75?'Medium':'Low'
              const grade = s.attendancePct>85?'A':s.attendancePct>75?'B':s.attendancePct>65?'C':'D'
              return (
                <tr key={s.id}>
                  <td className="table-td font-medium text-white">{s.name}</td>
                  <td className="table-td text-gray-300">{s.course}</td>
                  <td className="table-td"><span className={s.attendancePct>75?'text-green-400':'text-red-400'}>{s.attendancePct}%</span></td>
                  <td className="table-td"><span className={`pill ${s.feeStatus==='paid'?'pill-green':s.feeStatus==='overdue'?'pill-red':'pill-amber'}`}>{s.feeStatus}</span></td>
                  <td className="table-td"><span className={`pill ${risk==='High'?'pill-red':risk==='Medium'?'pill-amber':'pill-green'}`}>{risk}</span></td>
                  <td className="table-td"><span className="font-mono font-bold text-white">{grade}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
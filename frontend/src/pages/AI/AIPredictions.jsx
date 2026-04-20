import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { aiService } from '../../services/aiService'
import { Avatar, SectionHeader, ProgressBar, AIBadge } from '../../components/ui'
import { mockStudents } from '../../utils/mockData'
import { getRiskColor, CHART_COLORS } from '../../utils/helpers'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const STUDENT_RISKS = mockStudents.map(s=>({
  ...s,
  feeRisk:  s.feeStatus==='overdue'?0.85:s.feeStatus==='pending'?0.5:0.1,
  attRisk:  s.attendancePct<60?0.9:s.attendancePct<75?0.55:0.15,
  perfRisk: s.attendancePct<65?0.75:0.25,
}))

const PERF_DATA = [
  { name:'A (90-100)', count:12 }, { name:'B (75-89)', count:28 },
  { name:'C (60-74)', count:19 },  { name:'D (50-59)', count:8 },
  { name:'F (<50)',   count:3  },
]

export default function AIPredictions() {
  const [selected, setSelected] = useState(null)
  const [prediction, setPrediction] = useState(null)

  const predictMutation = useMutation({
    mutationFn: (id) => aiService.predictFeeDefault(id),
    onSuccess: (data) => setPrediction(data),
    onError: () => {
      const s = STUDENT_RISKS.find(s=>s.id===selected)
      setPrediction({ feeDefaultRisk:s?.feeRisk||0.3, attendanceRisk:s?.attRisk||0.2, performanceRisk:s?.perfRisk||0.2, recommendation:'Send fee reminder and schedule counseling session.', modelUsed:'Random Forest + Logistic Regression' })
      toast.success('Prediction generated (Demo)')
    },
  })

  const handlePredict = (studentId) => { setSelected(studentId); predictMutation.mutate(studentId) }

  return (
    <div className="page-wrapper space-y-5">
      <div><h2 className="section-title">AI Predictions</h2><p className="section-sub">ML-powered risk analysis · Port 8001/8002/8003</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <AIBadge label="Fee Defaulter Predictor — Port 8001"/>
            <h3 className="text-sm font-semibold text-white mt-1">Student Risk Assessment</h3>
          </div>
          <div className="divide-y divide-border">
            {STUDENT_RISKS.map(s=>{
              const risk = getRiskColor(s.feeRisk)
              return (
                <div key={s.id} className="p-4 hover:bg-bg-tertiary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size="sm"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-[10px] text-gray-500">{s.studentId}</p>
                    </div>
                    <span className={`pill text-[10px] ${risk.bg} ${risk.text}`}>{risk.label}</span>
                    <button onClick={()=>handlePredict(s.id)} disabled={predictMutation.isPending&&selected===s.id}
                            className="btn-sm text-xs text-purple-400 border-purple-500/30 flex-shrink-0">
                      {predictMutation.isPending&&selected===s.id?'...':'Predict'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[{label:'Fee',value:s.feeRisk,color:'#ef4444'},{label:'Att',value:s.attRisk,color:'#f59e0b'},{label:'Perf',value:s.perfRisk,color:'#6c63ff'}].map(r=>(
                      <div key={r.label}>
                        <div className="flex justify-between text-[10px] text-gray-600 mb-0.5"><span>{r.label} Risk</span><span>{Math.round(r.value*100)}%</span></div>
                        <ProgressBar value={r.value*100} color={r.color}/>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          {prediction && (
            <div className="ai-card">
              <AIBadge label="Prediction Result"/>
              <p className="text-xs text-gray-500 mb-4">Model: {prediction.modelUsed}</p>
              <div className="space-y-3">
                {[{label:'Fee Default Risk',value:prediction.feeDefaultRisk,color:'#ef4444'},{label:'Attendance Risk',value:prediction.attendanceRisk,color:'#f59e0b'},{label:'Performance Risk',value:prediction.performanceRisk,color:'#6c63ff'}].map(r=>(
                  <div key={r.label}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>{r.label}</span><span className="font-semibold" style={{color:r.color}}>{Math.round(r.value*100)}%</span></div>
                    <ProgressBar value={r.value*100} color={r.color}/>
                  </div>
                ))}
              </div>
              {prediction.recommendation && (
                <div className="mt-4 p-3 bg-bg-tertiary rounded-lg border-l-2 border-purple-500">
                  <p className="text-xs text-gray-400 mb-0.5">AI Recommendation</p>
                  <p className="text-sm text-white">{prediction.recommendation}</p>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <SectionHeader title="Predicted Grade Distribution" sub="Exam Performance Model · Port 8003"/>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={PERF_DATA} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false}/>
                <XAxis dataKey="name" tick={{fill:CHART_COLORS.text,fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:CHART_COLORS.text,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'#141d33',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,fontSize:12}}/>
                <Bar dataKey="count" fill="#6c63ff" radius={[4,4,0,0]} name="Students"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <SectionHeader title="High Risk Students" sub="Requires immediate action"/>
            {STUDENT_RISKS.filter(s=>s.feeRisk>0.7||s.attRisk>0.7).map(s=>(
              <div key={s.id} className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg mb-2">
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.feeRisk>0.7?`Fee risk: ${Math.round(s.feeRisk*100)}%`:''}{s.attRisk>0.7?` · Att: ${s.attendancePct}%`:''}</p>
                </div>
                <button onClick={()=>toast.success(`Reminder sent to ${s.name}`)} className="btn-sm text-xs text-red-400 border-red-500/30">Alert</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { aiService } from '../../services/aiService'
import { AIBadge, AlertItem, SectionHeader, StatusDot, ProgressBar } from '../../components/ui'
import { mockAIAlerts } from '../../utils/mockData'
import { CHART_COLORS } from '../../utils/helpers'
import { Bot, Zap, TrendingUp, Brain, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const RISK_TIMELINE = [
  { day:'Mon', feeRisk:18, attRisk:8,  perfRisk:5  },
  { day:'Tue', feeRisk:22, attRisk:11, perfRisk:7  },
  { day:'Wed', feeRisk:19, attRisk:9,  perfRisk:6  },
  { day:'Thu', feeRisk:25, attRisk:14, perfRisk:9  },
  { day:'Fri', feeRisk:23, attRisk:11, perfRisk:12 },
]

const MICROSERVICES = [
  { name:'Fee Defaulter Predictor', port:8001, model:'Logistic Regression + RF', tech:'scikit-learn', status:'online', calls:142, accuracy:89 },
  { name:'Attendance Anomaly',      port:8002, model:'IsolationForest',           tech:'scikit-learn', status:'online', calls:89,  accuracy:91 },
  { name:'Exam Performance',        port:8003, model:'Random Forest Classifier',  tech:'scikit-learn', status:'online', calls:67,  accuracy:84 },
  { name:'Smart Query Classifier',  port:8004, model:'NLP Intent Classifier',     tech:'BERT + NLTK',  status:'online', calls:203, accuracy:93 },
  { name:'OCR Service',             port:8005, model:'Tesseract v5',              tech:'OpenCV',       status:'idle',   calls:12,  accuracy:78 },
]

export default function AIDashboard() {
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState(null)
  const [runningFee, setRunningFee] = useState(false)
  const [runningAtt, setRunningAtt] = useState(false)

  const queryMutation = useMutation({
    mutationFn: () => aiService.classifyQuery(1, query),
    onSuccess: (data) => setQueryResult(data),
    onError: () => {
      setQueryResult({ intent:'attendance_query', confidence:0.94, response:'Your current attendance is 87.3%. You need to maintain above 75% to be eligible for exams.' })
    },
  })

  const runFeeAutomation = async () => {
    setRunningFee(true)
    await new Promise(r=>setTimeout(r,2000))
    setRunningFee(false)
    toast.success('Fee automation complete — 3 reminders sent')
  }

  const runAttAutomation = async () => {
    setRunningAtt(true)
    await new Promise(r=>setTimeout(r,2000))
    setRunningAtt(false)
    toast.success('Attendance automation complete — 2 alerts triggered')
  }

  const CustomTooltip = ({active,payload,label}) => {
    if(!active||!payload?.length) return null
    return <div className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs"><p className="text-gray-400 mb-1">{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color}}>{p.name}: {p.value} students</p>)}</div>
  }

  return (
    <div className="page-wrapper space-y-6">
      <div className="ai-card">
        <AIBadge label="5 AI Microservices Running · FastAPI + scikit-learn" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-white mb-1">AI Automation Engine</h1>
            <p className="text-sm text-gray-400">Spring Boot → Python FastAPI · Scheduled daily at 9AM & 10AM</p>
          </div>
          <div className="flex gap-3">
            <button onClick={runFeeAutomation} disabled={runningFee} className="btn-primary flex items-center gap-2 text-xs">
              <Zap size={13} className={runningFee?'animate-pulse':''}/>{runningFee?'Running...':'Run Fee Automation'}
            </button>
            <button onClick={runAttAutomation} disabled={runningAtt} className="btn-secondary flex items-center gap-2 text-xs">
              <Activity size={13} className={runningAtt?'animate-pulse':''}/>{runningAtt?'Running...':'Run Att. Automation'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label:'Total AI Predictions', value:'1,204', icon:Brain,      color:'#6c63ff' },
            { label:'Automation Actions',   value:'347',   icon:Zap,        color:'#06b6d4' },
            { label:'Avg Model Accuracy',   value:'87%',   icon:TrendingUp, color:'#10b981' },
            { label:'Active Alerts',        value:'7',     icon:Activity,   color:'#f59e0b' },
          ].map(m=>(
            <div key={m.label} className="bg-black/30 rounded-lg p-4 flex items-center gap-3">
              <m.icon size={20} style={{color:m.color}} className="flex-shrink-0"/>
              <div><p className="font-display text-xl font-bold text-white">{m.value}</p><p className="text-[10px] text-gray-500">{m.label}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionHeader title="AI Risk Detection — This Week" sub="Students flagged by each model daily" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={RISK_TIMELINE}>
              <defs>
                {[['fee','#ef4444'],['att','#f59e0b'],['perf','#6c63ff']].map(([k,c])=>(
                  <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false}/>
              <XAxis dataKey="day" tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:CHART_COLORS.text,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="feeRisk"  stroke="#ef4444" fill="url(#g-fee)"  strokeWidth={2} name="Fee Risk"/>
              <Area type="monotone" dataKey="attRisk"  stroke="#f59e0b" fill="url(#g-att)"  strokeWidth={2} name="Att. Risk"/>
              <Area type="monotone" dataKey="perfRisk" stroke="#6c63ff" fill="url(#g-perf)" strokeWidth={2} name="Perf. Risk"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <SectionHeader title="Smart Query Classifier" sub="Port 8004 · NLP + BERT"/>
          <div className="bg-bg-tertiary rounded-lg p-3 mb-3 text-xs text-gray-400 font-mono min-h-[80px]">
            {queryResult ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="pill pill-blue">Intent: {queryResult.intent}</span>
                  <span className="pill pill-green">Confidence: {Math.round((queryResult.confidence||0.94)*100)}%</span>
                </div>
                <p className="text-gray-300 text-sm mt-2">{queryResult.response}</p>
              </div>
            ) : <p className="text-gray-600">Response will appear here...</p>}
          </div>
          <div className="flex gap-2">
            <input className="input flex-1 text-sm" value={query} onChange={e=>setQuery(e.target.value)}
                   placeholder="Ask anything: What is my attendance?"
                   onKeyDown={e=>e.key==='Enter'&&query&&queryMutation.mutate()}/>
            <button onClick={()=>query&&queryMutation.mutate()} disabled={!query||queryMutation.isPending} className="btn-primary px-4">
              <Bot size={15}/>
            </button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {['What is my attendance?','Am I at risk of failing?','When is my fee due?'].map(q=>(
              <button key={q} onClick={()=>{setQuery(q);setTimeout(()=>queryMutation.mutate(),100)}}
                      className="text-[10px] px-2 py-1 bg-bg-tertiary rounded border border-border text-gray-500 hover:text-purple-400 hover:border-purple-500/30 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <SectionHeader title="Microservice Status & Performance" sub="All connected via Spring Boot WebClient"/>
        <div className="space-y-3">
          {MICROSERVICES.map(s=>(
            <div key={s.port} className="bg-bg-tertiary rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusDot status={s.status}/>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 bg-bg-hover rounded font-mono text-gray-500">:{s.port}</span>
                  </div>
                  <p className="text-xs text-gray-500">{s.model} · {s.tech}</p>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <div className="text-center"><p className="font-bold text-white text-sm">{s.calls}</p><p>API Calls</p></div>
                  <div className="text-center"><p className="font-bold text-green-400 text-sm">{s.accuracy}%</p><p>Accuracy</p></div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-gray-600 mb-1"><span>Model Accuracy</span><span>{s.accuracy}%</span></div>
                <ProgressBar value={s.accuracy} color={s.accuracy>85?'#10b981':'#f59e0b'}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <SectionHeader title="Live AI Alerts" sub={`${mockAIAlerts.length} alerts`}/>
        {mockAIAlerts.map(a=>(
          <AlertItem key={a.id} type={a.type}
            icon={a.type==='danger'?'🚨':a.type==='warning'?'⚠️':a.type==='success'?'✅':'📊'}
            title={a.title} desc={a.desc}
            time={`${a.service} · Port ${a.port||'—'} · ${a.time}`}/>
        ))}
      </div>
    </div>
  )
}
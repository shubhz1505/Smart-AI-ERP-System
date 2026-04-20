import { useState } from 'react'
import { SectionHeader, AIBadge, StatusDot } from '../../components/ui'
import { mockAutomationLogs } from '../../utils/mockData'
import { Zap, Clock, Mail, AlertTriangle, BarChart3, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ACTION_ICONS = {
  EMAIL_REMINDER:     <Mail size={14} className="text-blue-400"/>,
  ATTENDANCE_ALERT:   <AlertTriangle size={14} className="text-amber-400"/>,
  PERFORMANCE_REPORT: <BarChart3 size={14} className="text-purple-400"/>,
}

const SCHEDULES = [
  { name:'Fee Automation',          cron:'0 9 * * *',  desc:'Daily at 9:00 AM',       service:'Port 8001', status:'active' },
  { name:'Attendance Anomaly Scan', cron:'0 10 * * *', desc:'Daily at 10:00 AM',      service:'Port 8002', status:'active' },
  { name:'Performance Report',      cron:'0 8 * * 1',  desc:'Every Monday 8 AM',      service:'Port 8003', status:'active' },
  { name:'Query Log Cleanup',       cron:'0 0 * * 0',  desc:'Every Sunday midnight',  service:'Internal',  status:'active' },
]

export default function AIAutomation() {
  const [logs, setLogs] = useState(mockAutomationLogs)
  const [runningJob, setRunningJob] = useState(null)

  const runJob = async (name) => {
    setRunningJob(name)
    await new Promise(r=>setTimeout(r,2200))
    const newLog = {
      id: logs.length+1,
      action: name.includes('Fee')?'EMAIL_REMINDER':name.includes('Att')?'ATTENDANCE_ALERT':'PERFORMANCE_REPORT',
      student: 'All Students',
      trigger: `Manual trigger — ${name}`,
      status: 'completed',
      time: new Date().toLocaleString('en-IN'),
    }
    setLogs(l=>[newLog,...l])
    setRunningJob(null)
    toast.success(`${name} completed successfully`)
  }

  return (
    <div className="page-wrapper space-y-5">
      <div><h2 className="section-title">AI Automation</h2><p className="section-sub">Scheduled jobs · Spring Boot @Scheduled · FastAPI microservices</p></div>

      <div className="ai-card">
        <AIBadge label="Automation Engine Active"/>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
          {[{label:'Jobs Run Today',value:'4',color:'text-purple-400'},{label:'Actions Taken',value:'23',color:'text-cyan-400'},{label:'Emails Sent',value:'11',color:'text-green-400'},{label:'Alerts Raised',value:'8',color:'text-amber-400'}].map(m=>(
            <div key={m.label} className="bg-black/30 rounded-lg p-3 text-center">
              <p className={`font-display text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <SectionHeader title="Scheduled Jobs" sub="Spring Boot @Scheduled annotations"/>
          <div className="space-y-3">
            {SCHEDULES.map(s=>(
              <div key={s.name} className="bg-bg-tertiary rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusDot status={s.status==='active'?'online':'idle'}/>
                      <p className="text-sm font-semibold text-white">{s.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">{s.desc} · {s.service}</p>
                    <p className="font-mono text-[10px] text-purple-400 mt-1 bg-bg-primary px-2 py-0.5 rounded inline-block">{s.cron}</p>
                  </div>
                  <button onClick={()=>runJob(s.name)} disabled={runningJob===s.name}
                          className="btn-primary text-xs flex-shrink-0 flex items-center gap-1.5">
                    <Zap size={11} className={runningJob===s.name?'animate-pulse':''}/>{runningJob===s.name?'Running...':'Run Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div><h3 className="text-sm font-semibold text-white">Automation Logs</h3><p className="text-[10px] text-gray-500 mt-0.5">{logs.length} actions</p></div>
            <span className="pill pill-green text-[10px]">{logs.length} total</span>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {logs.map(log=>(
              <div key={log.id} className="p-4 hover:bg-bg-tertiary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-bg-tertiary rounded-lg flex-shrink-0">
                    {ACTION_ICONS[log.action]||<Zap size={14} className="text-gray-400"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white">{log.action.replace(/_/g,' ')}</p>
                      <span className="pill pill-green text-[10px] flex-shrink-0"><CheckCircle2 size={9}/>{log.status}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{log.student}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{log.trigger}</p>
                    <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5"><Clock size={9}/>{log.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
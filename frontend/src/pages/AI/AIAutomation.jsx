import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../../services/aiService'
import { SectionHeader, Spinner, Empty } from '../../components/ui'
import { Zap, Clock, Mail, AlertTriangle, BarChart3, CheckCircle2, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const SCHEDULES = [
  { name: 'Fee Automation',          cron: '0 9 * * *',  desc: 'Daily at 9:00 AM',  job: 'fee',        icon: Mail },
  { name: 'Attendance Anomaly Scan', cron: '0 10 * * *', desc: 'Daily at 10:00 AM', job: 'attendance', icon: AlertTriangle },
]

const ACTION_COLOR = (type) => {
  if (!type) return { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: <Zap size={14} className="text-gray-400"/> }
  if (type.includes('URGENT'))     return { bg: 'bg-red-500/10',    text: 'text-red-400',    icon: <AlertTriangle size={14} className="text-red-400"/> }
  if (type.includes('WARNING'))    return { bg: 'bg-amber-500/10',  text: 'text-amber-400',  icon: <AlertTriangle size={14} className="text-amber-400"/> }
  if (type.includes('REMINDER'))   return { bg: 'bg-blue-500/10',   text: 'text-blue-400',   icon: <Mail size={14} className="text-blue-400"/> }
  if (type.includes('ATTENDANCE')) return { bg: 'bg-amber-500/10',  text: 'text-amber-400',  icon: <Activity size={14} className="text-amber-400"/> }
  if (type.includes('EXAM'))       return { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: <BarChart3 size={14} className="text-purple-400"/> }
  return { bg: 'bg-green-500/10', text: 'text-green-400', icon: <CheckCircle2 size={14} className="text-green-400"/> }
}

export default function AIAutomation() {
  const qc = useQueryClient()
  const [runningJob, setRunningJob] = useState(null)
  const [runningAll, setRunningAll] = useState(false)

  const { data: dashData, isLoading } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: aiService.getDashboard,
    retry: 1,
  })

  const { data: historyData } = useQuery({
    queryKey: ['ai-automation-history'],
    queryFn: aiService.getAutomationHistory,
    retry: 1,
  })

  const dash    = dashData?.data || {}
  const history = historyData?.data?.actionsByType
    ? Object.values(historyData.data.actionsByType).flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : dash.recentActions || []

  // Calculate real stats from history
  const totalActions     = history.length
  const remindersSent    = history.filter(h => (h.actionType || '').includes('REMINDER')).length
  const warningsRaised   = history.filter(h => (h.actionType || '').includes('WARNING') || (h.actionType || '').includes('URGENT')).length
  const last24h          = history.filter(h => {
    if (!h.createdAt) return false
    const diff = Date.now() - new Date(h.createdAt).getTime()
    return diff < 24 * 60 * 60 * 1000
  }).length

  const feeMut = useMutation({
    mutationFn: aiService.triggerFeeAutomation,
    onSuccess: (d) => {
      const result = d?.data || d
      toast.success(`Fee automation: ${result?.totalProcessed || 0} students processed`)
      qc.invalidateQueries({ queryKey: ['ai-dashboard'] })
      qc.invalidateQueries({ queryKey: ['ai-automation-history'] })
      setRunningJob(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Fee automation failed')
      setRunningJob(null)
    },
  })

  const attMut = useMutation({
    mutationFn: aiService.triggerAttendanceAutomation,
    onSuccess: (d) => {
      const result = d?.data || d
      toast.success(`Attendance automation: ${result?.totalStudents || 0} students processed`)
      qc.invalidateQueries({ queryKey: ['ai-dashboard'] })
      qc.invalidateQueries({ queryKey: ['ai-automation-history'] })
      setRunningJob(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Attendance automation failed')
      setRunningJob(null)
    },
  })

  const runJob = (s) => {
    setRunningJob(s.name)
    if (s.job === 'fee') feeMut.mutate()
    else if (s.job === 'attendance') attMut.mutate()
  }

  const runAll = async () => {
    setRunningAll(true)
    toast.loading('Running all automation...', { id: 'all' })
    try {
      await Promise.allSettled([
        aiService.triggerFeeAutomation(),
        aiService.triggerAttendanceAutomation(),
      ])
      toast.dismiss('all')
      toast.success('All automation completed!')
      qc.invalidateQueries({ queryKey: ['ai-dashboard'] })
      qc.invalidateQueries({ queryKey: ['ai-automation-history'] })
    } catch {
      toast.dismiss('all')
      toast.error('Some automation failed')
    } finally {
      setRunningAll(false)
    }
  }

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">AI Automation</h2>
          <p className="section-sub">Scheduled jobs · Spring Boot @Scheduled · saved to database</p>
        </div>
        <button onClick={runAll} disabled={runningAll}
          className="btn-primary flex items-center gap-2 text-sm">
          <Zap size={14} className={runningAll ? 'animate-pulse' : ''} />
          {runningAll ? 'Running...' : ' Run All'}
        </button>
      </div>

      {/* Stats — calculated from real history */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Actions',    value: totalActions,   color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Reminders Sent',   value: remindersSent,  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
          { label: 'Warnings Raised',  value: warningsRaised, color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
          { label: 'Last 24 Hours',    value: last24h,        color: 'text-green-400',  bg: 'bg-green-500/10'  },
        ].map(m => (
          <div key={m.label} className={`card text-center ${m.bg}`}>
            <p className={`font-display text-3xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Scheduled Jobs */}
        <div className="card">
          <SectionHeader title="Scheduled Jobs" sub="Spring Boot @Scheduled — runs automatically daily" />
          <div className="space-y-3 mt-2">
            {SCHEDULES.map(s => (
              <div key={s.name} className="bg-bg-tertiary rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg mt-0.5">
                      <s.icon size={14} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">{s.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                      <p className="font-mono text-[10px] text-purple-400 mt-1.5 bg-bg-primary px-2 py-0.5 rounded inline-block">
                        {s.cron}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => runJob(s)} disabled={runningJob === s.name}
                    className="btn-primary text-xs flex-shrink-0 flex items-center gap-1.5">
                    <Zap size={11} className={runningJob === s.name ? 'animate-pulse' : ''} />
                    {runningJob === s.name ? 'Running...' : 'Run Now'}
                  </button>
                </div>
              </div>
            ))}

            {/* Info box */}
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-blue-400 font-medium mb-1">ℹ️ How it works</p>
              <p className="text-xs text-gray-500">
                Spring Boot runs these jobs automatically every day. Click "Run Now" to trigger manually.
                All results are saved to MySQL database.
              </p>
            </div>
          </div>
        </div>

        {/* Automation Logs */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-black">Automation Logs</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{totalActions} actions saved in database</p>
            </div>
            <span className="pill pill-green text-[10px]">{totalActions} total</span>
          </div>

          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {history.length === 0 ? (
              <Empty icon="🤖" message="No automation actions yet — click Run Now" />
            ) : (
              history.map((log, i) => {
                const style = ACTION_COLOR(log.actionType)
                return (
                  <div key={log.id || i} className="p-4 hover:bg-bg-tertiary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 ${style.bg} rounded-lg flex-shrink-0`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold ${style.text}`}>
                            {(log.actionType || '').replace(/_/g, ' ')}
                          </p>
                          <span className="pill pill-green text-[10px] flex-shrink-0 flex items-center gap-1">
                            <CheckCircle2 size={9} />{log.status || 'completed'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {log.studentName || `Student ${log.studentId}`}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                          {log.triggerReason || log.messageSent || '—'}
                        </p>
                        <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
                          <Clock size={9} />
                          {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
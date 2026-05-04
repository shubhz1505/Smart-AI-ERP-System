import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { aiService } from '../../services/aiService'
import { useAuthStore } from '../../store/authStore'
import { AlertItem, SectionHeader, StatusDot, ProgressBar, Spinner, Empty } from '../../components/ui'
import { CHART_COLORS } from '../../utils/helpers'
import { Zap, TrendingUp, Brain, Activity, RefreshCw, AlertTriangle, Bot } from 'lucide-react'
import toast from 'react-hot-toast'

const MICROSERVICES_META = [
  { name: 'Fee Defaulter Predictor', port: 8001, model: 'Logistic Regression + RF', tech: 'scikit-learn', accuracy: 89 },
  { name: 'Attendance Anomaly',      port: 8002, model: 'IsolationForest',           tech: 'scikit-learn', accuracy: 91 },
  { name: 'Exam Performance',        port: 8003, model: 'Random Forest Classifier',  tech: 'scikit-learn', accuracy: 84 },
  { name: 'OCR Service',             port: 8005, model: 'Tesseract v5',              tech: 'OpenCV',       accuracy: 78 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
      <p className="mb-1 font-medium" style={{ color: '#374151' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value} students</p>
      ))}
    </div>
  )
}

export default function AIDashboard() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [serviceStatus, setServiceStatus] = useState(
    MICROSERVICES_META.map(s => ({ ...s, status: 'checking' }))
  )
  const [checkingHealth, setCheckingHealth] = useState(false)

  const { data: dashData, isLoading } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: aiService.getDashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const dash               = dashData?.data          || {}
  const predictionStats    = dash.predictionStats    || {}
  const automationStats    = dash.automationStats    || {}
  const chatStats          = dash.chatbotStats       || {}
  const recentActions      = dash.recentActions      || []
  const recentQueries      = dash.recentQueries      || []
  const highRiskStudents   = dash.highRiskStudents   || []
  const pendingEscalations = dash.pendingEscalations || []
  const riskTimeline       = dash.riskTimeline       || []

  // ── Check health directly via fetch to Python ports ──────────────────────
  const checkHealth = async () => {
    setCheckingHealth(true)
    const results = await Promise.allSettled(
      MICROSERVICES_META.map(async (meta) => {
        try {
          const res = await fetch(`http://localhost:${meta.port}/health`, {
            signal: AbortSignal.timeout(3000)
          })
          return { port: meta.port, status: res.ok ? 'online' : 'offline' }
        } catch {
          return { port: meta.port, status: 'offline' }
        }
      })
    )
    setServiceStatus(MICROSERVICES_META.map((meta, i) => ({
      ...meta,
      status: results[i].status === 'fulfilled'
        ? results[i].value.status
        : 'offline',
    })))
    setCheckingHealth(false)
  }

  useEffect(() => { checkHealth() }, [])

  // ── Run ALL automation at once ────────────────────────────────────────────
  const [runningAll, setRunningAll] = useState(false)

  const runAllAutomation = async () => {
    setRunningAll(true)
    toast.loading('Running all automation...', { id: 'all-auto' })
    try {
      const [feeResult, attResult] = await Promise.allSettled([
        aiService.triggerFeeAutomation(),
        aiService.triggerAttendanceAutomation(),
      ])

      const feeOk  = feeResult.status  === 'fulfilled'
      const attOk  = attResult.status  === 'fulfilled'
      const feeData = feeOk  ? feeResult.value?.data  || feeResult.value  : null
      const attData = attOk  ? attResult.value?.data  || attResult.value  : null

      toast.dismiss('all-auto')

      if (feeOk && attOk) {
        toast.success(
          `All automation complete! Fee: ${feeData?.totalProcessed || 0} students · Attendance: ${attData?.totalStudents || 0} students`
        )
      } else if (feeOk) {
        toast.success(`Fee automation done. Attendance failed.`)
      } else if (attOk) {
        toast.success(`Attendance automation done. Fee failed.`)
      } else {
        toast.error('Both automations failed. Check Spring Boot.')
      }

      queryClient.invalidateQueries({ queryKey: ['ai-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['ai-automation-history'] })
    } catch (err) {
      toast.dismiss('all-auto')
      toast.error('Automation failed')
    } finally {
      setRunningAll(false)
    }
  }

  const onlineCount = serviceStatus.filter(s => s.status === 'online').length

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-6">

      {/* Header Banner */}
      <div className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #1a73e8 0%, #0891b2 100%)',
          boxShadow: '0 4px 20px rgba(26,115,232,0.3)',
        }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              {onlineCount}/{MICROSERVICES_META.length} Microservices Online
            </p>
            <h1 className="font-display text-xl font-bold text-white mb-1">
              AI Automation Engine
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Spring Boot → Python FastAPI · Scheduled daily · MySQL storage
            </p>
          </div>

          {/* Single Run All Button */}
          <button
            type="button"
            onClick={runAllAutomation}
            disabled={runningAll}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: runningAll ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.4)',
            }}>
            <Zap size={16} className={runningAll ? 'animate-pulse' : ''} />
            {runningAll ? 'Running All Automation...' : ' Run All Automation'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Total Predictions',   value: predictionStats.totalPredictions ?? '—', icon: Brain },
            { label: 'Automation Actions',  value: automationStats.totalActions      ?? '—', icon: Zap },
            { label: 'Student Queries',     value: chatStats.totalQueries            ?? '—', icon: Bot },
            { label: 'Pending Escalations', value: dash.pendingEscalationCount       ?? '—', icon: AlertTriangle },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <m.icon size={18} className="text-white mb-2 opacity-80" />
              <p className="font-display text-2xl font-bold text-white">{m.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Chart */}
      <div className="card">
        <SectionHeader title="AI Risk Detection" sub="Students flagged by each model this week" />
        {riskTimeline.length === 0 ? (
          <Empty icon="📈" message="No risk data yet — run automation to populate" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={riskTimeline}>
                <defs>
                  {[['fee','#dc2626'],['att','#d97706'],['perf','#1a73e8']].map(([k,c]) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={c} stopOpacity={0}    />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="day" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="feeRisk"  stroke="#dc2626" fill="url(#g-fee)"  strokeWidth={2} name="Fee Risk" />
                <Area type="monotone" dataKey="attRisk"  stroke="#d97706" fill="url(#g-att)"  strokeWidth={2} name="Att. Risk" />
                <Area type="monotone" dataKey="perfRisk" stroke="#1a73e8" fill="url(#g-perf)" strokeWidth={2} name="Perf. Risk" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {[['Fee Risk','#dc2626'],['Att. Risk','#d97706'],['Perf. Risk','#1a73e8']].map(([l,c]) => (
                <span key={l} className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* High Risk Students */}
      {highRiskStudents.length > 0 && (
        <div className="card">
          <SectionHeader
            title="High Risk Students"
            sub={`${highRiskStudents.length} students flagged by AI`}
          />
          <div className="space-y-2">
            {highRiskStudents.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                    {s.studentName || `Student ${s.studentId}`}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    {s.rollNumber} · {s.serviceType?.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`pill text-[10px] ${
                    s.riskLevel === 'HIGH' ? 'pill-red' : 'pill-amber'
                  }`}>
                    {s.riskLevel || 'At Risk'}
                  </span>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    Score: {typeof s.riskScore === 'number'
                      ? s.riskScore.toFixed(2)
                      : s.riskScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Microservice Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Microservice Status" sub="Direct health check to Python ports" />
          <button type="button" onClick={checkHealth} disabled={checkingHealth}
            className="btn-sm flex items-center gap-1.5 text-xs">
            <RefreshCw size={12} className={checkingHealth ? 'animate-spin' : ''} />
            {checkingHealth ? 'Checking...' : 'Refresh'}
          </button>
        </div>
        <div className="space-y-3">
          {serviceStatus.map(s => (
            <div key={s.port} className="p-4 rounded-xl"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusDot status={s.status === 'checking' ? 'idle' : s.status} />
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{s.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: '#e2e8f0', color: '#64748b' }}>
                      :{s.port}
                    </span>
                    {s.status === 'checking' && (
                      <span className="text-[10px] animate-pulse" style={{ color: '#94a3b8' }}>
                        checking...
                      </span>
                    )}
                    {s.status === 'offline' && (
                      <span className="text-[10px] font-medium" style={{ color: '#dc2626' }}>
                        ● offline
                      </span>
                    )}
                    {s.status === 'online' && (
                      <span className="text-[10px] font-medium" style={{ color: '#16a34a' }}>
                        ● online
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#64748b' }}>{s.model} · {s.tech}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: '#16a34a' }}>{s.accuracy}%</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>Accuracy</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: '#94a3b8' }}>
                  <span>Model Accuracy</span><span>{s.accuracy}%</span>
                </div>
                <ProgressBar value={s.accuracy} color={s.accuracy > 85 ? '#16a34a' : '#d97706'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Automation Actions */}
      <div className="card">
        <SectionHeader
          title="Recent Automation Actions"
          sub={recentActions.length > 0
            ? `${recentActions.length} actions saved in database`
            : 'No actions yet'}
        />
        {recentActions.length > 0 ? (
          recentActions.map(a => (
            <AlertItem key={a.id}
              type={a.actionType?.includes('URGENT') ? 'danger'
                  : a.actionType?.includes('WARNING') ? 'warning' : 'info'}
              icon={a.actionType?.includes('URGENT') ? '🚨'
                  : a.actionType?.includes('WARNING') ? '' : ''}
              title={a.actionType?.replace(/_/g, ' ')}
              desc={a.triggerReason || a.messageSent || '—'}
              time={`Student ${a.studentId} · ${new Date(a.createdAt).toLocaleString()}`}
            />
          ))
        ) : (
          <div className="text-center py-8 rounded-xl"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-sm font-medium" style={{ color: '#374151' }}>
              No automation actions yet
            </p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              Click "Run All Automation" to generate data
            </p>
          </div>
        )}
      </div>

      {/* Recent Student Queries */}
      {recentQueries.length > 0 && (
        <div className="card">
          <SectionHeader
            title="Recent Student Queries"
            sub={`${recentQueries.length} queries saved in database`}
          />
          <div className="space-y-2">
            {recentQueries.map(q => (
              <div key={q.id} className="p-3 rounded-xl"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#0f172a' }}>{q.question}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{q.response}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>
                      Student {q.studentId} · {new Date(q.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="pill pill-blue text-[10px]">{q.intent}</span>
                    <span className={`pill text-[10px] ${q.autoAnswered ? 'pill-green' : 'pill-amber'}`}>
                      {q.autoAnswered ? 'Auto Answered' : 'Escalated'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Escalations */}
      {pendingEscalations.length > 0 && (
        <div className="card">
          <SectionHeader title="Pending Escalations" sub="Queries that need admin attention" />
          <div className="space-y-2">
            {pendingEscalations.map(q => (
              <div key={q.queryId} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{q.question}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    Student {q.studentId} · {q.intent}
                  </p>
                </div>
                <span className="pill pill-red text-[10px]">Needs Review</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
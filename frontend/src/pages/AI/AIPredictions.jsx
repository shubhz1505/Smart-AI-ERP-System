import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { aiService } from '../../services/aiService'
import { attendanceService } from '../../services/dataServices'
import { Avatar, SectionHeader, ProgressBar, AIBadge, Spinner, Empty } from '../../components/ui'
import { AlertTriangle, Brain, Users, AlertCircle, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AIPredictions() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [prediction, setPrediction] = useState(null)

  // ONE endpoint — students + real attendance + real fees
  const { data: summaryRaw, isLoading } = useQuery({
    queryKey: ['students-summary'],
    queryFn: () => attendanceService.getAllSummary(),
    retry: 1,
  })

  // High risk from DB
  const { data: highRiskRaw, isLoading: riskLoading } = useQuery({
  queryKey: ['ai-high-risk'],
  queryFn: () => aiService.getHighRiskStudents(),
  retry: 1,
  refetchInterval: 5000, // refresh every 5 seconds after predict
})

  // AI Dashboard stats
  const { data: aiDash } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: () => aiService.getAiDashboard(),
    retry: 1,
  })

  const summaryList = Array.isArray(summaryRaw) ? summaryRaw
    : Array.isArray(summaryRaw?.data) ? summaryRaw.data : []

  const highRisk = Array.isArray(highRiskRaw) ? highRiskRaw
  : Array.isArray(highRiskRaw?.data) ? highRiskRaw.data
  : Array.isArray(highRiskRaw?.data?.data) ? highRiskRaw.data.data : []

  const aiStats = aiDash?.predictionStats || {}

  // Map with REAL data from single endpoint
  const mappedStudents = summaryList.map(s => {
    const name = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown'
    const attPct    = Number(s.attendancePct ?? 0)
    const feeStatus = (s.feeStatus || 'pending').toLowerCase()
    const dueAmount = Number(s.dueAmount ?? 0)

    // Risk scores based on REAL data
    const feeRisk = feeStatus === 'overdue' ? 0.85
      : feeStatus === 'pending' && dueAmount > 0 ? 0.55
      : feeStatus === 'paid' ? 0.05 : 0.3

    const attRisk = attPct === 0 ? 0.50
      : attPct < 50 ? 0.95
      : attPct < 60 ? 0.80
      : attPct < 75 ? 0.55
      : attPct < 85 ? 0.25 : 0.10

    const perfRisk = attPct === 0 ? 0.50
      : attPct < 50 ? 0.90
      : attPct < 65 ? 0.70
      : attPct < 75 ? 0.45 : 0.20

    return {
      ...s,
      id: s.studentId,
      name,
      attendancePct: attPct,
      feeStatus,
      dueAmount,
      feeRisk,
      attRisk,
      perfRisk,
    }
  })

  // REAL grade distribution
  const PERF_DATA = [
    { name: 'A (90+)',   count: mappedStudents.filter(s => s.attendancePct >= 90).length },
    { name: 'B (75-89)', count: mappedStudents.filter(s => s.attendancePct >= 75 && s.attendancePct < 90).length },
    { name: 'C (60-74)', count: mappedStudents.filter(s => s.attendancePct >= 60 && s.attendancePct < 75).length },
    { name: 'D (50-59)', count: mappedStudents.filter(s => s.attendancePct >= 50 && s.attendancePct < 60).length },
    { name: 'F (<50)',   count: mappedStudents.filter(s => s.attendancePct < 50).length },
  ]

  const BAR_COLORS = ['#16a34a', '#1a73e8', '#d97706', '#f59e0b', '#dc2626']

  // Predict via Spring Boot → Python → DB
  const predictMutation = useMutation({
    mutationFn: (studentId) => aiService.examPrediction(studentId, {
      assignmentScore:  70,
      midtermScore:     65,
      quizAverage:      72,
      studyHoursPerDay: 2.5,
    }),
    onSuccess: (res) => {
  const data = res?.data || res || {}
  const predictedScore = Number(data.predictedScore ?? data.score ?? 0)
  setPrediction({
    predictedScore,
    predictedGrade:  data.predictedGrade  || getGrade(predictedScore),
    riskLevel:       data.riskLevel        || getRiskLevel(predictedScore),
    recommendation:  data.recommendation   || getRecommendation(predictedScore),
    modelUsed:       data.modelUsed        || 'Random Forest · Spring Boot → Python 8003',
    sendAlert:       data.sendAlert        ?? false,
    performanceRisk: predictedScore > 0
      ? Math.max(0, (100 - predictedScore) / 100) : 0,
  })
  // Force refetch both
  qc.invalidateQueries(['ai-high-risk'])
  qc.invalidateQueries(['ai-dashboard'])
  qc.refetchQueries(['ai-high-risk'])
  toast.success(`Prediction saved! Grade: ${data.predictedGrade || getGrade(predictedScore)}`)
},
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Prediction failed — check Python port 8003')
    },
  })

  if (isLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-5">

      {/* Header */}
      <div>
        <h2 className="section-title">AI Predictions</h2>
        <p className="section-sub">
          Real attendance & fee data from database · Spring Boot → Python → MySQL
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Students',
            value: mappedStudents.length,
            color: '#1a73e8', bg: '#dbeafe', icon: Users,
          },
          {
            label: 'High Risk',
            value: highRisk.length,
            color: '#dc2626', bg: '#fee2e2', icon: AlertTriangle,
          },
          {
            label: 'Low Attendance',
            value: mappedStudents.filter(s => s.attendancePct < 75 && s.attendancePct > 0).length,
            color: '#d97706', bg: '#fef3c7', icon: AlertCircle,
          },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>{s.label}</p>
              <p className="font-display text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Student Risk List */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <AIBadge label="Risk Assessment · Real DB Data" />
            <h3 className="text-sm font-semibold mt-1" style={{ color: '#0f172a' }}>
              Student Risk Assessment
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {mappedStudents.length} students · attendance + fee from database
            </p>
          </div>

          {mappedStudents.length === 0 ? (
            <Empty message="No students found" />
          ) : (
            <div className="max-h-[620px] overflow-y-auto">
              {mappedStudents.map(s => {
                const isRunning = predictMutation.isPending && selected === s.id
                const overallRisk = Math.max(s.feeRisk, s.attRisk, s.perfRisk)
                return (
                  <div
                    key={s.id}
                    className="p-4 transition-colors"
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: selected === s.id ? '#f8fafc' : 'white',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate"
                           style={{ color: '#0f172a' }}>{s.name}</p>
                        <p className="text-[10px]" style={{ color: '#94a3b8' }}>
                          {s.rollNumber} · Att: {s.attendancePct}% · Fee: {s.feeStatus}
                        </p>
                      </div>
                      <span className={`pill text-[10px] ${
                        overallRisk >= 0.7 ? 'pill-red' :
                        overallRisk >= 0.4 ? 'pill-amber' : 'pill-green'
                      }`}>
                        {overallRisk >= 0.7 ? 'High Risk' :
                         overallRisk >= 0.4 ? 'Medium' : 'Low Risk'}
                      </span>
                      <button
                        onClick={() => { setSelected(s.id); predictMutation.mutate(s.id) }}
                        disabled={isRunning}
                        className="btn-sm text-xs flex-shrink-0"
                        style={{ color: '#7c3aed', borderColor: '#c4b5fd' }}
                      >
                        {isRunning ? '...' : 'Predict'}
                      </button>
                    </div>

                    {/* REAL risk bars */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { label: 'Fee Risk',  value: s.feeRisk,  color: '#dc2626' },
                        { label: 'Att Risk',  value: s.attRisk,  color: '#d97706' },
                        { label: 'Perf Risk', value: s.perfRisk, color: '#1a73e8' },
                      ].map(r => (
                        <div key={r.label}>
                          <div className="flex justify-between text-[10px] mb-0.5"
                               style={{ color: '#64748b' }}>
                            <span>{r.label}</span>
                            <span style={{ color: r.color, fontWeight: 700 }}>
                              {Math.round(r.value * 100)}%
                            </span>
                          </div>
                          <ProgressBar value={r.value * 100} color={r.color} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Prediction Result */}
          {prediction ? (
            <div className="rounded-2xl p-5"
                 style={{
                   background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
                   border: '1px solid #bfdbfe',
                 }}>
              <AIBadge label="Prediction Result · Saved to Database" />
              <p className="text-xs mb-4" style={{ color: '#64748b' }}>
                {prediction.modelUsed}
              </p>

              {/* Score + Grade + Risk */}
              <div className="p-4 rounded-xl mb-4"
                   style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                       style={{ color: '#94a3b8' }}>Predicted Score</p>
                    <p className="font-display text-3xl font-bold"
                       style={{ color: '#1a73e8' }}>
                      {prediction.predictedScore > 0 ? prediction.predictedScore : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                       style={{ color: '#94a3b8' }}>Grade</p>
                    <p className="font-display text-3xl font-bold"
                       style={{ color: '#16a34a' }}>
                      {prediction.predictedGrade}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                       style={{ color: '#94a3b8' }}>Risk Level</p>
                    <span className={`pill ${
                      prediction.riskLevel === 'HIGH'   ? 'pill-red'   :
                      prediction.riskLevel === 'MEDIUM' ? 'pill-amber' : 'pill-green'
                    }`}>
                      {prediction.riskLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Risk bar */}
              <div className="mb-4 p-3 rounded-xl"
                   style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div className="flex justify-between text-xs mb-2"
                     style={{ color: '#374151' }}>
                  <span className="font-medium">Performance Risk</span>
                  <span className="font-bold" style={{ color: '#1a73e8' }}>
                    {Math.round((prediction.performanceRisk || 0) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  value={(prediction.performanceRisk || 0) * 100}
                  color="#1a73e8"
                />
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-xl"
                   style={{ background: '#ffffff', border: '1px solid #bfdbfe' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                   style={{ color: '#94a3b8' }}>AI Recommendation</p>
                <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                  {prediction.recommendation}
                </p>
              </div>

              {prediction.sendAlert && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl"
                     style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
                  <AlertTriangle size={14} style={{ color: '#dc2626' }} />
                  <p className="text-xs font-medium" style={{ color: '#dc2626' }}>
                    Alert flagged — student needs immediate attention
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-8 text-center"
                 style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
              <TrendingUp size={32} className="mx-auto mb-3"
                          style={{ color: '#cbd5e1' }} />
              <p className="font-semibold" style={{ color: '#374151' }}>
                No prediction yet
              </p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                Click "Predict" on any student to run the ML model
              </p>
            </div>
          )}

          {/* Grade Distribution Chart */}
          <div className="card">
            <SectionHeader
              title="Grade Distribution"
              sub={`Real attendance · ${mappedStudents.length} students`}
            />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PERF_DATA} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }}
                       axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(v) => [`${v} students`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {PERF_DATA.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {PERF_DATA.map((item, i) => (
                <span key={item.name}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: '#64748b' }}>
                  <span className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ background: BAR_COLORS[i] }} />
                  {item.name} ({item.count})
                </span>
              ))}
            </div>
          </div>

          {/* High Risk from DB */}
          <div className="card">
            <SectionHeader
              title="High Risk Students"
              sub={`${highRisk.length} flagged by AI · from database`}
            />
            {riskLoading ? <Spinner /> : highRisk.length === 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-xl"
                   style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span style={{ color: '#16a34a', fontSize: 18 }}>✓</span>
                <p className="text-sm font-medium" style={{ color: '#15803d' }}>
                  No high-risk students detected
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {highRisk.map((s, i) => (
                  <div
                    key={s.studentId || s.id || i}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: '#fff5f5', border: '1px solid #fecaca' }}
                  >
                    <AlertTriangle size={14}
                                   style={{ color: '#dc2626', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                        {s.studentName || `Student ${s.studentId}`}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                        {s.rollNumber && `${s.rollNumber} · `}
                        {s.serviceType?.replace(/_/g, ' ')} ·
                        Risk: {Math.round((s.riskScore || 0) * 100)}%
                      </p>
                    </div>
                    <span className="pill pill-red text-[10px]">High Risk</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function getGrade(score) {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

function getRiskLevel(score) {
  if (score < 40) return 'HIGH'
  if (score < 60) return 'MEDIUM'
  return 'LOW'
}

function getRecommendation(score) {
  if (score < 40) return 'Immediate intervention needed. Schedule extra classes.'
  if (score < 60) return 'Student needs improvement. Send study resources.'
  if (score < 75) return 'Student is average. Encourage more participation.'
  return 'Student is performing well. Keep monitoring.'
}
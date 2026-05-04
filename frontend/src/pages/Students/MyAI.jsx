import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiService } from '../../services/aiService'
import { AIBadge, SectionHeader, ProgressBar, Spinner } from '../../components/ui'
import { studentService } from '../../services/studentService'
import { Bot, Brain, TrendingUp, Shield, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function MyAI() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [query, setQuery]           = useState('')
  const [queryResult, setQueryResult] = useState(null)

  // Get student profile to get student ID
  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => studentService.getByUserId(user?.id),
    retry: 1,
    enabled: !!user?.id,
  })

  const student   = studentData?.data || studentData || {}
  const studentId = user?.studentId || student?.id || user?.id

  // Get AI profile for this student
  const { data: aiProfileData, isLoading: aiLoading } = useQuery({
    queryKey: ['student-ai-profile', studentId],
    queryFn: () => api.get(`/api/ai/profile/student/${studentId}`).then(r => r.data),
    retry: 1,
    enabled: !!studentId,
  })

  const aiProfile        = aiProfileData?.data        || {}
  const latestFeeRisk    = aiProfile.latestFeeRisk    || {}
  const latestAttRisk    = aiProfile.latestAttendanceRisk || {}
  const latestExamPred   = aiProfile.latestExamPrediction || {}
  const queryHistory     = aiProfile.queryHistory     || []
  const automationHistory = aiProfile.automationHistory || []
  const overallRisk      = aiProfile.overallAiRiskLevel || 'LOW'

  // Query mutation — goes through Spring Boot, saves to DB
  const queryMutation = useMutation({
    mutationFn: () => aiService.studentQuery({
      studentId: studentId,
      question:  query,
    }),
    onSuccess: (data) => {
      const result = data?.data || data
      setQueryResult({
        intent:     result.intent,
        confidence: result.confidence,
        response:   result.response,
        autoAnswered: result.autoAnswered,
      })
      queryClient.invalidateQueries(['student-ai-profile', studentId])
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Query service unavailable')
      setQueryResult({
        intent:     'GENERAL_QUERY',
        confidence: 0,
        response:   'Service unavailable. Please try again later.',
        autoAnswered: false,
      })
    },
  })

  const getRiskColor = (level) => {
    if (level === 'HIGH')   return { color: '#ef4444', pill: 'pill-red',   label: 'High Risk'   }
    if (level === 'MEDIUM') return { color: '#f59e0b', pill: 'pill-amber', label: 'Medium Risk' }
    return                         { color: '#10b981', pill: 'pill-green', label: 'Low Risk'    }
  }

  const overallRiskStyle = getRiskColor(overallRisk)

  if (studentLoading || aiLoading) return <Spinner />

  return (
    <div className="page-wrapper space-y-6">

      {/* Header */}
      <div className="ai-card">
        <AIBadge label="AI Assistant · Powered by 5 ML Models" />
        <div className="flex items-start justify-between gap-4 mt-2 flex-wrap">
          <div>
            <h1 className="font-display text-xl font-bold text-black mb-1">
              My AI Assistant 🤖
            </h1>
            <p className="text-sm text-gray-600">
              Ask anything about your attendance, fees, exams or courses
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Overall AI Risk Level</p>
            <span className={`pill ${overallRiskStyle.pill}`}>{overallRiskStyle.label}</span>
          </div>
        </div>

        {/* My Risk Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {[
            {
              label: 'Fee Default Risk',
              value: latestFeeRisk.riskScore
                ? `${Math.round(latestFeeRisk.riskScore * 100)}%`
                : 'No data',
              level: latestFeeRisk.riskLevel || 'N/A',
              icon:  Brain,
              color: '#ef4444',
            },
            {
              label: 'Attendance Risk',
              value: latestAttRisk.riskScore
                ? `${Math.round(latestAttRisk.riskScore * 100)}%`
                : 'No data',
              level: latestAttRisk.riskLevel || 'N/A',
              icon:  TrendingUp,
              color: '#f59e0b',
            },
            {
              label: 'Exam Performance',
              value: latestExamPred.riskScore
                ? `${Math.round(latestExamPred.riskScore * 100)}%`
                : 'No data',
              level: latestExamPred.riskLevel || 'N/A',
              icon:  Shield,
              color: '#6c63ff',
            },
          ].map(m => (
            <div key={m.label} className="bg-white/100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon size={16} style={{ color: m.color }} />
                <p className="text-xs text-black">{m.label}</p>
              </div>
              <p className="font-display text-2xl font-bold text-black">{m.value}</p>
              <p className="text-xs mt-1" style={{ color: m.color }}>{m.level}</p>
              {latestFeeRisk.riskScore && (
                <ProgressBar
                  value={Math.round(m.value) || 0}
                  color={m.color}
                  className="mt-2"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ask AI */}
      <div className="card">
        <SectionHeader title="Ask AI Assistant" sub="Port 8004 · NLP Query Classifier · Saved to database" />
        <div className="bg-bg-tertiary rounded-lg p-4 mb-4 min-h-[100px]">
          {queryMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <p className="text-purple-400 text-sm ml-2">Analyzing your query...</p>
            </div>
          ) : queryResult ? (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <span className="pill pill-blue text-[10px]">Intent: {queryResult.intent}</span>
                <span className="pill pill-green text-[10px]">
                  Confidence: {Math.round((queryResult.confidence || 0) * 100)}%
                </span>
                <span className={`pill text-[10px] ${queryResult.autoAnswered ? 'pill-green' : 'pill-amber'}`}>
                  {queryResult.autoAnswered ? '✅ Auto Answered' : '⏳ Sent to Admin'}
                </span>
              </div>
              <p className="text-black text-sm leading-relaxed">{queryResult.response}</p>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Hi {user?.name?.split(' ')[0] || 'there'}! Ask me anything about your studies. 👋</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="What is my attendance percentage?"
            onKeyDown={e => e.key === 'Enter' && query && queryMutation.mutate()}
          />
          <button
            onClick={() => query && queryMutation.mutate()}
            disabled={!query || queryMutation.isPending}
            className="btn-primary px-4"
          >
            <Bot size={16} />
          </button>
        </div>

        {/* Quick questions */}
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
          <div className="flex gap-2 flex-wrap">
            {[
              'What is my attendance?',
              'When is my fee due?',
              'Am I at risk of failing?',
              'How do I get a certificate?',
              'What is my exam schedule?',
            ].map(q => (
              <button key={q}
                onClick={() => { setQuery(q); setTimeout(() => queryMutation.mutate(), 100) }}
                className="text-[10px] px-3 py-1.5 bg-bg-tertiary rounded-full border border-border text-gray-400 hover:text-purple-400 hover:border-purple-500/30 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My Query History */}
      {queryHistory.length > 0 && (
        <div className="card">
          <SectionHeader
            title="My Query History"
            sub={`${queryHistory.length} queries · all saved in database`}
          />
          <div className="space-y-2 mt-2">
            {queryHistory.slice(0, 10).map((q, i) => (
              <div key={i} className="bg-bg-tertiary rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-black font-medium">{q.question}</p>
                    <p className="text-xs text-gray-400 mt-1">{q.response}</p>
                    <p className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(q.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="pill pill-blue text-[10px]">{q.intent}</span>
                    <span className={`pill text-[10px] ${q.autoAnswered ? 'pill-green' : 'pill-amber'}`}>
                      {q.autoAnswered ? 'Answered' : 'Escalated'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Actions taken on me */}
      {automationHistory.length > 0 && (
        <div className="card">
          <SectionHeader
            title="REMINDERS FROM ADMIN"
            sub="Automated actions by the system"
          />
          <div className="space-y-2 mt-2">
            {automationHistory.map((a, i) => (
              <div key={i} className="bg-bg-tertiary rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">
                      {a.actionType?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{a.messageSent}</p>
                    <p className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`pill text-[10px] ${
                    a.actionType?.includes('URGENT') ? 'pill-red' :
                    a.actionType?.includes('WARNING') ? 'pill-amber' : 'pill-green'
                  }`}>
                    {a.actionType?.includes('URGENT') ? '🚨 Urgent' :
                     a.actionType?.includes('WARNING') ? '⚠️ Warning' : '✅ Done'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data yet */}
      {queryHistory.length === 0 && automationHistory.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-black font-medium mb-1">No AI activity yet</p>
          <p className="text-gray-500 text-sm">Ask a question above to get started!</p>
        </div>
      )}
    </div>
  )
}
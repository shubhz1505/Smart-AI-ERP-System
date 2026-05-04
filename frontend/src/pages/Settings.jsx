import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { aiService } from '../services/aiService'
import { SectionHeader, StatusDot, Spinner } from '../components/ui'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuthStore()
  const [apiUrl] = useState(import.meta.env.VITE_API_URL || '')

  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ['ai-services-health'],
    queryFn: aiService.getServicesHealth,
    retry: 1,
    refetchInterval: 30_000,
  })

  const services = healthData?.data?.services || []

  return (
    <div className="page-wrapper space-y-5 max-w-3xl">
      <div>
        <h2 className="section-title">Settings</h2>
        <p className="section-sub">System configuration & API connections</p>
      </div>

      <div className="card space-y-4">
        <SectionHeader title="Profile" sub="Your account information"/>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input opacity-60 cursor-not-allowed" value={user?.name || ''} readOnly/></div>
          <div><label className="label">Email</label><input className="input opacity-60 cursor-not-allowed" value={user?.email || ''} readOnly/></div>
          <div><label className="label">Role</label><input className="input opacity-60 cursor-not-allowed" value={user?.role || 'student'} readOnly/></div>
        </div>
      </div>

      <div className="card space-y-4">
        <SectionHeader title="API Configuration" sub="Backend connection (read-only)"/>
        <div>
          <label className="label">Spring Boot Backend URL</label>
          <input className="input opacity-60 cursor-not-allowed" value={apiUrl} readOnly/>
          <p className="text-xs text-gray-600 mt-1">Configure VITE_API_URL in .env</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <SectionHeader title="Python Microservices" sub="Live status from Spring Boot health probe"/>
          <button onClick={() => { refetch(); toast.success('Refreshing...') }} className="btn-sm text-xs">Refresh</button>
        </div>
        {isLoading ? <Spinner /> : services.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No service status available</p>
        ) : (
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.port || s.name} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-gray-500 font-mono">port {s.port}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot status={s.status}/>
                  <span className={`text-xs font-medium ${s.status === 'online' ? 'text-green-400' : 'text-gray-500'}`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
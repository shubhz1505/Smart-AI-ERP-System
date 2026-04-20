import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { SectionHeader, StatusDot } from '../components/ui'
import toast from 'react-hot-toast'

const MICROSERVICES = [
  { name:'Fee Defaulter Predictor', port:8001, status:'online' },
  { name:'Attendance Anomaly',      port:8002, status:'online' },
  { name:'Exam Performance',        port:8003, status:'online' },
  { name:'Smart Query Classifier',  port:8004, status:'online' },
  { name:'OCR Service',             port:8005, status:'idle'   },
]

export default function Settings() {
  const { user } = useAuthStore()
  const [apiUrl, setApiUrl] = useState('http://localhost:5000')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await new Promise(r=>setTimeout(r,800))
    setSaving(false)
    toast.success('Settings saved')
  }

  return (
    <div className="page-wrapper space-y-5 max-w-3xl">
      <div><h2 className="section-title">Settings</h2><p className="section-sub">System configuration & API connections</p></div>

      <div className="card space-y-4">
        <SectionHeader title="Profile" sub="Your account information"/>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" defaultValue={user?.name||'Admin User'}/></div>
          <div><label className="label">Email</label><input className="input" defaultValue={user?.email||'admin@educore.com'}/></div>
          <div><label className="label">Role</label><input className="input opacity-60 cursor-not-allowed" value={user?.role||'admin'} readOnly/></div>
        </div>
      </div>

      <div className="card space-y-4">
        <SectionHeader title="API Configuration" sub="Backend connection settings"/>
        <div>
          <label className="label">Spring Boot Backend URL</label>
          <input className="input" value={apiUrl} onChange={e=>setApiUrl(e.target.value)}/>
          <p className="text-xs text-gray-600 mt-1">Set VITE_API_URL in your .env file</p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 font-mono text-xs text-green-400 space-y-1">
          <p>VITE_API_URL=http://localhost:5000</p>
          <p>VITE_AI_BASE_URL=http://localhost:8001</p>
        </div>
      </div>

      <div className="card">
        <SectionHeader title="Python Microservices" sub="FastAPI services status"/>
        <div className="space-y-2">
          {MICROSERVICES.map(s=>(
            <div key={s.port} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
              <div><p className="text-sm font-medium text-white">{s.name}</p><p className="text-xs text-gray-500 font-mono">localhost:{s.port}</p></div>
              <div className="flex items-center gap-2">
                <StatusDot status={s.status}/>
                <span className={`text-xs font-medium ${s.status==='online'?'text-green-400':'text-gray-500'}`}>{s.status}</span>
                <button onClick={()=>toast.success(`${s.name} is ${s.status}`)} className="btn-sm text-xs ml-2">Ping</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary px-6">{saving?'Saving...':'Save Settings'}</button>
    </div>
  )
}
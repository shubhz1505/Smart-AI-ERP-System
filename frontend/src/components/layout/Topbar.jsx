import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { Bell, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const PAGE_TITLES = {
  '/dashboard':      'Dashboard',
  '/students':       'Students',
  '/courses':        'Courses',
  '/attendance':     'Attendance',
  '/fees':           'Fee Management',
  '/ai':             'AI Dashboard',
  '/ai/predictions': 'AI Predictions',
  '/ai/automation':  'AI Automation',
  '/reports':        'Reports',
  '/settings':       'Settings',
}

export default function Topbar() {
  const { sidebarOpen } = useUIStore()
  const location = useLocation()
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    await new Promise(r => setTimeout(r, 1200))
    setSyncing(false)
    toast.success('Data synced with backend')
  }

  return (
    <header className="fixed top-0 right-0 h-16 bg-bg-secondary border-b border-border z-40 flex items-center px-6 gap-4 transition-all duration-300"
            style={{ left: sidebarOpen ? '240px' : '64px' }}>
      <div className="flex-1">
        <h1 className="font-display text-base font-semibold text-white">
          {PAGE_TITLES[location.pathname] || 'EduCore ERP'}
        </h1>
      </div>
      <div className="hidden md:flex items-center gap-2 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-xs text-gray-500 min-w-[200px]">
        <Search size={14} /> Search...
      </div>
      <button onClick={handleSync} className="btn-secondary flex items-center gap-2 text-xs">
        <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
        Sync
      </button>
      <button className="relative text-gray-400 hover:text-white transition-colors p-1.5"
              onClick={() => toast('3 new alerts from AI Engine', { icon: '🔔' })}>
        <Bell size={18} />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-secondary" />
      </button>
    </header>
  )
}
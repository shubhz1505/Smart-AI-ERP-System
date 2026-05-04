import { X } from 'lucide-react'
import { getInitials } from '../../utils/helpers'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal w-full ${widths[size]}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, delta, deltaUp, color = 'blue', suffix = '' }) {
  const colorMap = { blue: 'stat-card-blue', green: 'stat-card-green', amber: 'stat-card-amber', red: 'stat-card-red' }
  return (
    <div className={`stat-card ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="font-display text-2xl font-bold text-gray-900">{value}{suffix}</p>
          {delta && (
            <p className={`text-xs mt-1.5 flex items-center gap-1 ${deltaUp ? 'text-green-400' : 'text-red-400'}`}>
              {deltaUp ? '▲' : '▼'} {delta}
            </p>
          )}
        </div>
        {Icon && <div className="p-2.5 bg-bg-tertiary rounded-lg"><Icon size={20} className="text-gray-400" /></div>}
      </div>
    </div>
  )
}

export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  const colors = ['from-purple-500 to-blue-500', 'from-pink-500 to-rose-500', 'from-cyan-500 to-blue-500', 'from-green-500 to-emerald-500', 'from-amber-500 to-orange-500']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {getInitials(name)}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-border-strong border-t-brand rounded-full animate-spin" />
    </div>
  )
}

export function Empty({ icon = '📭', message = 'No data found', sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-400 font-medium">{message}</p>
      {sub && <p className="text-gray-600 text-sm mt-1">{sub}</p>}
    </div>
  )
}

export function ProgressBar({ value, color = '#6c63ff', className = '' }) {
  return (
    <div className={`progress-bar ${className}`}>
      <div className="h-full rounded-full transition-all duration-700"
           style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  )
}

export function StatusDot({ status }) {
  const map = { online: 'bg-green-500 shadow-[0_0_6px_#10b981]', offline: 'bg-red-500', checking: 'bg-amber-500 animate-pulse', idle: 'bg-gray-500' }
  return <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${map[status] || map.idle}`} />
}

export function AIBadge({ label = 'AI Engine Active' }) {
  return (
    <div className="ai-badge">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse-slow" />
      {label}
    </div>
  )
}

export function SectionHeader({ title, sub, children }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

export function AlertItem({ type = 'info', icon, title, desc, time }) {
  const borderMap = { warning: 'border-amber-500', danger: 'border-red-500', info: 'border-cyan-500', success: 'border-green-500' }
  return (
    <div className={`alert-item ${borderMap[type]}`}>
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
        <p className="text-[10px] text-gray-600 mt-1">{time}</p>
      </div>
    </div>
  )
}
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { feeService } from '../../services/dataServices'
import { aiService } from '../../services/aiService'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CreditCard, Bot, TrendingUp, Zap, BarChart3,
  Settings, ChevronLeft, GraduationCap, LogOut, User
} from 'lucide-react'

const STUDENT_NAV = [
  { section: 'My Dashboard' },
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'My Academics' },
  { to: '/my-courses',     icon: BookOpen,        label: 'My Courses' },
  { to: '/my-attendance',  icon: ClipboardList,   label: 'My Attendance' },
  { section: 'Finance' },
  { to: '/my-fees',        icon: CreditCard,      label: 'My Fees' },
  { section: 'AI Assistant' },
  { to: '/my-ai',          icon: Bot,             label: 'AI Assistant', badge: 'New', badgeBlue: true },
  { section: 'Account' },
  { to: '/my-profile',     icon: User,            label: 'My Profile' },
  { to: '/student/settings', icon: Settings, label: 'Settings' }
]

function useDynamicNav(isAdmin) {
  const { data: overdueData } = useQuery({
    queryKey: ['fees-overdue'],
    queryFn: feeService.getOverdue,
    retry: 1,
    enabled: isAdmin,
  })
  const { data: aiData } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: aiService.getDashboard,
    retry: 1,
    enabled: isAdmin,
  })
  const overdueCount = (overdueData?.data || []).length
  const escalations  = aiData?.data?.pendingEscalationCount ?? 0

  if (!isAdmin) return STUDENT_NAV

  return [
    { section: 'Overview' },
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { section: 'Academics' },
    { to: '/students',       icon: Users,           label: 'Students' },
    { to: '/courses',        icon: BookOpen,        label: 'Courses' },
    { to: '/attendance',     icon: ClipboardList,   label: 'Attendance' },
    { section: 'Finance' },
    { to: '/fees',           icon: CreditCard,      label: 'Fee Management',
      badge: overdueCount > 0 ? String(overdueCount) : null, badgeRed: true },
    { section: 'AI Engine' },
    { to: '/ai',             icon: Bot,             label: 'AI Dashboard',
      badge: escalations > 0 ? String(escalations) : 'Live', badgeGreen: true },
    { to: '/ai/predictions', icon: TrendingUp,      label: 'Predictions' },
    { to: '/ai/automation',  icon: Zap,             label: 'Automation' },
    { section: 'System' },
    { to: '/reports',        icon: BarChart3,       label: 'Reports' },
    { to: '/student/settings', icon: Settings, label: 'Settings' },
  ]
}

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const NAV = useDynamicNav(isAdmin)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = (user?.name || user?.email || 'U')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside
      className="fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300"
      style={{
        width: sidebarOpen ? '240px' : '64px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-5 min-h-[64px]"
        style={{ borderBottom: '1px solid #e2e8f0' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #1a73e8, #0891b2)' }}
        >
          <GraduationCap size={16} />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <div className="font-display font-bold text-sm" style={{ color: '#0f172a' }}>
              EduCore
            </div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              ERP System
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1 rounded-md transition-colors"
          style={{ color: '#94a3b8' }}
        >
          <ChevronLeft
            size={14}
            className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      {sidebarOpen && (
        <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <span className={`pill text-[10px] ${isAdmin ? 'pill-blue' : 'pill-green'}`}>
            {isAdmin ? 'Administrator' : 'Student'}
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((item, i) => {
          if (item.section) {
            return sidebarOpen ? (
              <div
                key={i}
                className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#94a3b8' }}
              >
                {item.section}
              </div>
            ) : (
              <div
                key={i}
                className="my-2 mx-3"
                style={{ borderTop: '1px solid #f1f5f9' }}
              />
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/ai'}
              className={({ isActive }) => `nav-item mx-2 ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white"
                      style={{
                        background: item.badgeRed
                          ? '#dc2626'
                          : item.badgeGreen
                          ? '#16a34a'
                          : '#7c3aed',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
            !sidebarOpen ? 'justify-center' : ''
          }`}
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
        >
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #1a73e8, #0891b2)' }}
          >
            {initials}
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 overflow-hidden">
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: '#0f172a' }}
                >
                  {user?.name || user?.email || 'User'}
                </div>
                <div
                  className="text-[10px] capitalize"
                  style={{ color: '#94a3b8' }}
                >
                  {user?.role || 'student'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded transition-colors"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
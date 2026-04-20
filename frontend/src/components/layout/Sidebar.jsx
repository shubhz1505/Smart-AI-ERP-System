import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CreditCard, Bot, TrendingUp, Zap, BarChart3,
  Settings, ChevronLeft, GraduationCap, LogOut, User
} from 'lucide-react'

const ADMIN_NAV = [
  { section: 'Overview' },
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Academics' },
  { to: '/students',       icon: Users,           label: 'Students' },
  { to: '/courses',        icon: BookOpen,        label: 'Courses' },
  { to: '/attendance',     icon: ClipboardList,   label: 'Attendance' },
  { section: 'Finance' },
  { to: '/fees',           icon: CreditCard,      label: 'Fee Management', badge: '3', badgeColor: 'bg-red-500' },
  { section: 'AI Engine' },
  { to: '/ai',             icon: Bot,             label: 'AI Dashboard',   badge: 'Live', badgeColor: 'bg-green-500' },
  { to: '/ai/predictions', icon: TrendingUp,      label: 'Predictions' },
  { to: '/ai/automation',  icon: Zap,             label: 'Automation' },
  { section: 'System' },
  { to: '/reports',        icon: BarChart3,       label: 'Reports' },
  { to: '/settings',       icon: Settings,        label: 'Settings' },
]

const STUDENT_NAV = [
  { section: 'My Dashboard' },
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'My Academics' },
  { to: '/my-courses',     icon: BookOpen,        label: 'My Courses' },
  { to: '/my-attendance',  icon: ClipboardList,   label: 'My Attendance' },
  { section: 'My Finance' },
  { to: '/my-fees',        icon: CreditCard,      label: 'My Fees' },
  { section: 'Account' },
  { to: '/my-profile',     icon: User,            label: 'My Profile' },
  { to: '/settings',       icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Derive admin status from role — no function needed
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const NAV = isAdmin ? ADMIN_NAV : STUDENT_NAV

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = (user?.name || 'User')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-bg-secondary border-r border-border z-50 flex flex-col transition-all duration-300"
      style={{ width: sidebarOpen ? '240px' : '64px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border min-h-[64px]">
        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white"
             style={{ background: 'linear-gradient(135deg, #6c63ff, #06b6d4)' }}>
          <GraduationCap size={16} />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <div className="font-display font-bold text-white text-sm">EduCore</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">ERP System</div>
          </div>
        )}
        <button onClick={toggleSidebar}
                className="ml-auto text-gray-500 hover:text-white transition-colors p-1 rounded">
          <ChevronLeft size={14} className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Role Badge */}
      {sidebarOpen && (
        <div className="px-4 py-2">
          <span className={`pill text-[10px] ${isAdmin ? 'pill-blue' : 'pill-green'}`}>
            {isAdmin ? '👑 Administrator' : '🎓 Student'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((item, i) => {
          if (item.section) {
            return sidebarOpen
              ? <div key={i} className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">{item.section}</div>
              : <div key={i} className="my-1 mx-3 border-t border-border" />
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
                    <span className={`${item.badgeColor} text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-3 p-2.5 rounded-lg bg-bg-tertiary cursor-pointer hover:bg-bg-hover transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
               style={{ background: 'linear-gradient(135deg,#6c63ff,#ec4899)' }}>
            {initials}
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{user?.name || user?.email || 'User'}</div>
                <div className="text-[10px] text-gray-500 capitalize">{user?.role || 'student'}</div>
              </div>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
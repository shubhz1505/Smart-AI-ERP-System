import { Outlet } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export default function MainLayout() {
  const { sidebarOpen } = useUIStore()
  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300"
           style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}>
        <Topbar />
        <main className="flex-1 p-6 mt-16 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
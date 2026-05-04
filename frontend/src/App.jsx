import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Students from './pages/Students/Students'
import StudentProfile from './pages/Students/StudentProfile'
import Courses from './pages/Courses/Courses'
import Attendance from './pages/Attendance/Attendance'
import Fees from './pages/Fees/Fees'
import AIDashboard from './pages/AI/AIDashboard'
import AIPredictions from './pages/AI/AIPredictions'
import AIAutomation from './pages/AI/AIAutomation'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import StudentDashboard from './pages/Students/StudentDashboard'
import MyAI from './pages/Students/MyAI'
import MyAttendance from './pages/Students/MyAttendance'
import MyCourses from './pages/Students/MyCourses'
import MyFees from './pages/Students/MyFees'
import MyProfile from './pages/Students/MyProfile'
import StudentSettings from './pages/Students/StudentSettings'

/* ================= ROUTE GUARDS ================= */

function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role?.toLowerCase() !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function StudentRoute({ children }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role?.toLowerCase() !== 'student') return <Navigate to="/settings" replace />
  return children
}

function GuestRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

function DashboardRouter() {
  const { user } = useAuthStore()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  return isAdmin ? <Dashboard /> : <StudentDashboard />
}

/* ================= APP ================= */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/settings" element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          } />

          <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
          <Route path="/students/:id" element={<AdminRoute><StudentProfile /></AdminRoute>} />
          <Route path="/courses" element={<AdminRoute><Courses /></AdminRoute>} />
          <Route path="/attendance" element={<AdminRoute><Attendance /></AdminRoute>} />
          <Route path="/fees" element={<AdminRoute><Fees /></AdminRoute>} />
          <Route path="/ai" element={<AdminRoute><AIDashboard /></AdminRoute>} />
          <Route path="/ai/predictions" element={<AdminRoute><AIPredictions /></AdminRoute>} />
          <Route path="/ai/automation" element={<AdminRoute><AIAutomation /></AdminRoute>} />
          <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />

          {/* ================= STUDENT ROUTES ================= */}
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/my-attendance" element={<MyAttendance />} />
          <Route path="/my-fees" element={<MyFees />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-ai" element={<MyAI />} />

          <Route path="/student/settings" element={
            <StudentRoute>
              <StudentSettings />
            </StudentRoute>
          } />

        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
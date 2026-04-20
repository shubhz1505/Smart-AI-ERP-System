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

function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        </Route>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/students"           element={<Students />} />
          <Route path="/students/:id"       element={<StudentProfile />} />
          <Route path="/courses"            element={<Courses />} />
          <Route path="/attendance"         element={<Attendance />} />
          <Route path="/fees"               element={<Fees />} />
          <Route path="/ai"                 element={<AIDashboard />} />
          <Route path="/ai/predictions"     element={<AIPredictions />} />
          <Route path="/ai/automation"      element={<AIAutomation />} />
          <Route path="/reports"            element={<Reports />} />
          <Route path="/settings"           element={<Settings />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
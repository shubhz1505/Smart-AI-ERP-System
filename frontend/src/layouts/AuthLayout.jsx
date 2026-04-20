import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4"
         style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(108,99,255,0.12) 0%, #0a0e1a 60%)' }}>
      <Outlet />
    </div>
  )
}
import { Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext'
import Layout from './layouts/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import Checkins from './pages/Checkins'
import Approvals from './pages/Approvals'
import Escalations from './pages/Escalations'
import Analytics from './pages/Analytics'
import Notifications from './pages/Notifications'
import Users from './pages/Users'

import Landing from './pages/Landing'

function ProtectedRoute({ children, roles }) {
  const { user, authReady } = useAuth()
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
        <div className="glass-card p-6 w-full max-w-sm">
          <div className="skeleton h-4 w-32 mb-4" />
          <div className="skeleton h-9 w-full" />
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="goals" element={<Goals />} />
        <Route path="checkins" element={<Checkins />} />
        <Route path="approvals" element={<ProtectedRoute roles={['manager', 'admin']}><Approvals /></ProtectedRoute>} />
        <Route path="escalations" element={<Escalations />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

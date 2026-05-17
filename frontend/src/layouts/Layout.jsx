import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api, { getApiOrigin } from '../services/api'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Target, CalendarCheck, CheckSquare, AlertTriangle,
  BarChart3, Bell, Users, LogOut, Menu, X, ChevronLeft, UserRound
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    
    // Setup Socket.IO connection
    const socket = io(getApiOrigin(), {
      auth: { token: localStorage.getItem('token') }
    })
    
    socket.on('connect', () => {
      socket.emit('join', { room: `user_${user?.id}` })
    })

    socket.on('new_notification', (data) => {
      toast(data.message, { 
        icon: <Bell className="w-4 h-4 text-cyan-600" />, 
        style: { 
          borderRadius: '8px', 
          background: '#fff', 
          color: '#0f172a',
          border: '1px solid #dce3eb',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          fontWeight: 500,
          fontSize: '13px',
        } 
      })
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      clearInterval(interval)
      socket.disconnect()
    }
  }, [user?.id])

  const fetchUnread = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch {}
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['employee','manager','admin'] },
    { to: '/goals', icon: Target, label: 'Goals', roles: ['employee','manager','admin'] },
    { to: '/checkins', icon: CalendarCheck, label: 'Check-ins', roles: ['employee','manager','admin'] },
    { to: '/approvals', icon: CheckSquare, label: 'Approvals', roles: ['manager','admin'] },
    { to: '/escalations', icon: AlertTriangle, label: 'Escalations', roles: ['employee','manager','admin'] },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['employee','manager','admin'] },
    { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['employee','manager','admin'] },
    { to: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  ]

  const filtered = navItems.filter(item => item.roles.includes(user?.role))
  const adminNav = filtered.filter(item => item.to === '/users')
  const mainNav = filtered.filter(item => item.to !== '/users')

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''} ${!sidebarOpen ? 'lg:!w-0 lg:!border-0 lg:!overflow-hidden' : ''}`}>
        {/* Logo */}
        <div className="p-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={38} showWordmark showTagline />
            </div>
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User badge */}
        <div className="mx-4 mt-3 mb-4 p-3 rounded-xl bg-[#F5F7FA] border border-[#DCE3EB]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
              <UserRound className="w-[18px] h-[18px] text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate leading-none">{user?.name}</p>
              <p className="text-[10px] font-semibold text-slate-400 capitalize mt-1">{user?.role} - {user?.department || 'General'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-1 overflow-y-auto px-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 mb-2 mt-2">Menu</p>
          {mainNav.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse-glow">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}

          {adminNav.length > 0 && (
            <>
              <div className="h-px bg-slate-100 my-3 mx-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-5 mb-2">Admin</p>
              {adminNav.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="w-[17px] h-[17px]" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-3 mt-auto border-t border-[#DCE3EB]">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 text-slate-500 hover:text-rose-600 transition-colors text-sm py-2.5 px-3 rounded-xl hover:bg-rose-50 font-medium group">
            <LogOut className="w-4 h-4 group-hover:text-rose-500 transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className="app-main flex-1 flex flex-col min-w-0 transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ '--sidebar-offset': sidebarOpen ? '260px' : '0px' }}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-20 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/80 text-slate-500 transition-colors border border-transparent hover:border-slate-200/80"
                aria-label="Open navigation">
                <Menu className="w-5 h-5" />
              </button>
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 rounded-xl hover:bg-white/80 text-slate-400 transition-colors border border-transparent hover:border-slate-200/80"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <NavLink to="/notifications" className="relative p-2.5 rounded-xl hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200/80">
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse-glow">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 px-6 lg:px-8 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col min-h-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

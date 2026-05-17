import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Target, AlertTriangle, Share2, Sparkles } from 'lucide-react'

const TYPE_ICONS = {
  goal_approved: { icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  goal_rejected: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  goal_submitted: { icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  goal_shared: { icon: Share2, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  escalation: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  checkin_reviewed: { icon: Check, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  reminder: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
}

const itemVariants = {
  hidden: { opacity: 0, x: -8, filter: 'blur(3px)' },
  show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications?per_page=50')
      setNotifications(res.data.notifications)
      setUnread(res.data.unread)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const markRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/read`)
      fetchNotifications()
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all')
      toast.success('All marked as read')
      fetchNotifications()
    } catch {}
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8"><div className="skeleton h-8 w-44 mb-3" /><div className="skeleton h-4 w-40" /></div>
      <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#DCE3EB]">
        <motion.div variants={itemVariants} className="page-header-accent">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Inbox</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">{unread} unread message{unread !== 1 ? 's' : ''}</p>
        </motion.div>
        {unread > 0 && (
          <motion.button variants={itemVariants} onClick={markAllRead} 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary text-xs py-2.5 px-4">
            <CheckCheck className="w-3.5 h-3.5 text-indigo-500" /> Mark All Read
          </motion.button>
        )}
      </div>

      {notifications.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <Bell className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No notifications</h3>
          <p className="text-slate-400 text-sm font-medium">You're all caught up!</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-2.5">
          <AnimatePresence>
            {notifications.map(notif => {
              const typeConfig = TYPE_ICONS[notif.type] || TYPE_ICONS.reminder
              const Icon = typeConfig.icon
              return (
                <motion.div layout key={notif.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => !notif.read && markRead(notif.id)}
                  className={`glass-card p-4 flex items-start gap-3.5 transition-all duration-300 ${
                    !notif.read 
                      ? 'border-indigo-200/80 bg-indigo-50/20 cursor-pointer hover:bg-indigo-50/40 hover:border-indigo-300/80 shadow-sm' 
                      : 'opacity-50 bg-[#F8FAFC] hover:opacity-80 cursor-default'
                  }`}>
                  <div className={`p-2 rounded-xl ${typeConfig.bg} border ${typeConfig.border} shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${typeConfig.color}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'} tracking-tight`}>{notif.title}</h4>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse shrink-0" />}
                    </div>
                    <p className={`text-xs ${!notif.read ? 'text-slate-600' : 'text-slate-400'} font-medium`}>{notif.message}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import { AlertTriangle, Shield, CheckCircle, Clock, RefreshCw, Zap, UserRound, Target, Timer, CalendarDays, Lightbulb } from 'lucide-react'

const SEVERITY_CONFIG = {
  low: { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', glowBg: '' },
  medium: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', glowBg: '' },
  high: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300', glowBg: 'shadow-[0_0_20px_rgba(249,115,22,0.06)]' },
  critical: { icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300', glowBg: 'shadow-[0_0_25px_rgba(244,63,94,0.08)]' },
}

const TYPE_LABELS = {
  missed_checkin: 'Missed Check-in',
  approval_delay: 'Approval Delay',
  goal_stagnation: 'Goal Stagnation',
  repeated_rejection: 'Repeated Rejection',
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } }
}

export default function Escalations() {
  const { user } = useAuth()
  const [escalations, setEscalations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/api/escalations')
      setEscalations(res.data.escalations)
      if (user.role !== 'employee') {
        const s = await api.get('/api/escalations/stats')
        setStats(s.data)
      }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleResolve = async (id) => {
    try {
      await api.post(`/api/escalations/${id}/resolve`)
      toast.success('Escalation resolved')
      fetchData()
    } catch { toast.error('Failed to resolve') }
  }

  const handleAcknowledge = async (id) => {
    try {
      await api.post(`/api/escalations/${id}/acknowledge`)
      toast.success('Escalation acknowledged')
      fetchData()
    } catch { toast.error('Failed') }
  }

  const handleTriggerCheck = async () => {
    try {
      const res = await api.post('/api/escalations/trigger')
      toast.success(res.data.message)
      fetchData()
    } catch { toast.error('Failed') }
  }

  const filtered = filter === 'all' ? escalations : escalations.filter(e => e.status === filter)

  if (loading) return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="mb-8"><div className="skeleton h-8 w-44 mb-3" /><div className="skeleton h-4 w-72" /></div>
      <div className="grid grid-cols-4 gap-4 mb-8">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <motion.div variants={itemVariants} className="page-header-accent">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Alerts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Escalations</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Automated alerts for missed deadlines and rule violations</p>
        </motion.div>
        {user.role !== 'employee' && (
          <motion.button variants={itemVariants} onClick={handleTriggerCheck} 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary">
            <RefreshCw className="w-3.5 h-3.5" /> Run Check
          </motion.button>
        )}
      </div>

      {stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Open', value: stats.open, color: 'text-amber-500' },
            { label: 'Acknowledged', value: stats.acknowledged, color: 'text-indigo-500' },
            { label: 'Resolved', value: stats.resolved, color: 'text-emerald-500' },
            { label: 'Total', value: stats.total, color: 'text-slate-900' },
          ].map((s, i) => (
            <div key={i} className="stat-card text-center py-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
              <p className={`text-3xl font-extrabold ${s.color} tracking-tight`}>{s.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
        {['all', 'open', 'acknowledged', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 bg-white border border-[#DCE3EB] hover:bg-slate-50 hover:text-slate-700'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center border-emerald-100 bg-emerald-50/30">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No escalations</h3>
          <p className="text-slate-400 text-sm font-medium">Everything is running smoothly on schedule.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-3">
          <AnimatePresence>
            {filtered.map(esc => {
              const sev = SEVERITY_CONFIG[esc.severity] || SEVERITY_CONFIG.medium
              const Icon = sev.icon
              return (
                <motion.div 
                  layout
                  key={esc.id} 
                  variants={itemVariants}
                  initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card p-5 severity-${esc.severity} ${sev.glowBg}`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0 w-full">
                      <div className={`p-2.5 rounded-xl ${sev.bg} shrink-0 border ${sev.border}`}>
                        <Icon className={`w-4.5 h-4.5 ${sev.color}`} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${sev.color} bg-white px-2 py-0.5 rounded-md border ${sev.border}`}>
                            {esc.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{TYPE_LABELS[esc.type] || esc.type}</span>
                          <span className={`badge badge-${esc.status === 'open' ? 'pending' : esc.status === 'resolved' ? 'approved' : 'submitted'} text-[9px]`}>{esc.status}</span>
                        </div>
                        <p className="text-sm text-slate-900 font-medium mb-2.5 leading-relaxed">{esc.message}</p>
                        <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-slate-400">
                          <span className="flex items-center gap-1.5"><UserRound className="w-3 h-3" /> {esc.user_name}</span>
                          {esc.goal_title && <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> <span className="truncate max-w-[180px]">{esc.goal_title}</span></span>}
                          {esc.delay_days && <span className="flex items-center gap-1.5 text-rose-500"><Timer className="w-3 h-3" /> {esc.delay_days}d overdue</span>}
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> {new Date(esc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        {esc.suggested_action && (
                          <div className="mt-3 bg-indigo-50/80 border border-indigo-100 p-2.5 rounded-xl">
                            <p className="text-xs text-indigo-700 font-medium flex gap-2"><Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{esc.suggested_action}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                    {esc.status === 'open' && (
                      <div className="flex gap-2 shrink-0 md:ml-4 w-full md:w-auto justify-end mt-3 md:mt-0 pt-3 md:pt-0 border-t border-[#E2E8F0] md:border-0">
                        <button onClick={() => handleAcknowledge(esc.id)} className="btn-secondary flex-1 md:flex-none text-xs">Acknowledge</button>
                        {user.role !== 'employee' && (
                          <button onClick={() => handleResolve(esc.id)} className="btn-success flex-1 md:flex-none text-xs">Resolve</button>
                        )}
                      </div>
                    )}
                    {esc.status === 'acknowledged' && user.role !== 'employee' && (
                      <div className="flex gap-2 shrink-0 md:ml-4 w-full md:w-auto justify-end mt-3 md:mt-0 pt-3 md:pt-0 border-t border-[#E2E8F0] md:border-0">
                        <button onClick={() => handleResolve(esc.id)} className="btn-success flex-1 md:flex-none text-xs">Resolve</button>
                      </div>
                    )}
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

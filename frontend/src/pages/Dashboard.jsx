import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, ArrowRight, Sparkles, BarChart3, CheckSquare } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  show: { 
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 24 } 
  }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/analytics/overview')
      setAnalytics(res.data)
      setError('')
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError('We could not load your dashboard metrics. Check that the backend is running and refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <div className="skeleton h-8 w-64 mb-3" />
        <div className="skeleton h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton h-3 w-20 mb-4" />
            <div className="skeleton h-8 w-16 mb-2" />
            <div className="skeleton h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'

  if (error) return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="glass-card p-8 text-center">
        <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <h1 className="text-xl font-extrabold text-slate-900 mb-2">Dashboard unavailable</h1>
        <p className="text-sm font-medium text-slate-500 mb-5">{error}</p>
        <button onClick={fetchAnalytics} className="btn-primary">Retry</button>
      </div>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full">
      {/* Header with accent */}
      <motion.div variants={itemVariants} className="mb-8 page-header-accent">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-500 tracking-wide uppercase">{greeting}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {user?.name}
        </h1>
        <p className="text-slate-400 mt-1.5 text-sm font-medium">
          {user?.role === 'employee' ? 'Track your goals and performance milestones.' :
           user?.role === 'manager' ? 'Monitor your team\'s progress and pending approvals.' : 'System overview and administrative management.'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      {user?.role === 'employee' && analytics && <EmployeeDashboard data={analytics} />}
      {user?.role === 'manager' && analytics && <ManagerDashboard data={analytics} />}
      {user?.role === 'admin' && analytics && <AdminDashboard data={analytics} />}
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, subtext, color = 'indigo', gradient }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', glow: 'shadow-indigo-100/50' },
    cyan: { bg: 'bg-sky-50', text: 'text-sky-600', glow: 'shadow-sky-100/50' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', glow: 'shadow-emerald-100/50' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', glow: 'shadow-amber-100/50' },
    red: { bg: 'bg-rose-50', text: 'text-rose-600', glow: 'shadow-rose-100/50' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', glow: 'shadow-purple-100/50' },
  }
  const c = colorMap[color]
  
  return (
    <motion.div variants={itemVariants} className="stat-card group cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</p>
          {subtext && <p className="text-xs font-medium text-slate-400 mt-2.5">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${c.bg} ${c.glow} group-hover:scale-110 group-hover:shadow-lg transition-all duration-400`}>
          <Icon className={`w-5 h-5 ${c.text}`} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  )
}

function ProgressRing({ value, size = 80, stroke = 6, color = '#6366f1' }) {
  const radius = (size - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const progress = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold text-slate-900 tracking-tight">{value}%</span>
      </div>
    </div>
  )
}

function EmployeeDashboard({ data }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Target} label="Total Goals" value={data.total_goals} subtext={`${data.approved_goals} approved`} color="indigo" />
        <StatCard icon={TrendingUp} label="Avg Progress" value={`${data.avg_progress}%`} color="cyan" />
        <StatCard icon={CheckCircle} label="Completed" value={data.completed_goals} color="green" />
        <StatCard icon={Clock} label="Quarter Done" value={`${data.quarter_completion}%`} subtext={`${data.submitted_checkins} check-ins`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">
        {/* Goal Status + Progress Ring */}
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Goal Status Overview</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Quarter</span>
          </div>
          <div className="space-y-3.5">
            {Object.entries(data.goals_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className={`badge badge-${status}`}>{status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 progress-bar h-1.5">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.total_goals ? (count / data.total_goals) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Progress ring card */}
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-2 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-6">Overall Progress</h3>
          <ProgressRing value={data.avg_progress} size={120} stroke={8} />
          <p className="text-xs font-semibold text-slate-400 mt-4 tracking-wide uppercase">Average across all goals</p>
        </motion.div>
      </div>

      {/* Achievement Status */}
      <motion.div variants={itemVariants} className="glass-card p-6 mb-8">
        <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Achievement Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data.goals_by_achievement).map(([status, count]) => {
            const colors = {
              'exceeded': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
              'met': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
              'partially_met': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
              'not_met': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
            }
            const c = colors[status] || colors.met
            return (
              <div key={status} className={`p-4 rounded-xl ${c.bg} border ${c.border} transition-all hover:shadow-sm`}>
                <p className="text-2xl font-extrabold tracking-tight mb-1">{count}</p>
                <p className={`text-xs font-semibold ${c.text} capitalize`}>{status.replace('_', ' ')}</p>
              </div>
            )
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Link to="/goals" className="btn-primary">
          <Target className="w-4 h-4" /> Manage Goals <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link to="/checkins" className="btn-secondary">
          <CheckCircle className="w-4 h-4" /> Submit Check-in
        </Link>
      </motion.div>
    </>
  )
}

function ManagerDashboard({ data }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Team Size" value={data.team_size} color="indigo" />
        <StatCard icon={Clock} label="Pending Approvals" value={data.pending_approvals} color="amber" />
        <StatCard icon={TrendingUp} label="Team Progress" value={`${data.avg_progress}%`} color="cyan" />
        <StatCard icon={AlertTriangle} label="Open Escalations" value={data.open_escalations} color="red" />
      </div>

      {/* Team performance + Progress ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-2 overflow-x-auto">
          <h3 className="text-base font-bold text-slate-900 mb-5 tracking-tight">Team Performance</h3>
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Goals</th><th>Avg Progress</th><th>Pending</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.team_performance?.map(member => (
                <tr key={member.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                        {member.name?.[0]}
                      </div>
                      <span className="font-semibold text-slate-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-600 font-medium">{member.goals}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-20 progress-bar h-1.5">
                        <motion.div 
                          className="progress-fill" 
                          initial={{ width: 0 }}
                          animate={{ width: `${member.avg_progress}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{member.avg_progress}%</span>
                    </div>
                  </td>
                  <td>{member.pending > 0 ? <span className="badge badge-pending">{member.pending}</span> : <span className="text-slate-300 font-medium">0</span>}</td>
                  <td>
                    {member.avg_progress >= 75 ? <span className="badge badge-approved">On Track</span> :
                     member.avg_progress >= 50 ? <span className="badge badge-submitted">In Progress</span> :
                     <span className="badge badge-rejected">At Risk</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-6">Team Progress</h3>
          <ProgressRing value={data.avg_progress} size={130} stroke={9} color="#8b5cf6" />
          <p className="text-xs font-semibold text-slate-400 mt-4 tracking-wide uppercase">Average team completion</p>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Link to="/approvals" className="btn-primary">
          <CheckSquare className="w-4 h-4" /> Review Approvals <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link to="/escalations" className="btn-danger">
          <AlertTriangle className="w-4 h-4" /> View Escalations
        </Link>
      </motion.div>
    </>
  )
}

function AdminDashboard({ data }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Total Users" value={data.total_users} subtext={`${data.total_employees} employees, ${data.total_managers} managers`} color="indigo" />
        <StatCard icon={Target} label="Total Goals" value={data.total_goals} color="cyan" />
        <StatCard icon={TrendingUp} label="Org Progress" value={`${data.avg_progress}%`} color="green" />
        <StatCard icon={AlertTriangle} label="Open Escalations" value={data.open_escalations} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-8">
        {/* Goals by Status */}
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-3">
          <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Goals by Status</h3>
          <div className="space-y-3.5">
            {Object.entries(data.goals_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge badge-${status}`}>{status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 progress-bar h-1.5">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.total_goals ? (count / data.total_goals) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Org progress ring */}
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-2 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-6">Org Health</h3>
          <ProgressRing value={data.avg_progress} size={130} stroke={9} color="#10b981" />
          <p className="text-xs font-semibold text-slate-400 mt-4 tracking-wide uppercase">Organization average</p>
        </motion.div>
      </div>

      {/* Department overview */}
      <motion.div variants={itemVariants} className="glass-card p-6 mb-8">
        <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Department Overview</h3>
        <div className="space-y-4">
          {data.departments?.map(dept => (
            <div key={dept.department} className="group">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-slate-700 font-semibold">{dept.department}</span>
                <span className="text-slate-400 text-xs">{dept.goal_count} goals - <span className="font-bold text-slate-900">{dept.avg_progress}%</span></span>
              </div>
              <div className="progress-bar h-2">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${dept.avg_progress}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    background: dept.avg_progress >= 75 
                      ? 'linear-gradient(90deg, #10b981, #06b6d4)' 
                      : dept.avg_progress >= 50 
                      ? 'linear-gradient(90deg, #6366f1, #818cf8)' 
                      : 'linear-gradient(90deg, #f59e0b, #f97316)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Link to="/users" className="btn-primary"><Users className="w-4 h-4" /> Manage Users</Link>
        <Link to="/analytics" className="btn-secondary"><TrendingUp className="w-4 h-4" /> Full Analytics</Link>
      </motion.div>
    </>
  )
}

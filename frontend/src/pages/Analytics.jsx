import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { BarChart3, TrendingUp, Target, Users, CheckCircle, Sparkles, Download, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']
const STATUS_META = {
  draft: { label: 'Draft', color: '#64748b', bg: 'bg-slate-100' },
  pending: { label: 'Pending Review', color: '#f59e0b', bg: 'bg-amber-100' },
  approved: { label: 'Approved', color: '#10b981', bg: 'bg-emerald-100' },
  rejected: { label: 'Needs Changes', color: '#f43f5e', bg: 'bg-rose-100' },
  submitted: { label: 'Submitted', color: '#2563eb', bg: 'bg-blue-100' },
}
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } }
}

const customTooltipStyle = {
  background: '#ffffff',
  border: '1px solid #DCE3EB',
  borderRadius: '14px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
  color: '#0f172a',
  fontWeight: '500',
  fontSize: '12px',
  padding: '10px 14px',
}

export default function Analytics() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [governance, setGovernance] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/analytics/overview').then(res => setData(res.data)),
      api.get('/api/governance/completion-dashboard').then(res => setGovernance(res.data)),
      user?.role === 'admin'
        ? api.get('/api/governance/audit-logs').then(res => setAuditLogs(res.data.logs || []))
        : Promise.resolve(),
    ]).then(results => {
      if (results.some(result => result.status === 'rejected')) {
        toast.error('Some analytics data could not be loaded')
      }
    }).finally(() => setLoading(false))
  }, [user?.role])

  const handleExport = async () => {
    try {
      const res = await api.get('/api/governance/achievement-report.csv', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'achievement-report.csv'
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to export achievement report')
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8"><div className="skeleton h-8 w-56 mb-3" /><div className="skeleton h-4 w-80" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="glass-card p-6"><div className="skeleton h-5 w-24 mb-4" /><div className="skeleton h-[200px] w-full rounded-xl" /></div>
        ))}
      </div>
    </div>
  )
  if (!data) return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="glass-card p-8 text-center">
        <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <h1 className="text-xl font-extrabold text-slate-900 mb-2">Analytics unavailable</h1>
        <p className="text-sm font-medium text-slate-500">The overview endpoint did not respond. Try again after the backend is running.</p>
      </div>
    </div>
  )

  const statusRows = Object.entries(data.goals_by_status || {}).map(([name, value]) => ({
    name,
    value,
    label: STATUS_META[name]?.label || name.replace('_', ' '),
    color: STATUS_META[name]?.color || '#2563eb',
  }))
  const statusChartData = statusRows.filter(row => row.value > 0)
  const statusTotal = statusRows.reduce((sum, row) => sum + row.value, 0)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full">
      <motion.div variants={itemVariants} className="mb-8 page-header-accent flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Insights</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Goal progress, check-in completion, and governance reporting</p>
        </div>
        <button onClick={handleExport} className="btn-primary text-xs py-2.5">
          <Download className="w-3.5 h-3.5" /> Export Achievement CSV
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {governance && (
          <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-indigo-500" /> Completion Dashboard
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Quarterly check-in completion and manager review coverage</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-full md:min-w-[520px]">
                <MiniMetric label="Expected" value={governance.expected_checkins} />
                <MiniMetric label="Submitted" value={governance.submitted_checkins} />
                <MiniMetric label="Employee Done" value={`${governance.employee_completion_rate}%`} />
                <MiniMetric label="Reviewed" value={`${governance.manager_review_rate}%`} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Employee</th><th>Department</th><th>Manager</th><th>Goals</th><th>Check-ins</th><th>Completion</th></tr>
                </thead>
                <tbody>
                  {(governance.employees || []).slice(0, 6).map(row => (
                    <tr key={row.id}>
                      <td className="font-semibold">{row.name}</td>
                      <td>{row.department || '-'}</td>
                      <td>{row.manager_name || '-'}</td>
                      <td>{row.approved_goals}</td>
                      <td>{row.submitted_checkins}/{row.expected_checkins}</td>
                      <td><span className="badge badge-submitted">{row.completion_rate}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Goal Status Distribution - Donut */}
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Goal Status</h3>
          <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-5">Distribution Overview</p>
          <StatusDonut rows={statusRows} chartData={statusChartData} total={statusTotal} />
        </motion.div>

        {/* Progress Overview */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Key Metrics</h3>
          <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-6">Performance Indicators</p>
          <div className="space-y-5">
            <MetricBar label="Average Progress" value={data.avg_progress || 0} color="#6366f1" />
            {data.quarter_completion !== undefined && (
              <MetricBar label="Quarter Completion" value={data.quarter_completion} color="#0ea5e9" />
            )}
            {data.total_goals > 0 && (
              <MetricBar label="Approval Rate"
                value={Math.round(((data.approved_goals || 0) / data.total_goals) * 100)}
                color="#10b981" />
            )}
            {data.open_escalations !== undefined && (
              <div className="flex items-center justify-between p-4 bg-[#F5F7FA] rounded-xl border border-[#DCE3EB] mt-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Escalations</span>
                <span className={`text-xl font-extrabold ${data.open_escalations > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {data.open_escalations}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Summary
          </h3>
          <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-5">Quick Overview</p>
          <div className="space-y-0.5">
            <SummaryRow icon={Target} label="Total Goals" value={data.total_goals} />
            {data.approved_goals !== undefined && <SummaryRow icon={CheckCircle} label="Approved" value={data.approved_goals} />}
            {data.completed_goals !== undefined && <SummaryRow icon={CheckCircle} label="Completed" value={data.completed_goals} color="text-emerald-600" />}
            {data.team_size !== undefined && <SummaryRow icon={Users} label="Team Members" value={data.team_size} />}
            {data.pending_approvals !== undefined && <SummaryRow icon={CheckCircle} label="Pending Approvals" value={data.pending_approvals} color="text-amber-600" />}
            {data.total_users !== undefined && <SummaryRow icon={Users} label="Active Users" value={data.total_users} />}
            {data.total_checkins !== undefined && <SummaryRow icon={Target} label="Total Check-ins" value={data.total_checkins} />}
          </div>
        </motion.div>

        {/* Team Performance (Manager) */}
        {data.team_performance && (
          <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Team Performance</h3>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-5">Individual Breakdown</p>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.team_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} />
                  <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: '#F8FAFC' }} />
                  <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontWeight: 600 }} />
                  <Bar dataKey="avg_progress" fill="url(#barGrad1)" name="Avg Progress %" radius={[6,6,0,0]} barSize={36} />
                  <Bar dataKey="goals" fill="url(#barGrad2)" name="Total Goals" radius={[6,6,0,0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Department Overview (Admin) */}
        {data.departments && (
          <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Department Performance</h3>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-5">Cross-organizational View</p>
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departments} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="deptGrad1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="deptGrad2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} width={120} />
                  <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: '#F8FAFC' }} />
                  <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontWeight: 600 }} />
                  <Bar dataKey="avg_progress" fill="url(#deptGrad1)" name="Avg Progress %" radius={[0,6,6,0]} barSize={22} />
                  <Bar dataKey="goal_count" fill="url(#deptGrad2)" name="Goal Count" radius={[0,6,6,0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {user?.role === 'admin' && (
          <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Audit Trail
            </h3>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-5">Locked-goal and manager/admin interventions</p>
            {auditLogs.length === 0 ? (
              <div className="rounded-xl border border-[#DCE3EB] bg-[#F5F7FA] p-5 text-sm font-medium text-slate-500">
                No governed changes have been logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>When</th><th>Actor</th><th>Employee</th><th>Goal</th><th>Action</th><th>Changed Fields</th></tr>
                  </thead>
                  <tbody>
                    {auditLogs.slice(0, 8).map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td className="font-semibold">{log.actor_name}</td>
                        <td>{log.employee_name}</td>
                        <td>{log.goal_title}</td>
                        <td><span className="badge badge-approved">{log.action.replace('_', ' ')}</span></td>
                        <td>{Object.keys(log.changes || {}).join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Achievement Status (Employee) */}
        {data.goals_by_achievement && (
          <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Achievement Breakdown</h3>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase mb-5">Goal Completion Analysis</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, i) => (
                      <linearGradient key={`achGrad${i}`} id={`achGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie data={Object.entries(data.goals_by_achievement).map(([name, value]) => ({
                    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), value
                  }))} cx="50%" cy="50%" innerRadius={75} outerRadius={115} paddingAngle={4} dataKey="value" stroke="none"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: '#d1cdc7', strokeWidth: 1 }}>
                    {Object.keys(data.goals_by_achievement).map((_, i) => <Cell key={i} fill={`url(#achGrad${i})`} />)}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function StatusDonut({ rows, chartData, total }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-center min-h-[260px]">
      <div className="relative h-[240px]">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={102}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={4}
                  isAnimationActive
                >
                  {chartData.map(row => <Cell key={row.name} fill={row.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(value, name, item) => [value, item.payload.label]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-extrabold text-slate-900 leading-none">{total}</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Goals</span>
            </div>
          </>
        ) : (
          <div className="h-full rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-400">
            No goals yet
          </div>
        )}
      </div>

      <div className="space-y-3">
        {rows.map(row => {
          const percent = total ? Math.round((row.value / total) * 100) : 0
          return (
            <div key={row.name} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                  <span className="text-sm font-bold text-slate-700 truncate">{row.label}</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900">{row.value}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: row.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MetricBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="font-semibold text-slate-500">{label}</span>
        <span className="font-extrabold text-slate-900">{value}%</span>
      </div>
      <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-[#DCE3EB] bg-[#F5F7FA] p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value, icon: Icon, color = 'text-slate-900' }) {
  return (
    <div className="flex items-center justify-between p-2.5 hover:bg-[#F8FAFC] rounded-xl transition-colors group">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-white rounded-lg border border-[#DCE3EB] shadow-sm group-hover:border-indigo-200 transition-colors">
          <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </div>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
      <span className={`text-base font-extrabold ${color}`}>{value}</span>
    </div>
  )
}

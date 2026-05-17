import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import { CalendarCheck, Send, MessageSquare, ChevronDown, ChevronUp, Clock, AlertTriangle, Sparkles } from 'lucide-react'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const PROGRESS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'text-slate-500' },
  { value: 'on_track', label: 'On Track', color: 'text-emerald-600' },
  { value: 'completed', label: 'Completed', color: 'text-sky-600' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } }
}

export default function Checkins() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedGoal, setExpandedGoal] = useState(null)
  const [teamCheckins, setTeamCheckins] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/api/goals')
      setGoals(res.data.goals.filter(g => g.status === 'approved'))
      if (user.role === 'manager' || user.role === 'admin') {
        const tc = await api.get('/api/checkins/team')
        setTeamCheckins(tc.data.checkins)
      }
    } catch (err) { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8"><div className="skeleton h-8 w-52 mb-3" /><div className="skeleton h-4 w-80" /></div>
      <div className="glass-card p-4 mb-8"><div className="grid grid-cols-4 gap-3">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>
      <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto w-full">
      <motion.div variants={itemVariants} className="mb-8 page-header-accent">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Progress Tracking</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quarterly Check-ins</h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">Track progress against your approved goals each quarter</p>
      </motion.div>

      {/* Quarter timeline */}
      <motion.div variants={itemVariants} className="glass-card p-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-semibold">
          {[{q:'Q1',m:'Jan - Mar'},{q:'Q2',m:'Apr - Jun'},{q:'Q3',m:'Jul - Sep'},{q:'Q4',m:'Oct - Dec'}].map(({q,m}) => (
            <div key={q} className="p-3 rounded-xl bg-[#F5F7FA] border border-[#DCE3EB] flex flex-col items-center justify-center hover:border-indigo-200 transition-colors group">
              <span className="text-lg font-extrabold text-indigo-600 group-hover:scale-110 transition-transform">{q}</span>
              <span className="text-slate-400 mt-0.5 text-[10px] font-semibold tracking-wide">{m}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {goals.filter(g => g.user_id === user.id).length > 0 && (
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Your Goals Tracker</h2>
          <div className="space-y-3">
            {goals.filter(g => g.user_id === user.id).map(goal => (
              <GoalCheckinCard key={goal.id} goal={goal}
                expanded={expandedGoal === goal.id}
                onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                onSaved={fetchData} />
            ))}
          </div>
        </motion.div>
      )}

      {(user.role === 'manager' || user.role === 'admin') && teamCheckins.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Team Check-in Approvals</h2>
          <div className="glass-card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Employee</th><th>Goal</th><th>Quarter</th><th>Planned</th><th>Actual</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {teamCheckins.map(c => (
                  <TeamCheckinRow key={c.id} checkin={c} onReviewed={fetchData} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function GoalCheckinCard({ goal, expanded, onToggle, onSaved }) {
  return (
    <div className={`glass-card transition-all duration-300 ${expanded ? 'border-indigo-200 ring-1 ring-indigo-50 shadow-lg shadow-indigo-100/20' : 'hover:border-[#CBD5E1]'}`}>
      <div className="p-5 flex items-center justify-between cursor-pointer group" onClick={onToggle}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'bg-[#F5F7FA] text-slate-400 group-hover:bg-[#E2E8F0]'}`}>
            <CalendarCheck className="w-4.5 h-4.5" />
          </div>
          <div className="pt-0.5">
            <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">{goal.title}</h3>
            <p className="text-[10px] font-medium text-slate-400 flex flex-wrap gap-2 items-center">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Target: {goal.target} {goal.uom_type}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
              <span className="font-bold text-indigo-500">Weightage: {goal.weightage}%</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 pl-4 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-sm font-extrabold text-slate-900">{goal.progress}%</span>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Overall</p>
          </div>
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${expanded ? 'bg-indigo-50 text-indigo-600' : 'bg-[#F5F7FA] text-slate-400 group-hover:bg-[#E2E8F0]'}`}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#E2E8F0] p-5 bg-[#F8FAFC]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUARTERS.map(q => (
                  <QuarterCheckinForm key={q} goalId={goal.id} quarter={q}
                    existing={goal.checkins?.find(c => c.quarter === q)}
                    onSaved={onSaved} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuarterCheckinForm({ goalId, quarter, existing, onSaved }) {
  const [planned, setPlanned] = useState(existing?.planned || '')
  const [actual, setActual] = useState(existing?.actual || '')
  const [progressStatus, setProgressStatus] = useState(existing?.progress_status || 'not_started')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await api.post('/api/checkins', { goal_id: goalId, quarter, planned, actual, progress_status: progressStatus })
      toast.success(`${quarter} check-in submitted`)
      onSaved()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit') }
    finally { setSaving(false) }
  }

  const isApproved = existing?.status === 'approved'

  return (
    <div className={`p-4 rounded-2xl border bg-white shadow-sm transition-all duration-300 ${isApproved ? 'border-emerald-200' : existing?.status === 'submitted' ? 'border-amber-200' : 'border-[#DCE3EB] hover:border-indigo-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-extrabold text-slate-900 tracking-tight">{quarter}</span>
        {existing && <span className={`badge badge-${existing.status} text-[9px]`}>{existing.status}</span>}
      </div>
      <div className="space-y-2.5">
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Planned</label>
          <input value={planned} onChange={e => setPlanned(e.target.value)} disabled={isApproved}
            className="input-field text-xs py-2 disabled:bg-[#F8FAFC] disabled:text-slate-400 disabled:border-[#E2E8F0]" placeholder="e.g., 25%" />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Actual</label>
          <input value={actual} onChange={e => setActual(e.target.value)} disabled={isApproved}
            className="input-field text-xs py-2 disabled:bg-[#F8FAFC] disabled:text-slate-400 disabled:border-[#E2E8F0]" placeholder="e.g., 30%" />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</label>
          <select value={progressStatus} onChange={e => setProgressStatus(e.target.value)} disabled={isApproved} 
            className="input-field text-xs py-2 disabled:bg-[#F8FAFC] disabled:text-slate-400 disabled:border-[#E2E8F0]">
            {PROGRESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        
        {existing?.score !== undefined && existing?.score !== null && (
          <div className="flex items-center justify-between py-2 border-t border-[#E2E8F0] mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{existing.score}%</span>
          </div>
        )}
        
        {existing?.manager_comment && (
          <div className="mt-2 bg-[#F5F7FA] p-2.5 rounded-xl border border-[#DCE3EB] flex gap-2">
            <MessageSquare className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-[10px] font-medium text-slate-600">{existing.manager_comment}</span>
          </div>
        )}

        {!isApproved && (
          <button onClick={handleSubmit} disabled={saving}
            className="btn-primary w-full py-2 text-[11px] mt-1">
            <Send className="w-3 h-3" /> {existing ? 'Update' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  )
}

function TeamCheckinRow({ checkin, onReviewed }) {
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)

  const handleReview = async (status) => {
    try {
      await api.post(`/api/checkins/review/${checkin.id}`, { status, comment })
      toast.success('Check-in reviewed')
      onReviewed()
    } catch (err) { toast.error('Failed to review') }
  }

  return (
    <>
      <tr className="group">
        <td>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              {checkin.employee_name?.[0]}
            </div>
            <span className="font-semibold text-slate-900 text-sm">{checkin.employee_name}</span>
          </div>
        </td>
        <td className="text-slate-600 font-medium text-sm">{checkin.goal_title}</td>
        <td><span className="badge bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">{checkin.quarter}</span></td>
        <td className="text-slate-600 text-sm">{checkin.planned || '-'}</td>
        <td className="text-slate-600 text-sm">{checkin.actual || '-'}</td>
        <td><span className={`badge badge-${checkin.status} text-[10px]`}>{checkin.status}</span></td>
        <td>
          {checkin.status === 'submitted' && (
            <div className="flex gap-1.5">
              <button onClick={() => handleReview('approved')} className="btn-success py-1.5 px-3 text-[11px]">Approve</button>
              <button onClick={() => handleReview('rejected')} className="btn-danger py-1.5 px-3 text-[11px]">Reject</button>
              <button onClick={() => setShowComment(!showComment)} className="btn-secondary py-1.5 px-2">
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </td>
      </tr>
      {showComment && (
        <tr className="bg-[#F8FAFC]">
          <td colSpan="7" className="p-4 border-b border-[#E2E8F0]">
            <div className="flex gap-3 max-w-2xl">
              <input value={comment} onChange={e => setComment(e.target.value)}
                className="input-field flex-1 text-sm" placeholder="Add feedback..." autoFocus />
              <button onClick={() => { handleReview('approved'); setShowComment(false) }}
                className="btn-primary whitespace-nowrap px-5 text-xs">Approve</button>
              <button onClick={() => { handleReview('rejected'); setShowComment(false) }}
                className="btn-danger whitespace-nowrap px-5 text-xs">Reject</button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

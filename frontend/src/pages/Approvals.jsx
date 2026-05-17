import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Check, X, MessageSquare, Edit3, User, Calendar, Target, Sparkles } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } }
}

export default function Approvals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPending() }, [])

  const fetchPending = async () => {
    try {
      const res = await api.get('/api/goals/pending')
      setGoals(res.data.goals)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/goals/${id}/approve`)
      toast.success('Goal approved')
      fetchPending()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleReject = async (id, reason) => {
    try {
      await api.post(`/api/goals/${id}/reject`, { reason })
      toast.success('Goal rejected')
      fetchPending()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8"><div className="skeleton h-8 w-52 mb-3" /><div className="skeleton h-4 w-64" /></div>
      <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto w-full">
      <motion.div variants={itemVariants} className="mb-8 page-header-accent">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Review Queue</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pending Approvals</h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">{goals.length} goal{goals.length !== 1 ? 's' : ''} awaiting your managerial review</p>
      </motion.div>

      {goals.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center bg-emerald-50/30 border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckSquare className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Inbox Zero!</h3>
          <p className="text-slate-400 text-sm font-medium">You have no pending goal approvals right now.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          <AnimatePresence>
            {goals.map(goal => (
              <ApprovalCard key={goal.id} goal={goal} onApprove={handleApprove} onReject={handleReject} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

function ApprovalCard({ goal, onApprove, onReject }) {
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ target: goal.target, weightage: goal.weightage })

  const handleInlineEdit = async () => {
    try {
      await api.put(`/api/goals/${goal.id}`, editForm)
      toast.success('Goal updated')
      setEditing(false)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  return (
    <motion.div 
      layout
      variants={itemVariants}
      initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card flex flex-col group overflow-visible"
    >
      <div className="p-6 pb-5">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge badge-pending text-[10px]">Action Required</span>
              {goal.rejection_count > 0 && (
                <span className="badge badge-rejected text-[10px]">Rejected {goal.rejection_count}x</span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug mb-1 tracking-tight">{goal.title}</h3>
            {goal.description && <p className="text-xs font-medium text-slate-400 line-clamp-2 mt-1">{goal.description}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-extrabold text-indigo-600 tracking-tight leading-none">{goal.weightage}<span className="text-sm text-indigo-300">%</span></p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1">Weight</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 border-y border-[#E2E8F0] my-4 text-sm font-medium text-slate-600 bg-[#F8FAFC] -mx-6 px-6 rounded-none">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Owner</span>
            <span className="flex items-center gap-1.5 text-slate-900 text-xs"><User className="w-3 h-3 text-slate-400" /> {goal.owner_name}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Submitted</span>
            <span className="flex items-center gap-1.5 text-xs"><Calendar className="w-3 h-3 text-slate-400" /> {goal.submitted_at ? new Date(goal.submitted_at).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Thrust Area</span>
            <span className="truncate text-xs">{goal.thrust_area}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Target</span>
            <span className="flex items-center gap-1.5 text-slate-900 text-xs"><Target className="w-3 h-3 text-indigo-400" /> {goal.target} {goal.uom_type === 'percentage' ? '%' : ''}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={() => onApprove(goal.id)} className="btn-success py-2.5 px-5 flex-1 sm:flex-none text-xs">
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button onClick={() => setShowReject(!showReject)} className="btn-danger py-2.5 px-5 flex-1 sm:flex-none text-xs">
            <X className="w-3.5 h-3.5" /> Request Changes
          </button>
          <button onClick={() => setEditing(!editing)} className="btn-secondary py-2.5 px-5 flex-1 sm:flex-none text-xs">
            <Edit3 className="w-3.5 h-3.5" /> Inline Edit
          </button>
        </div>

        <AnimatePresence>
          {editing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="mt-4 p-4 bg-indigo-50/80 rounded-xl border border-indigo-100">
                <h4 className="text-xs font-bold text-indigo-900 mb-3 uppercase tracking-wider">Manager Override</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-700 block mb-1">Target</label>
                    <input value={editForm.target} onChange={e => setEditForm({...editForm, target: e.target.value})} className="input-field text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-700 block mb-1">Weightage (%)</label>
                    <input type="number" value={editForm.weightage} onChange={e => setEditForm({...editForm, weightage: parseInt(e.target.value)})} className="input-field text-xs" min="10" max="100" />
                  </div>
                </div>
                <button onClick={handleInlineEdit} className="btn-primary py-2 w-full sm:w-auto text-xs">Save & Keep Pending</button>
              </div>
            </motion.div>
          )}

          {showReject && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
              <div className="mt-4 p-4 bg-rose-50/80 rounded-xl border border-rose-100">
                <h4 className="text-xs font-bold text-rose-900 mb-3 uppercase tracking-wider">Rejection Feedback</h4>
                <textarea value={reason} onChange={e => setReason(e.target.value)} className="input-field text-xs mb-3 resize-none" rows="2" placeholder="Explain what needs to be changed..." autoFocus />
                <button onClick={() => { onReject(goal.id, reason); setShowReject(false) }} disabled={!reason.trim()} className="btn-danger py-2 w-full sm:w-auto disabled:opacity-50 text-xs">
                  Return to Employee
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

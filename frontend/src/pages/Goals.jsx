import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Edit3, Trash2, Send, Share2, X, Target, Info, CheckCircle, BarChart3, Clock, Sparkles, ArrowUpRight } from 'lucide-react'

const THRUST_AREAS = ['Technical Excellence', 'Architecture', 'Quality', 'Leadership', 'Process', 'Delivery', 'Business', 'Revenue', 'Learning', 'Collaboration']
const UOM_TYPES = [
  { value: 'numeric_min', label: 'Numeric - Higher is better' },
  { value: 'numeric_max', label: 'Numeric - Lower is better' },
  { value: 'percentage_min', label: 'Percentage - Higher is better' },
  { value: 'percentage_max', label: 'Percentage - Lower is better' },
  { value: 'timeline', label: 'Timeline (Date-based)' },
  { value: 'zero', label: 'Zero-based (Zero = Success)' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Needs Changes' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } }
}

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [showShareModal, setShowShareModal] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchGoals() }, [])

  const fetchGoals = async () => {
    try {
      const res = await api.get('/api/goals')
      setGoals(res.data.goals)
    } catch (err) { toast.error('Failed to load goals') }
    finally { setLoading(false) }
  }

  const totalWeightage = goals
    .filter(g => g.user_id === user?.id && g.status !== 'deleted')
    .reduce((sum, g) => sum + Number(g.weightage || 0), 0)
  const remainingWeightage = Math.max(0, 100 - totalWeightage)

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    try {
      await api.delete(`/api/goals/${id}`)
      toast.success('Goal deleted')
      fetchGoals()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete') }
  }

  const handleSubmit = async (id) => {
    try {
      await api.post(`/api/goals/${id}/submit`)
      toast.success('Goal submitted for approval')
      fetchGoals()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit') }
  }

  const handleSubmitAll = async () => {
    try {
      await api.post('/api/goals/submit-all')
      toast.success('All goals submitted for approval')
      fetchGoals()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit') }
  }

  const ownGoals = goals.filter(g => g.user_id === user?.id)
  const sharedGoals = goals.filter(g => g.user_id !== user?.id)
  const filteredOwnGoals = filter === 'all' ? ownGoals : ownGoals.filter(g => g.status === filter)

  if (loading) return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8"><div className="skeleton h-8 w-48 mb-3" /><div className="skeleton h-4 w-72" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="glass-card p-5"><div className="skeleton h-4 w-20 mb-4" /><div className="skeleton h-5 w-40 mb-3" /><div className="skeleton h-3 w-full mb-2" /><div className="skeleton h-2 w-full mt-4" /></div>
        ))}
      </div>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <motion.div variants={itemVariants} className="page-header-accent">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Q4 2026</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Goals Overview</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Manage and track your performance milestones</p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5">
          <div className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${totalWeightage === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <BarChart3 className="w-3.5 h-3.5" /> {totalWeightage}/100%
          </div>
          {ownGoals.some(g => g.status === 'draft' || g.status === 'rejected') && totalWeightage === 100 && (
            <button onClick={handleSubmitAll} className="btn-secondary text-xs py-2.5">
              <Send className="w-3.5 h-3.5" /> Submit All
            </button>
          )}
          {ownGoals.length < 8 && totalWeightage < 100 && (
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setEditingGoal(null); setShowModal(true) }} 
              className="btn-primary text-xs py-2.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Goal
            </motion.button>
          )}
          {ownGoals.length < 8 && totalWeightage >= 100 && (
            <span className="px-3.5 py-2.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Allocation complete
            </span>
          )}
        </motion.div>
      </div>

      {/* Info banner */}
      <motion.div variants={itemVariants} className="bg-indigo-50/80 border border-indigo-100/80 p-4 rounded-2xl mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <div className="text-xs text-indigo-800 font-medium">
          <strong className="font-bold text-indigo-900">System Rules:</strong> Max 8 goals - min 10% weightage per goal - total must exactly equal 100% - goals lock after manager approval.
        </div>
      </motion.div>

      {/* Status filters */}
      {ownGoals.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f.value 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 bg-white border border-[#DCE3EB] hover:bg-slate-50 hover:text-slate-700'
              }`}>
              {f.value === 'all' ? `${f.label} (${ownGoals.length})` : `${f.label} (${ownGoals.filter(g => g.status === f.value).length})`}
            </button>
          ))}
        </motion.div>
      )}

      {filteredOwnGoals.length === 0 && ownGoals.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
            <Target className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No goals configured</h3>
          <p className="text-slate-400 text-sm mb-6 font-medium">Start by creating your first performance goal for this quarter.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create First Goal
          </button>
        </motion.div>
      ) : filteredOwnGoals.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-10 text-center">
          <p className="text-slate-400 text-sm font-medium">No goals match the "{filter}" filter.</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredOwnGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} user={user}
                onEdit={() => { setEditingGoal(goal); setShowModal(true) }}
                onDelete={() => handleDelete(goal.id)}
                onSubmit={() => handleSubmit(goal.id)}
                onShare={() => setShowShareModal(goal)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {sharedGoals.length > 0 && (
        <motion.div variants={itemVariants} className="mt-12">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 tracking-tight">
            <Share2 className="w-4 h-4 text-sky-500" /> Team Goals (Shared)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sharedGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} user={user} shared />
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <GoalModal goal={editingGoal} currentWeightage={totalWeightage}
            remainingWeightage={remainingWeightage}
            onClose={() => { setShowModal(false); setEditingGoal(null) }}
            onSave={() => { setShowModal(false); setEditingGoal(null); fetchGoals() }} />
        )}
        {showShareModal && (
          <ShareModal goal={showShareModal}
            onClose={() => setShowShareModal(null)}
            onSaved={() => { setShowShareModal(null); fetchGoals() }} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function GoalCard({ goal, user, shared, onEdit, onDelete, onSubmit, onShare }) {
  const progressColor = goal.progress >= 75 
    ? 'linear-gradient(90deg, #10b981, #06b6d4)' 
    : goal.progress >= 50 
    ? 'linear-gradient(90deg, #6366f1, #818cf8)' 
    : 'linear-gradient(90deg, #f59e0b, #f97316)'

  return (
    <motion.div 
      layout
      variants={itemVariants}
      initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card flex flex-col group"
    >
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className={`badge badge-${goal.status}`}>{goal.status}</span>
              {(goal.is_shared || shared) && <span className="badge bg-sky-50 text-sky-600 border border-sky-200 text-[10px]">Shared</span>}
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1 tracking-tight">{goal.title}</h3>
            {goal.description && <p className="text-xs text-slate-400 line-clamp-2 font-medium">{goal.description}</p>}
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="text-2xl font-extrabold text-indigo-600 tracking-tight leading-none">{goal.weightage}<span className="text-sm text-indigo-300">%</span></p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1">Weight</p>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Target className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{goal.thrust_area}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Target: <span className="font-semibold text-slate-700">{goal.target}</span></span>
          </div>
          {goal.owner_name && (
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[#E2E8F0]">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-[8px] font-bold">
                {goal.owner_name[0]}
              </div>
              <span className="text-xs font-medium text-slate-600">{goal.owner_name}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            <span className="text-xs font-bold text-slate-900">{goal.progress}%</span>
          </div>
          <div className="progress-bar h-1.5">
            <motion.div 
              className="progress-fill" 
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: progressColor }} 
            />
          </div>
        </div>

        {goal.shared_users?.length > 0 && (
          <div className="text-[10px] font-medium text-slate-400 mt-3 pt-2.5 border-t border-[#E2E8F0]">
            Shared with: <span className="text-slate-600">{goal.shared_users.map(u => u.shared_user_name).join(', ')}</span>
          </div>
        )}

        {goal.status === 'rejected' && goal.rejection_reason && (
          <div className="mt-3 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-100 font-medium">
            <span className="font-bold">Rejected:</span> {goal.rejection_reason}
          </div>
        )}
      </div>

      {!shared && (
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex gap-2">
          {(goal.status === 'draft' || goal.status === 'rejected') && (
            <>
              <button onClick={onEdit} className="btn-secondary flex-1 text-[11px] py-2 px-2.5">
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <button onClick={onSubmit} className="btn-primary flex-1 text-[11px] py-2 px-2.5">
                <Send className="w-3 h-3" /> Submit
              </button>
              <button onClick={onDelete} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {user?.role !== 'employee' && goal.status === 'approved' && (
            <button onClick={onShare} className="btn-secondary w-full text-[11px] py-2 px-2.5">
              <Share2 className="w-3 h-3" /> Share Goal
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

function GoalModal({ goal, currentWeightage, remainingWeightage, onClose, onSave }) {
  const [form, setForm] = useState({
    title: goal?.title || '', description: goal?.description || '',
    thrust_area: goal?.thrust_area || THRUST_AREAS[0], uom_type: goal?.uom_type || 'numeric_min',
    target: goal?.target || '', weightage: goal?.weightage || 10,
  })
  const [saving, setSaving] = useState(false)

  const maxWeightage = Math.max(0, 100 - currentWeightage + Number(goal?.weightage || 0))
  const canSaveWeightage = Number(form.weightage || 0) >= 10 && Number(form.weightage || 0) <= maxWeightage

  const handleSave = async (e) => {
    e.preventDefault()
    if (!canSaveWeightage) {
      toast.error(`Choose a weightage between 10% and ${maxWeightage}%`)
      return
    }
    setSaving(true)
    try {
      if (goal) {
        await api.put(`/api/goals/${goal.id}`, form)
        toast.success('Goal updated')
      } else {
        await api.post('/api/goals', form)
        toast.success('Goal created')
      }
      onSave()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <motion.div className="modal-overlay" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="modal-content" onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{goal ? 'Edit Goal' : 'Create Goal'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title <span className="text-rose-400">*</span></label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="input-field" required placeholder="e.g., Launch Q4 Marketing Campaign" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="input-field resize-none" rows="3" placeholder="Provide context or steps..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Thrust Area <span className="text-rose-400">*</span></label>
              <select value={form.thrust_area} onChange={e => setForm({...form, thrust_area: e.target.value})} className="input-field">
                {THRUST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Measurement <span className="text-rose-400">*</span></label>
              <select value={form.uom_type} onChange={e => setForm({...form, uom_type: e.target.value})} className="input-field">
                {UOM_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target <span className="text-rose-400">*</span></label>
              <input value={form.target} onChange={e => setForm({...form, target: e.target.value})}
                className="input-field" required placeholder="e.g., 100%" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Weightage (%)</label>
              <input type="number" value={form.weightage} onChange={e => setForm({...form, weightage: parseInt(e.target.value) || 0})}
                className="input-field" min="10" max={maxWeightage} required />
              <p className="text-[9px] font-semibold text-slate-400 mt-1">
                Min 10%, max {maxWeightage}% available{!goal && remainingWeightage < 100 ? `, ${remainingWeightage}% unassigned` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-5 border-t border-[#E2E8F0] mt-5">
            <button type="submit" disabled={saving || !canSaveWeightage} className="btn-primary flex-1 disabled:opacity-50 py-3">
              {saving ? 'Saving...' : (goal ? 'Update Goal' : 'Create Goal')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary py-3 px-6">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function ShareModal({ goal, onClose, onSaved }) {
  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/api/users/employees').then(res => {
      setEmployees(res.data.employees.filter(e => e.id !== goal.user_id))
    })
  }, [])

  const handleShare = async () => {
    setSaving(true)
    try {
      await api.post(`/api/goals/${goal.id}/share`, { user_ids: selected })
      toast.success('Goal shared successfully')
      onSaved()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to share') }
    finally { setSaving(false) }
  }

  return (
    <motion.div className="modal-overlay" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="modal-content" onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Share Goal</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="text-sm font-medium text-slate-600 mb-6 bg-[#F5F7FA] p-4 rounded-xl border border-[#DCE3EB]">
          <span className="font-bold text-slate-900 block mb-1">{goal.title}</span>
          Shared users will reference the owner's achievement data. Only weightage can differ.
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto mb-6 pr-1">
          {employees.map(emp => (
            <label key={emp.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selected.includes(emp.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-[#DCE3EB] hover:border-indigo-200'}`}>
              <input type="checkbox" checked={selected.includes(emp.id)}
                onChange={e => setSelected(e.target.checked ? [...selected, emp.id] : selected.filter(id => id !== emp.id))}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600" />
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  {emp.name[0]}
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-900 block leading-none mb-0.5">{emp.name}</span>
                  <span className="text-[10px] font-medium text-slate-400">{emp.department}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
          <button onClick={handleShare} disabled={!selected.length || saving} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? 'Sharing...' : `Share with ${selected.length} employee${selected.length !== 1 ? 's' : ''}`}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

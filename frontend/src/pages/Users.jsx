import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Users as UsersIcon, Plus, Edit3, X, Shield, UserCheck, User, Sparkles } from 'lucide-react'

const ROLES = ['employee', 'manager', 'admin']

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } }
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users')
      setUsers(res.data.users)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/api/users/${u.id}`, { is_active: !u.is_active })
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  const roleConfig = (role) => {
    if (role === 'admin') return { icon: Shield, gradient: 'from-rose-400 to-pink-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
    if (role === 'manager') return { icon: UserCheck, gradient: 'from-teal-400 to-emerald-500', badge: 'bg-violet-50 text-violet-700 border-violet-200' }
    return { icon: User, gradient: 'from-sky-400 to-blue-500', badge: 'bg-sky-50 text-sky-700 border-sky-200' }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8"><div className="skeleton h-8 w-44 mb-3" /><div className="skeleton h-4 w-60" /></div>
      <div className="glass-card"><div className="skeleton h-[400px] rounded-2xl" /></div>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <motion.div variants={itemVariants} className="page-header-accent">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Administration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Directory</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">{users.length} authenticated users in the workspace</p>
        </motion.div>
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditingUser(null); setShowModal(true) }} 
          className="btn-primary text-xs py-2.5"
        >
          <Plus className="w-3.5 h-3.5" /> Add User
        </motion.button>
      </div>

      <motion.div variants={itemVariants} className="glass-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Manager</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {users.map(u => {
                const rc = roleConfig(u.role)
                return (
                  <motion.tr layout key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                          {u.name?.[0]}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-400 font-medium text-sm">{u.email}</td>
                    <td>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${rc.badge}`}>
                        <rc.icon className="w-3 h-3" />
                        <span className="capitalize">{u.role}</span>
                      </div>
                    </td>
                    <td className="text-slate-500 font-medium text-sm">{u.department || '-'}</td>
                    <td className="text-slate-500 font-medium text-sm">{u.manager_name || '-'}</td>
                    <td>
                      <span className={`badge text-[10px] ${u.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-[#DCE3EB]'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditingUser(u); setShowModal(true) }}
                          className="btn-secondary text-[10px] py-1.5 px-2">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleToggleActive(u)}
                          className={`${u.is_active ? 'btn-danger' : 'btn-success'} text-[10px] py-1.5 px-3`}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <UserModal user={editingUser} managers={users.filter(u => u.role === 'manager')}
            onClose={() => { setShowModal(false); setEditingUser(null) }}
            onSaved={() => { setShowModal(false); setEditingUser(null); fetchUsers() }} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function UserModal({ user, managers, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', role: user?.role || 'employee',
    department: user?.department || '', manager_id: user?.manager_id || '',
    password: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (!payload.manager_id) payload.manager_id = null
      if (user) {
        await api.put(`/api/users/${user.id}`, payload)
        toast.success('User updated')
      } else {
        if (!payload.password) payload.password = 'password123'
        await api.post('/api/users', payload)
        toast.success('User created')
      }
      onSaved()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name <span className="text-rose-400">*</span></label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="input-field" required placeholder="e.g., Jane Doe" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email <span className="text-rose-400">*</span></label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="input-field" required placeholder="jane@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role <span className="text-rose-400">*</span></label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-field capitalize">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Department</label>
              <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                className="input-field" placeholder="e.g., Engineering" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reporting Manager</label>
            <select value={form.manager_id} onChange={e => setForm({...form, manager_id: e.target.value ? parseInt(e.target.value) : ''})} className="input-field">
              <option value="">None (Independent)</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.department})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{user ? 'Reset Password (optional)' : 'Initial Password'}</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="input-field" placeholder={user ? 'Leave blank to keep current' : 'Default: password123'} />
          </div>
          <div className="flex gap-3 pt-5 border-t border-[#E2E8F0] mt-5">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50 py-3">
              {saving ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary py-3 px-6">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

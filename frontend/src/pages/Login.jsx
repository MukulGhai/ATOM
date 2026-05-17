import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, User, Shield, UserCheck } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'employee1@atomquest.com', password: 'emp123', label: 'Employee', icon: User, gradient: 'from-cyan-500 to-blue-600' },
    { email: 'manager@atomquest.com', password: 'manager123', label: 'Manager', icon: UserCheck, gradient: 'from-teal-500 to-emerald-600' },
    { email: 'admin@atomquest.com', password: 'admin123', label: 'Admin', icon: Shield, gradient: 'from-amber-500 to-orange-600' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F7FA] relative overflow-hidden">
      <motion.div 
        initial="hidden" animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Back to home */}
        <motion.div variants={fadeUp} custom={0}>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div variants={fadeUp} custom={1} className="text-center mb-8">
          <BrandLogo size={58} showWordmark showTagline className="justify-center mb-5" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Sign in to your AtomQuest workspace</p>
        </motion.div>

        {/* Login Form */}
        <motion.div variants={fadeUp} custom={2} className="glass-card p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field h-12" placeholder="you@atomquest.com" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input id="login-password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} className="input-field h-12 pr-10" placeholder="Password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-50">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button id="login-submit" type="submit" disabled={loading}
              className="btn-primary w-full h-12 text-center disabled:opacity-50 text-base font-semibold shadow-lg shadow-indigo-200/30">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div 
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </motion.div>

        {/* Demo Accounts */}
        <motion.div variants={fadeUp} custom={3} className="mt-6">
          <p className="text-center text-slate-400 text-[10px] font-bold mb-3 tracking-widest uppercase">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map(acc => (
              <motion.button 
                key={acc.email} 
                onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group p-3.5 rounded-xl bg-white border border-[#DCE3EB] text-center transition-all hover:shadow-lg hover:border-slate-300"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${acc.gradient} flex items-center justify-center mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                  <acc.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-600">{acc.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.p variants={fadeUp} custom={4} className="text-center text-slate-300 text-xs mt-8 font-medium">
          AtomQuest Hackathon 1.0 - 2026
        </motion.p>
      </motion.div>
    </div>
  )
}

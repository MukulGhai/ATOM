import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  Target, ShieldAlert, Users, ArrowRight, BarChart3, CheckCircle,
  Sparkles, UserRound, BriefcaseBusiness, ShieldCheck, ClipboardList, Send,
  GitPullRequestArrow, Gauge, Activity, Network, BellRing, BadgeCheck,
  LineChart, Layers3
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import HeroOrbitScene from '../components/HeroOrbitScene'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

export default function Landing() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 84])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.68], [1, 0])

  const metrics = [
    { label: 'Active Users', value: '2,400+', icon: Users },
    { label: 'Goals Tracked', value: '18,000+', icon: Target },
    { label: 'Quarterly Check-ins', value: '45,000+', icon: CheckCircle },
    { label: 'Departments', value: '120+', icon: BarChart3 },
  ]

  const workflow = [
    {
      icon: ClipboardList,
      title: 'Set weighted goals',
      desc: 'Create focused objectives, add measurable targets, and keep the weightage total locked at 100%.',
    },
    {
      icon: GitPullRequestArrow,
      title: 'Route for review',
      desc: 'Managers approve, request changes, or fine-tune goals before the quarter starts.',
    },
    {
      icon: Send,
      title: 'Run check-ins',
      desc: 'Employees submit planned versus actual progress while managers capture feedback in one place.',
    },
    {
      icon: Gauge,
      title: 'Watch the health',
      desc: 'Analytics, notifications, and escalations surface stalled work before it becomes a surprise.',
    },
  ]

  const features = [
    {
      icon: Target,
      title: 'Goal design',
      desc: 'Weightage validation, approval status, target values, and owner context keep every goal clear.',
      color: 'text-blue-700 bg-blue-50 border-blue-100',
    },
    {
      icon: Activity,
      title: 'Progress rhythm',
      desc: 'Quarterly check-ins turn performance updates into a consistent operating cadence.',
      color: 'text-teal-700 bg-teal-50 border-teal-100',
    },
    {
      icon: BellRing,
      title: 'Escalation signals',
      desc: 'Late updates, blocked approvals, and stale goals are raised automatically for faster action.',
      color: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      icon: LineChart,
      title: 'Analytics layer',
      desc: 'Status, department, achievement, and completion views give managers a cleaner read on risk.',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-100',
    },
  ]

  const activity = [
    { label: 'Q2 goals approved', value: '17', tone: 'text-emerald-600', icon: BadgeCheck },
    { label: 'Check-ins submitted', value: '84%', tone: 'text-blue-600', icon: Send },
    { label: 'Open escalations', value: '03', tone: 'text-amber-600', icon: ShieldAlert },
  ]

  return (
    <div id="top" className="min-h-screen bg-[#F5F7FA] text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <nav className="fixed top-0 w-full glass-nav z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[68px] items-center">
            <BrandLogo size={42} showWordmark showTagline className="min-w-0" />
            <div className="flex items-center gap-3">
              <a href="#how-it-works" className="hidden md:inline-flex text-slate-600 hover:text-slate-950 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-black/[0.03]">
                How it works
              </a>
              <Link to="/login" className="hidden sm:inline-flex text-slate-600 hover:text-slate-950 font-semibold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-black/[0.03]">
                Log in
              </Link>
              <Link to="/login" className="bg-slate-950 text-white px-4 sm:px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 inline-flex items-center gap-2">
                Open Demo
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative pt-24 lg:pt-28 landing-hero-bg overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-6 items-center min-h-[720px] pb-10 lg:pb-16">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="text-center lg:text-left relative z-20"
              >
                <motion.div variants={fadeUp} custom={0} className="mb-7 flex justify-center lg:justify-start">
                  <BrandLogo size={62} showWordmark showTagline className="landing-hero-logo" />
                </motion.div>

                <motion.div variants={fadeUp} custom={1}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/82 backdrop-blur-sm border border-blue-100/80 text-blue-700 text-xs font-bold tracking-normal mb-5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Goal Command Center for modern teams</span>
                </motion.div>

                <motion.h1 variants={fadeUp} custom={2}
                  className="text-4xl sm:text-5xl lg:text-[4.35rem] font-black text-slate-950 tracking-normal mb-6 leading-[1.02] text-balance">
                  Run every goal cycle from one live workspace.
                </motion.h1>

                <motion.p variants={fadeUp} custom={3}
                  className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  AtomQuest brings goals, approvals, check-ins, escalations, and analytics into a focused operating room for employees, managers, and admins.
                </motion.p>

                <motion.div variants={fadeUp} custom={4}
                  className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                  <Link to="/login" className="group bg-gradient-to-r from-blue-700 via-teal-700 to-cyan-700 text-white px-7 py-4 rounded-lg font-bold text-base hover:shadow-xl hover:shadow-blue-300/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2.5 shadow-lg shadow-blue-300/20">
                    Launch Demo Workspace
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <a href="#how-it-works" className="bg-white/86 backdrop-blur-sm text-slate-800 border border-slate-200/90 px-7 py-4 rounded-lg font-bold text-base hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center shadow-sm">
                    See the workflow
                  </a>
                </motion.div>

                <motion.div variants={fadeUp} custom={5} className="grid grid-cols-3 gap-2 max-w-xl mx-auto lg:mx-0">
                  {activity.map(item => (
                    <div key={item.label} className="landing-mini-stat">
                      <item.icon className={`w-4 h-4 ${item.tone}`} />
                      <strong className={item.tone}>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.05, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="landing-hero-visual relative min-h-[500px] lg:min-h-[620px] w-full"
              >
                <HeroOrbitScene />

                <motion.div
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="hero-signal hero-signal-top"
                >
                  <span className="hero-signal-kicker">Goal Health</span>
                  <strong>82%</strong>
                  <span>on track this quarter</span>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 11, 0] }}
                  transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="hero-signal hero-signal-bottom"
                >
                  <span className="hero-signal-kicker">Review Queue</span>
                  <strong>3</strong>
                  <span>items need action</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="landing-command-panel"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-normal text-slate-400">Live operating loop</span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Synced
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['Create goal set', 'Employee'],
                      ['Manager approval', 'Manager'],
                      ['Quarter check-in', 'Team'],
                    ].map(([name, role], index) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-950 text-white text-xs font-black flex items-center justify-center">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-extrabold text-slate-900 leading-none">{name}</p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-1">{role}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7 }}
              className="landing-metrics-strip"
            >
              {metrics.map((m) => (
                <div key={m.label} className="landing-metric">
                  <m.icon className="w-5 h-5 text-blue-600" />
                  <p className="text-2xl font-black text-slate-950 tracking-normal">{m.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 tracking-normal uppercase mt-1">{m.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="py-20 lg:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold tracking-normal mb-5">
                <Network className="w-3.5 h-3.5" /> Why it feels coordinated
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-black text-slate-950 tracking-normal mb-4">
                The system keeps the work moving after goals are submitted.
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-slate-600 text-lg leading-relaxed font-medium">
                Goal programs usually slow down between planning and review. AtomQuest makes the in-between visible with queues, approvals, check-ins, reminders, and escalation signals.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={fadeUp} custom={index} className="landing-feature-stage">
                  <InteractiveFeatureCard feature={feature} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 lg:py-24 landing-grid-band">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-12"
          >
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-normal mb-5">
              <ClipboardList className="w-3.5 h-3.5" /> How to use AtomQuest
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-black text-slate-950 tracking-normal mb-4">
              A clear operating rhythm for the whole quarter
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-600 text-lg leading-relaxed font-medium">
              Start with a goal set, route it to the right reviewer, keep progress current, and use analytics to decide what needs attention next.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {workflow.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6 }}
                className="workflow-step bg-white border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="w-11 h-11 rounded-lg bg-slate-950 flex items-center justify-center shadow-sm">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-300">0{i + 1}</span>
                </div>
                <h3 className="text-base font-black text-slate-950 mb-2 tracking-normal">{step.title}</h3>
                <p className="text-sm leading-relaxed font-medium text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-24 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-cyan-200 text-xs font-bold tracking-normal mb-5">
                <BarChart3 className="w-3.5 h-3.5" /> Analytics Preview
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-black text-white tracking-normal mb-4">
                Know which goals are healthy, blocked, or waiting for review.
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-slate-300 text-lg leading-relaxed mb-7 font-medium">
                The analytics area turns scattered updates into a readable status picture for leaders and teams.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="grid sm:grid-cols-2 gap-3">
                {['Goal status distribution', 'Department performance', 'Completion dashboard', 'Audit trail for governed changes'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-teal-300" />
                    <span className="text-sm font-semibold text-slate-200">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="landing-analytics-board"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-normal text-slate-400">Performance Analytics</p>
                  <h3 className="text-lg font-black text-white tracking-normal mt-1">Goal Status</h3>
                </div>
                <span className="rounded-lg bg-emerald-400/10 border border-emerald-300/20 px-3 py-1 text-xs font-bold text-emerald-200">+12.5%</span>
              </div>
              <div className="landing-analytics-grid grid grid-cols-[140px_1fr] gap-5 items-center">
                <div className="landing-donut">
                  <span>87%</span>
                </div>
                <div className="space-y-3">
                  {[
                    ['Approved', '68%', 'bg-emerald-400'],
                    ['Pending Review', '19%', 'bg-amber-300'],
                    ['Needs Changes', '8%', 'bg-rose-300'],
                  ].map(([label, value, color]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: value }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {['Goals', 'Check-ins', 'Alerts'].map((label, index) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-2xl font-black text-white">{[184, 92, 3][index]}</p>
                    <p className="text-[10px] font-bold uppercase tracking-normal text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold tracking-normal mb-5">
              <Users className="w-3.5 h-3.5" /> Built for every role
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl lg:text-4xl font-black text-slate-950 tracking-normal mb-4">
              One product, three focused workspaces
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-600 text-lg leading-relaxed font-medium">
              Employees, managers, and admins each see the actions that matter to their part of the performance cycle.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              { role: 'Employee', desc: 'Set goals, update check-ins, and understand what is approved or needs changes.', icon: UserRound, color: 'text-blue-700 bg-blue-50 border-blue-100' },
              { role: 'Manager', desc: 'Review goals, approve check-ins, and spot the team members who need support.', icon: BriefcaseBusiness, color: 'text-teal-700 bg-teal-50 border-teal-100' },
              { role: 'Admin', desc: 'Manage users, departments, escalations, governance data, and org-level analytics.', icon: ShieldCheck, color: 'text-slate-800 bg-slate-100 border-slate-200' },
            ].map((item, i) => (
              <motion.div key={item.role} variants={fadeUp} custom={i}
                whileHover={{ y: -5 }}
                className="landing-role-card">
                <div className={`w-12 h-12 rounded-lg border ${item.color} flex items-center justify-center mb-5`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-950 mb-3 tracking-normal">{item.role}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-24 landing-grid-band">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="landing-cta"
          >
            <Layers3 className="w-9 h-9 text-cyan-200 mx-auto mb-5" />
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-normal mb-5">
              Make your review cycle feel organized from day one.
            </h2>
            <p className="text-slate-300 text-lg mb-9 max-w-2xl mx-auto font-medium leading-relaxed">
              Open the demo workspace and move through the same flow your team would use: goals, approvals, check-ins, escalations, and analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="group bg-white text-slate-950 px-8 py-4 rounded-lg font-bold text-base hover:bg-blue-50 transition-all shadow-xl shadow-black/20 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2.5">
                Open Demo Workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#how-it-works" className="text-white/86 border border-white/20 px-8 py-4 rounded-lg font-bold text-base hover:bg-white/10 hover:text-white hover:border-white/30 transition-all flex items-center justify-center backdrop-blur-sm">
                Review the workflow
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <BrandLogo size={42} showWordmark showTagline />
            <div className="flex items-center gap-7 text-sm font-semibold text-slate-500">
              <a href="#how-it-works" className="hover:text-slate-950 transition-colors">How it works</a>
              <Link to="/login" className="hover:text-slate-950 transition-colors">Dashboard</Link>
              <a href="#top" className="hover:text-slate-950 transition-colors">Top</a>
            </div>
            <p className="text-xs font-semibold text-slate-400">AtomQuest Hackathon 1.0 - 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function InteractiveFeatureCard({ feature }) {
  const handlePointerMove = (event) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * 13
    const rotateX = (0.5 - y) * 11

    card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`)
    card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`)
    card.style.setProperty('--card-lift', '-8px')
    card.style.setProperty('--shine-x', `${Math.round(x * 100)}%`)
    card.style.setProperty('--shine-y', `${Math.round(y * 100)}%`)
  }

  const handlePointerLeave = (event) => {
    const card = event.currentTarget
    card.style.setProperty('--card-rotate-x', '0deg')
    card.style.setProperty('--card-rotate-y', '0deg')
    card.style.setProperty('--card-lift', '0px')
    card.style.setProperty('--shine-x', '50%')
    card.style.setProperty('--shine-y', '0%')
  }

  return (
    <article
      className="landing-feature-card landing-feature-card-3d"
      tabIndex={0}
      aria-label={`${feature.title}: ${feature.desc}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onBlur={handlePointerLeave}
    >
      <div className={`landing-feature-icon w-11 h-11 rounded-lg border flex items-center justify-center mb-5 ${feature.color}`}>
        <feature.icon className="w-5 h-5" />
      </div>
      <h3 className="landing-feature-title text-lg font-black text-slate-950 mb-2 tracking-normal">{feature.title}</h3>
      <p className="landing-feature-copy text-sm leading-relaxed font-medium text-slate-500">{feature.desc}</p>
    </article>
  )
}

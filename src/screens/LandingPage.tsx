import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, Zap, BarChart3, Users, Sparkles,
  CheckCircle2, Menu, X, Star, Layers,
  ShoppingBag, Brain, TrendingUp, Calendar,
  PenTool, Target,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const SYSTEMS = [
  { icon: '🔗', name: 'LinkedIn Lead Engine', category: 'Lead Gen', color: 'bg-blue-500' },
  { icon: '📧', name: 'Newsletter Growth Engine', category: 'Email', color: 'bg-violet-500' },
  { icon: '🚀', name: 'Product Launch Campaign', category: 'Launch', color: 'bg-orange-500' },
  { icon: '💼', name: 'Freelancer Lead Funnel', category: 'Outreach', color: 'bg-emerald-500' },
  { icon: '🏢', name: 'Agency Client Acquisition', category: 'Clients', color: 'bg-rose-500' },
];

const FEATURES = [
  {
    icon: Layers,
    title: 'Campaign Systems Library',
    description: 'Pre-built, ready-to-install marketing systems. Pick a template, install it in one click, and start executing immediately.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Brain,
    title: 'AI Campaign Generator',
    description: 'Describe your goal and watch AI build you a complete campaign system with posts, emails, scripts, and automation rules.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: PenTool,
    title: 'Content Lab',
    description: 'Draft LinkedIn posts, emails, and blog articles with AI. Edit, approve, and schedule — all from one place.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Calendar,
    title: 'Campaign Calendar',
    description: 'See your entire marketing schedule at a glance. Never miss a post or campaign milestone again.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track what\'s working. Campaign performance, lead sources, content metrics — all in one clean view.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Users,
    title: 'Agency Workspaces',
    description: 'Manage multiple clients from one account. Each client gets their own workspace, campaigns, and lead pipeline.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Pick a campaign system',
    description: 'Browse the Systems Library and choose a template built for your exact goal — leads, launches, email growth, and more.',
    icon: Target,
  },
  {
    number: '02',
    title: 'Install in one click',
    description: 'Every system comes pre-loaded with posts, outreach scripts, emails, and automation rules — ready to execute.',
    icon: Zap,
  },
  {
    number: '03',
    title: 'Execute and track results',
    description: 'Work through your campaign assets, track progress, and generate new content with AI as you go.',
    icon: TrendingUp,
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    tagline: 'Launch your first system',
    features: ['1 active campaign system', '500 leads', 'Systems library access', '5 AI drafts/month', 'Email support'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$59',
    period: '/mo',
    tagline: 'Scale your marketing',
    features: ['Unlimited campaign systems', '5,000 leads', 'AI campaign generator', 'Full analytics', 'Automation workflows', 'Priority support'],
    cta: 'Get Growth',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$249',
    period: '/mo',
    tagline: 'Manage multiple clients',
    features: ['10 client workspaces', 'Unlimited campaigns', 'White-label reports', 'Advanced analytics', 'Dedicated manager'],
    cta: 'Go Agency',
    highlight: false,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-lg border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-sm">S</div>
            <span className="font-bold text-lg tracking-tight text-white">SoloMarket</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Get Started Free
            </button>
          </div>
          <button className="sm:hidden p-2 text-slate-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/5 bg-slate-950 px-4 py-4 space-y-3">
            <button onClick={() => navigate('/login')} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-400">
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="block w-full px-3 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl text-center"
            >
              Get Started Free
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 sm:pt-44 pb-20 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered marketing systems for solopreneurs
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Install a Complete<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Marketing System
              </span>
              <br />in Minutes
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              SoloMarket gives you done-for-you campaign systems, an AI generator, a content lab,
              and a full analytics dashboard — everything in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-slate-500">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '5+', label: 'Campaign Systems' },
            { value: '8+', label: 'Add-on Packs' },
            { value: '1-click', label: 'System Install' },
            { value: 'AI', label: 'Custom Campaigns' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Systems Library Preview ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 border border-emerald-500/20">
              Systems Library
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">
              Stop starting from scratch.<br />
              <span className="text-slate-400">Install a proven system.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Every system comes pre-loaded with campaign assets — posts, scripts, emails, and workflows — ready to execute on day one.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {SYSTEMS.map((system, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-default group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${system.color} rounded-xl flex items-center justify-center text-xl`}>
                    {system.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{system.category}</span>
                </div>
                <h3 className="font-bold text-white text-sm leading-snug">{system.name}</h3>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-2xl p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:border-violet-400/40 transition-all group"
              onClick={() => navigate('/signup')}
            >
              <Sparkles className="w-8 h-8 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-sm">AI Generate Your Own</h3>
              <p className="text-xs text-slate-500 mt-1">Describe your goal →</p>
            </motion.div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Marketplace — 8+ add-on systems available
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Everything you need.<br />
              <span className="text-slate-400">Nothing you don't.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              One platform that replaces your scattered tools, docs, and guesswork.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Up and running<br /><span className="text-emerald-400">in 3 steps</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">
              From zero to a fully operational marketing campaign in under 5 minutes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-xs font-black text-emerald-500 tracking-widest uppercase mb-2">{step.number}</div>
                <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">
              Start free. Upgrade when you're ready to scale.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border flex flex-col ${
                  plan.highlight
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20'
                    : 'bg-white/[0.04] border-white/10 text-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-emerald-600 text-xs font-black rounded-full uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-white'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-3 ${plan.highlight ? 'text-emerald-100' : 'text-slate-400'}`}>{plan.tagline}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-emerald-200' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-emerald-200' : 'text-emerald-400'}`} />
                      <span className={plan.highlight ? 'text-emerald-50' : 'text-slate-300'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial + CTA ── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium text-white italic mb-4 leading-relaxed">
              "I finally feel like I have a real marketing strategy — not just random posts and hope."
            </blockquote>
            <p className="text-slate-500 text-sm mb-16">— SoloMarket user</p>

            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-10 sm:p-14 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
                  Ready to install your first marketing system?
                </h2>
                <p className="text-emerald-100 mb-8 max-w-lg mx-auto text-lg">
                  Join solopreneurs who replaced their scattered tools with one marketing OS.
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-bold text-lg rounded-2xl hover:bg-emerald-50 transition-all shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-emerald-200 text-xs mt-4">No credit card required</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xs">S</div>
            <span className="font-semibold text-white">SoloMarket</span>
          </div>
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} SoloMarket by Ketorah Digital. All rights reserved.</p>
          <a href="mailto:ketorah.digital@gmail.com" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ketorah.digital@gmail.com
          </a>
        </div>
      </footer>

    </div>
  );
}

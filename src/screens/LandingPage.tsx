import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, Zap, Sparkles,
  CheckCircle2, Menu, X, Star,
  Brain, TrendingUp, Calendar,
  PenTool, Target, Bot, Users,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Marketing Plan',
    description: 'Enter your product, audience, and goal. Get a hyper-specific 30-day strategy with real platforms, exact tactics, and actionable next steps — not generic advice.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    badge: null,
  },
  {
    icon: Zap,
    title: 'Campaigns',
    description: 'Organize every marketing push in one place. Launch, email, lead gen, and authority campaigns — tracked from plan to execution.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    badge: null,
  },
  {
    icon: Calendar,
    title: 'Marketing Calendar',
    description: 'See your entire marketing schedule at a glance. Plan your week visually, see all campaigns and content in one view, and stay consistent.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    badge: '⭐ Beta Favorite',
  },
  {
    icon: PenTool,
    title: 'Content Lab',
    description: 'Draft AI-powered posts for every platform, repurpose long-form content in one click, and generate on-brand images — no Canva required.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    badge: null,
  },
  {
    icon: Users,
    title: 'Lead Tracker',
    description: 'Track the people you\'re building relationships with. Automatic alerts when contacts go cold. AI-personalized re-engagement emails in seconds.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    badge: null,
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Ask your AI anything from inside your dashboard — create content, plan campaigns, or analyze your marketing. Always in context.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    badge: null,
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up and log in. Your marketing workspace is ready instantly — no setup, no integrations required.',
    icon: Target,
  },
  {
    number: '02',
    title: 'Generate your plan',
    description: 'Enter your product and goal. Get a specific 30-day marketing strategy with real actions you can execute today.',
    icon: Brain,
  },
  {
    number: '03',
    title: 'Create, schedule, execute',
    description: 'Use Content Lab to draft and repurpose content, track your calendar, manage leads — all from one tab.',
    icon: TrendingUp,
  },
];

const PLAN_FEATURES = [
  'AI Marketing Plan Generator',
  'Campaign Management',
  'Marketing Calendar',
  'Content Lab — drafts, repurposing + image generation',
  'Lead Tracker + AI re-engagement emails',
  'AI Assistant',
  'Your own personal account — sign in anytime',
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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Marketing OS for solopreneurs
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Stop juggling tools.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Start marketing.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Plan campaigns, create AI-powered content, manage your marketing calendar,
              and track leads — all in one place. Built for founders who do it alone.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                Get Started — $29/mo
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-white/40 text-white font-semibold text-lg rounded-2xl transition-all"
              >
                Sign In
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-3">7-day money-back guarantee · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '6', label: 'Tools in One App' },
            { value: 'AI', label: 'Marketing Plans' },
            { value: '⭐', label: 'Calendar — Beta Favorite' },
            { value: '$29', label: 'Per Month, All In' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
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
                className={`bg-white/[0.03] border rounded-2xl p-6 hover:border-white/20 transition-all ${
                  f.badge ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-white/10'
                }`}
              >
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                {f.badge && (
                  <div className="inline-flex items-center px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-xs font-semibold rounded-full mb-2">
                    {f.badge}
                  </div>
                )}
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
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">
              One plan. Every feature. No tiers, no limits, no surprises.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl p-8 sm:p-10 border border-emerald-500/30 bg-white/[0.04] overflow-hidden"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
              <div>
                <div className="text-xs font-bold tracking-widest uppercase text-emerald-400 mb-3">SoloMarket</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-6xl font-black text-white">$29</span>
                  <span className="text-slate-400 text-lg">/month</span>
                </div>
                <p className="text-slate-500 text-sm">Full access · Cancel anytime</p>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="sm:shrink-0 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mt-8 pt-8 border-t border-white/10 grid sm:grid-cols-2 gap-3">
              {PLAN_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span className="text-slate-300">{f}</span>
                </div>
              ))}
            </div>
            <p className="relative mt-6 text-center text-xs text-slate-600">
              7-day money-back guarantee · No questions asked
            </p>
          </motion.div>
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
                  Get Started — $29/mo
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-emerald-200 text-xs mt-4">7-day money-back guarantee · Cancel anytime</p>
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Rocket,
  Calendar,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Zap,
  Target,
  PenTool,
  Share2,
  Star,
  Menu,
  X,
} from 'lucide-react';

const features = [
  {
    icon: Lightbulb,
    title: 'AI-Powered Plans',
    description: 'Generate a full 4-week marketing plan in seconds. Just describe your product and let AI do the heavy lifting.',
  },
  {
    icon: PenTool,
    title: 'Content Lab',
    description: 'Draft LinkedIn posts, tweets, emails, and blog articles with AI — then edit and publish from one place.',
  },
  {
    icon: Calendar,
    title: 'Campaign Calendar',
    description: 'See your entire marketing schedule at a glance. Drag, plan, and never miss a post again.',
  },
  {
    icon: Target,
    title: 'Campaign Playbooks',
    description: 'Launch proven campaigns — product launches, lead magnets, brand awareness — with step-by-step templates.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track what\'s working. See your top content, campaign performance, and lead sources in real time.',
  },
  {
    icon: Share2,
    title: 'Share Everywhere',
    description: 'Copy your content and share directly to LinkedIn, Facebook, and X with one click.',
  },
];

const steps = [
  { number: '1', title: 'Add your product', description: 'Tell us what you sell and who it\'s for.' },
  { number: '2', title: 'Get your marketing plan', description: 'AI generates a 4-week campaign strategy.' },
  { number: '3', title: 'Create & publish content', description: 'Draft, edit, and share across platforms.' },
];

const painPoints = [
  'Juggling spreadsheets, Notion pages, and random notes',
  'Spending hours writing social media posts from scratch',
  'Never knowing what to post or when to post it',
  'Feeling overwhelmed by "marketing strategy" advice',
  'Paying for 5+ tools that don\'t talk to each other',
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-base">S</div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SoloMarket</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest ml-1">
              Beta
            </span>
          </div>
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-emerald-200"
            >
              Join the Free Beta
            </button>
          </div>
          {/* Mobile hamburger */}
          <button className="sm:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
            <button onClick={() => navigate('/login')} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700">
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="block w-full px-3 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl text-center"
            >
              Join the Free Beta
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              Free during beta — join now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              The Marketing OS<br />
              <span className="text-emerald-600">for Solopreneurs</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Plan, create, and execute your entire marketing strategy from one dashboard.
              Stop juggling spreadsheets and random tools — start growing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                Join the Free Beta
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-slate-400">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* App Screenshots */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main screenshot — Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl mb-8"
          >
            <img
              src="/screenshots/solomarket_dashboard.png"
              alt="SoloMarket Dashboard — your marketing command center"
              className="w-full rounded-xl sm:rounded-2xl"
            />
          </motion.div>

          {/* Secondary screenshots — Content Lab & Calendar */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { src: '/screenshots/solomarket_contentlab.png', alt: 'Content Lab — AI-powered content creation', label: 'Content Lab' },
              { src: '/screenshots/solomarket_calendar.png', alt: 'Campaign Calendar — plan your marketing schedule', label: 'Campaign Calendar' },
            ].map((shot, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="w-full rounded-xl"
                  />
                </div>
                <p className="text-center text-sm text-slate-500 font-medium mt-3">{shot.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 sm:py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
              Sound familiar?
            </h2>
            <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
              Most solopreneurs waste hours on marketing busywork instead of growing their business.
            </p>
            <div className="max-w-lg mx-auto space-y-3">
              {painPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
                >
                  <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 text-sm sm:text-base">{point}</span>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <p className="text-lg font-semibold text-emerald-600 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                SoloMarket replaces all of that with one simple dashboard.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
            Up and running in 3 steps
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            Go from zero to a full marketing plan in under 5 minutes.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
            Everything you need to market your business
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            One tool instead of five. Built specifically for solo founders and small teams.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Beta CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium text-slate-800 italic mb-4 leading-relaxed">
              "I finally feel like I have a marketing strategy — not just random posts and hope."
            </blockquote>
            <p className="text-slate-400 text-sm mb-12">— Early beta tester</p>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to take control of your marketing?</h2>
              <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
                Join the free beta and get lifetime access to founder pricing when we launch.
              </p>
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-white text-emerald-700 font-bold text-lg rounded-2xl hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                Join the Free Beta
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-emerald-200 text-xs mt-4">Invite code required — spots are limited</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-semibold text-slate-700">SoloMarket</span>
          </div>
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} SoloMarket. All rights reserved.</p>
          <a href="mailto:ketorah.digital@gmail.com" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ketorah.digital@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}

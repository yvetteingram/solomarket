import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, ChevronRight, ChevronLeft, Target, Megaphone,
  FlaskConical, Calendar, Users, BarChart3, Sparkles,
  CheckCircle2, ArrowRight, Bot
} from 'lucide-react';

const STEPS = [
  {
    number: 1,
    title: 'Add Your Product',
    subtitle: 'Tell SoloMarket what you\'re selling',
    description:
      'Start by adding your product — a course, SaaS, service, template, or anything you sell. Enter your name, type, price, and target audience. SoloMarket uses this to personalize every plan and content draft it generates for you.',
    screenshot: '/screenshots/solomarket_dashboard.png',
    icon: Target,
    color: 'bg-purple-500',
    bullets: [
      'Digital products, services, courses, SaaS',
      'Set your price and target audience',
      'Used by AI to personalize all output',
    ],
  },
  {
    number: 2,
    title: 'Generate a 30-Day Marketing Plan',
    subtitle: 'AI builds your complete strategy in seconds',
    description:
      'Choose your product, pick a marketing goal (lead gen, brand awareness, launch, etc.), and set your tone. SoloMarket\'s AI generates a full 4-week structured marketing plan with weekly themes, campaign activities, and a content schedule — tailored to your audience.',
    screenshot: '/screenshots/solomarket_dashboard.png',
    icon: Sparkles,
    color: 'bg-blue-500',
    bullets: [
      'Choose goal: leads, launch, awareness, email growth',
      '4-week plan with weekly themes and campaigns',
      'Instantly editable and downloadable',
    ],
  },
  {
    number: 3,
    title: 'Install a Campaign System',
    subtitle: 'Pre-built marketing playbooks, ready to run',
    description:
      'Browse the Systems Library and install a complete campaign system in one click. Each system includes social posts, outreach scripts, email sequences, and automation rules — all pre-written and organized so you can start executing immediately, not planning.',
    screenshot: '/screenshots/solomarket_dashboard.png',
    icon: Megaphone,
    color: 'bg-orange-500',
    bullets: [
      'LinkedIn authority, email growth, cold outreach, and more',
      'All posts, scripts, and emails included',
      'One-click install into your campaign calendar',
    ],
  },
  {
    number: 4,
    title: 'Draft Content with AI',
    subtitle: 'Generate LinkedIn posts, emails, and blog content',
    description:
      'Open Content Lab, describe what you need, and SoloMarket\'s AI drafts it instantly. Write LinkedIn posts, email sequences, blog outlines, or YouTube scripts — all in your brand voice. Edit, approve, and schedule them directly to your content calendar.',
    screenshot: '/screenshots/solomarket_contentlab.png',
    icon: FlaskConical,
    color: 'bg-emerald-500',
    bullets: [
      'LinkedIn, email, blog, YouTube, Instagram',
      'Drafts in your brand voice and tone',
      'Schedule directly to your content calendar',
    ],
  },
  {
    number: 5,
    title: 'Track It All in Your Calendar',
    subtitle: 'Your full marketing schedule at a glance',
    description:
      'Every post, campaign milestone, and scheduled content piece lives in your SoloMarket calendar. See what\'s coming up, spot gaps in your schedule, and stay consistent — without juggling spreadsheets, Notion boards, or sticky notes.',
    screenshot: '/screenshots/solomarket_calendar.png',
    icon: Calendar,
    color: 'bg-indigo-500',
    bullets: [
      'Posts and campaigns in one unified calendar',
      'Filter by platform or campaign',
      'Delete, reschedule, or bulk-manage from one view',
    ],
  },
  {
    number: 6,
    title: 'Monitor Leads & Analytics',
    subtitle: 'Know what\'s working and who\'s watching',
    description:
      'Track your lead pipeline from Visitor → Subscriber → Lead → Customer. SoloMarket\'s analytics surface your top-performing content, lead sources, and campaign metrics so you can double down on what drives results and cut what doesn\'t.',
    screenshot: '/screenshots/solomarket_dashboard.png',
    icon: BarChart3,
    color: 'bg-pink-500',
    bullets: [
      'Lead pipeline with stage tracking',
      'Campaign and content performance metrics',
      'Filter by source, platform, or date range',
    ],
  },
];

const FEATURES = [
  { icon: Sparkles, label: 'AI Marketing Plans', desc: '30-day strategies built for your product and audience' },
  { icon: Megaphone, label: 'Campaign Systems', desc: 'Pre-built playbooks ready to install and execute' },
  { icon: FlaskConical, label: 'Content Lab', desc: 'AI-drafted posts, emails, and scripts in your voice' },
  { icon: Calendar, label: 'Content Calendar', desc: 'Your full schedule, organized and always visible' },
  { icon: Users, label: 'Lead Tracking', desc: 'Pipeline from visitor to paying customer' },
  { icon: Bot, label: 'AI Assistant', desc: 'Marketing strategy advice on demand' },
];

export function Demo() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-sm">S</div>
          <span className="font-bold text-lg">SoloMarket</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <Play size={12} />
          Product Walkthrough
        </div>
        <h1 className="text-4xl sm:text-6xl font-black mb-4 leading-tight">
          See SoloMarket<br />
          <span className="text-emerald-400">in Action</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          From zero to a fully running marketing campaign in under 5 minutes. Here's exactly how it works.
        </p>
      </div>

      {/* Video player */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <span className="ml-3 text-xs text-slate-600 font-mono">SoloMarket — Product Walkthrough</span>
          </div>
          <video
            controls
            poster="/screenshots/solomarket_dashboard.png"
            className="w-full"
            style={{ maxHeight: 480 }}
          >
            <source src="/demo/solomarket-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="text-center text-xs text-slate-600 mt-3">3-minute walkthrough · No signup required to watch</p>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <f.icon size={20} className="text-emerald-400 mb-2" />
              <div className="text-sm font-bold text-white mb-1">{f.label}</div>
              <div className="text-xs text-slate-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-step walkthrough */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-2xl sm:text-4xl font-black text-center mb-12">
          How It Works — Step by Step
        </h2>

        {/* Step tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {STEPS.map((s, i) => (
            <button
              key={s.number}
              onClick={() => setActiveStep(i)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeStep === i
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {s.number}
              </span>
              <span className="hidden sm:block">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Active step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {/* Info */}
            <div>
              <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center mb-5`}>
                <step.icon size={24} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Step {step.number} of {STEPS.length}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-2">{step.title}</h3>
              <p className="text-emerald-400 font-medium mb-4">{step.subtitle}</p>
              <p className="text-slate-400 leading-relaxed mb-6">{step.description}</p>
              <ul className="space-y-2">
                {step.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Prev / Next */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  type="button"
                  title="Previous step"
                  onClick={() => setActiveStep(i => Math.max(0, i - 1))}
                  disabled={activeStep === 0}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  title="Next step"
                  onClick={() => setActiveStep(i => Math.min(STEPS.length - 1, i + 1))}
                  disabled={activeStep === STEPS.length - 1}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
                {activeStep === STEPS.length - 1 && (
                  <button
                    onClick={() => navigate('/signup')}
                    className="ml-2 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-colors"
                  >
                    Start Free <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Screenshot */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-800">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="ml-3 text-xs text-slate-600 font-mono">solomarket.netlify.app</span>
              </div>
              <img
                src={step.screenshot}
                alt={step.title}
                className="w-full object-cover object-top"
                style={{ maxHeight: 380 }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="border-t border-slate-800 py-20 text-center px-6">
        <h2 className="text-3xl sm:text-5xl font-black mb-4">
          Ready to run your<br />marketing like a pro?
        </h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Get your first marketing system installed and your first AI plan generated — free, in under 5 minutes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl transition-colors"
          >
            Get Started Free
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 border border-slate-700 hover:border-slate-500 text-white font-bold text-lg rounded-2xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

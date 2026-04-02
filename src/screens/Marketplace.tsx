import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CheckCircle2, Zap, Crown, Building2, Star,
  ShoppingCart, Lock, Download, ArrowRight,
  FileText, Mail, MessageSquare, Globe, BarChart3, Sparkles
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

// ── Subscription Plans ────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: 'mo',
    tagline: 'Launch your marketing system',
    icon: Zap,
    color: 'border-slate-200',
    badgeColor: 'bg-slate-100 text-slate-700',
    ctaColor: 'bg-slate-900 hover:bg-slate-800 text-white',
    gumroadUrl: 'https://solomarket.gumroad.com/l/starter',
    features: [
      '1 active campaign system',
      '500 leads',
      'Basic analytics',
      'Systems library access',
      '5 AI content drafts/month',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 59,
    period: 'mo',
    tagline: 'Scale your campaigns',
    icon: Crown,
    color: 'border-emerald-400 ring-2 ring-emerald-400/30',
    badgeColor: 'bg-emerald-600 text-white',
    ctaColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    highlighted: true,
    gumroadUrl: 'https://solomarket.gumroad.com/l/growth',
    features: [
      'Unlimited campaign systems',
      '5,000 leads',
      'AI campaign generator',
      'Full analytics dashboard',
      'Automation workflows',
      'Content calendar',
      'Priority support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 249,
    period: 'mo',
    tagline: 'Manage multiple clients',
    icon: Building2,
    color: 'border-indigo-300',
    badgeColor: 'bg-indigo-600 text-white',
    ctaColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    gumroadUrl: 'https://solomarket.gumroad.com/l/agency',
    features: [
      '10 client workspaces',
      'Unlimited campaigns',
      'White-label reports',
      'Advanced analytics',
      'Client reporting dashboard',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
];

// ── Marketplace Products ──────────────────────────────────────────────────────
const MARKETPLACE_ITEMS = [
  {
    id: 'youtube-authority',
    name: 'YouTube Authority System',
    description: 'Grow your channel with optimized scripts, descriptions, and cross-promotion sequences.',
    category: 'Content',
    price: 29,
    icon: '🎥',
    color: 'bg-red-500',
    assets: ['5 video scripts', '10 video descriptions', '3 community posts', '1 channel trailer script'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/youtube-authority',
  },
  {
    id: 'email-monetization',
    name: 'Email Monetization Engine',
    description: 'Turn your email list into revenue with proven promotional and sales sequences.',
    category: 'Email',
    price: 39,
    icon: '💰',
    color: 'bg-amber-500',
    assets: ['7 promotional emails', '3 sales sequences', '2 re-engagement campaigns', '1 flash sale template'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/email-monetization',
  },
  {
    id: 'cold-email-system',
    name: 'Cold Email System',
    description: 'B2B outreach sequences that get replies without being spammy.',
    category: 'Outreach',
    price: 39,
    icon: '📬',
    color: 'bg-blue-500',
    assets: ['5-step cold email sequence', '3 follow-up scripts', '2 breakup emails', '1 referral ask template'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/cold-email-system',
  },
  {
    id: 'consulting-accelerator',
    name: 'Consulting Client Accelerator',
    description: 'Close higher-ticket consulting clients with professional proposals and follow-up systems.',
    category: 'Client Acquisition',
    price: 49,
    icon: '🤝',
    color: 'bg-purple-500',
    assets: ['2 proposal templates', '5 follow-up scripts', '1 pricing positioning guide', '3 case study templates'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/consulting-accelerator',
  },
  {
    id: 'course-launch-blueprint',
    name: 'Course Launch Blueprint',
    description: 'A complete pre-launch to post-launch marketing system for your online course.',
    category: 'Product Launch',
    price: 59,
    icon: '🎓',
    color: 'bg-orange-500',
    assets: ['10-email launch sequence', '6 social posts', '1 webinar invite sequence', '1 cart-close campaign'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/course-launch',
  },
  {
    id: 'instagram-growth',
    name: 'Instagram Growth Engine',
    description: 'Build a targeted Instagram following with reels scripts and engagement strategies.',
    category: 'Content',
    price: 29,
    icon: '📸',
    color: 'bg-pink-500',
    assets: ['10 reel scripts', '5 carousel captions', '3 story sequences', '1 collab outreach script'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/instagram-growth',
  },
  {
    id: 'podcast-growth',
    name: 'Podcast Growth System',
    description: 'Grow your podcast audience and attract guests with done-for-you scripts and templates.',
    category: 'Content',
    price: 29,
    icon: '🎙️',
    color: 'bg-teal-500',
    assets: ['5 episode show notes', '3 guest outreach scripts', '5 promotional posts', '1 listener survey template'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/podcast-growth',
  },
  {
    id: 'speaking-visibility',
    name: 'Speaking & Visibility Pack',
    description: 'Get booked for podcasts, stages, and media with professional pitch templates.',
    category: 'Authority Building',
    price: 29,
    icon: '🎤',
    color: 'bg-indigo-500',
    assets: ['1 speaker bio template', '3 podcast pitch scripts', '2 conference pitch templates', '1 press kit template'],
    gumroadUrl: 'https://solomarket.gumroad.com/l/speaking-visibility',
  },
];

const CATEGORIES = ['All', 'Content', 'Email', 'Outreach', 'Client Acquisition', 'Product Launch', 'Authority Building'];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Content: FileText,
  Email: Mail,
  Outreach: MessageSquare,
  'Client Acquisition': Star,
  'Product Launch': Zap,
  'Authority Building': Globe,
};

// ── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan }: { plan: typeof PLANS[0] }) {
  const Icon = plan.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-2xl border p-6 flex flex-col ${plan.color}`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlighted ? 'bg-emerald-100' : 'bg-slate-100'}`}>
          <Icon size={20} className={plan.highlighted ? 'text-emerald-600' : 'text-slate-600'} />
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${plan.badgeColor}`}>
          {plan.name}
        </span>
      </div>

      <div className="mb-1">
        <span className="text-3xl font-extrabold text-slate-900">${plan.price}</span>
        <span className="text-sm text-slate-400">/{plan.period}</span>
      </div>
      <p className="text-sm text-slate-500 mb-5">{plan.tagline}</p>

      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <a
        href={plan.gumroadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${plan.ctaColor}`}
      >
        <ShoppingCart size={15} />
        Get {plan.name}
        <ArrowRight size={14} />
      </a>
    </motion.div>
  );
}

// ── Marketplace Item Card ─────────────────────────────────────────────────────
function MarketplaceCard({ item }: { item: typeof MARKETPLACE_ITEMS[0] }) {
  const CategoryIcon = CATEGORY_ICONS[item.category] || BarChart3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl`}>
          {item.icon}
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold text-slate-900">${item.price}</div>
          <div className="text-[10px] text-slate-400">one-time</div>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
      <p className="text-sm text-slate-500 mb-3 leading-relaxed flex-1">{item.description}</p>

      <div className="flex items-center gap-1.5 mb-3">
        <CategoryIcon size={12} className="text-slate-400" />
        <span className="text-[11px] text-slate-400 font-medium">{item.category}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {item.assets.map(a => (
          <span key={a} className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            {a}
          </span>
        ))}
      </div>

      <a
        href={item.gumroadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm"
      >
        <Download size={14} />
        Buy & Install — ${item.price}
      </a>
    </motion.div>
  );
}

// ── Main Marketplace Screen ───────────────────────────────────────────────────
export function Marketplace() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All'
    ? MARKETPLACE_ITEMS
    : MARKETPLACE_ITEMS.filter(i => i.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Marketplace"
        subtitle="Upgrade your plan or add new campaign systems to your account."
      />

      {/* Subscription Plans */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Subscription Plans</h2>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          {PLANS.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          All plans include a 14-day free trial. Cancel anytime.
          Questions? <a href="mailto:ketorah.digital@gmail.com" className="text-emerald-600 hover:underline">Contact us</a>
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Add-on Systems</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Marketplace Items */}
      <section>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Campaign Systems</h2>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AI Generator CTA */}
        <div
          className="mb-6 flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl cursor-pointer hover:shadow-sm transition-all"
          onClick={() => navigate('/campaigns')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 text-sm">Want a custom system?</p>
            <p className="text-xs text-slate-500">Use the AI generator in Systems to build a campaign tailored to your exact business.</p>
          </div>
          <ArrowRight size={16} className="text-violet-400 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <MarketplaceCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Lock size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No items in this category yet.</p>
          </div>
        )}
      </section>

      {/* Footer note */}
      <div className="mt-10 text-center">
        <p className="text-xs text-slate-400">
          After purchase you'll receive an email with a download link.
          Campaign systems install directly into your SoloMarket account.
        </p>
      </div>
    </div>
  );
}

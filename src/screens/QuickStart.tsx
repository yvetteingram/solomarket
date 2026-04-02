import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  FlaskConical,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  ArrowRight,
  Sparkles,
  LogIn,
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Go to Plans',
    description:
      'Select your product, fill in your marketing goal, tone, and target audience, then hit "Generate Plan." The AI will create a full 30-day marketing strategy tailored to your business.',
    icon: Target,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    number: 2,
    title: 'Create Content in Content Lab',
    description:
      'Pick a product and platform (LinkedIn, Twitter, Email, or Blog), then generate an AI draft. You can edit it, save as a draft, publish, or schedule it for later.',
    icon: FlaskConical,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    number: 3,
    title: 'Launch a Campaign',
    description:
      'Browse the playbook templates — Product Launch, Content Series, Lead Magnet, and more. Pick one to create a campaign, then track its progress from the campaign drawer.',
    icon: Megaphone,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    number: 4,
    title: 'Track Your Leads',
    description:
      'View your leads as a table or kanban board. Filter by stage (Visitor, Subscriber, Lead, Customer) or search by email. Click any lead to see their details.',
    icon: Users,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    number: 5,
    title: 'Check Analytics',
    description:
      'See your content performance, campaign progress, lead sources, and conversion metrics — all in one place.',
    icon: BarChart3,
    color: 'bg-pink-50 text-pink-600 border-pink-100',
  },
  {
    number: 6,
    title: 'Set Up Your Profile',
    description:
      'Head to Settings to add your name, primary product, brand voice, and target audience. This helps the AI generate better, more personalized content.',
    icon: Settings,
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  },
];

export function QuickStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">SoloMarket</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            <Sparkles size={14} />
            <span>Quick Start Guide</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Welcome to SoloMarket
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            SoloMarket is your AI-powered marketing OS. Here's how to get the most out of it in just a few minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-5 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${step.color}`}
              >
                <step.icon size={22} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10">
          <h3 className="font-bold text-emerald-800 mb-3">Pro Tips</h3>
          <ul className="space-y-2 text-sm text-emerald-700">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
              <span>
                Start with <strong>Plans</strong> to generate a strategy, then move to <strong>Content Lab</strong> to create posts from it.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
              <span>
                Your <strong>Dashboard</strong> updates automatically as you create plans, content, and campaigns.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
              <span>
                Head to <strong>Settings</strong> first to set your brand voice — it makes all AI output more personalized.
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pb-12">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200"
          >
            <LogIn size={20} />
            Go to SoloMarket
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Send,
  FileText,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Target as TargetIcon
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { PlanWeek, Product } from '../types';
import { generateMarketingPlan } from '../services/geminiService';
import { apiFetch } from '../services/api';

export const Plans = () => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<PlanWeek[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [goal, setGoal] = useState('Lead Generation');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        if (data.length > 0) setSelectedProductId(data[0].id);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setError('Unable to load products.');
      });
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleGenerate = async () => {
    if (!selectedProduct) return;

    setGenerating(true);
    setError(null);
    try {
      const generatedPlan = await generateMarketingPlan(selectedProduct);

      const response = await apiFetch('/api/plans', {
        method: 'POST',
        body: JSON.stringify({
          product_id: selectedProductId,
          goal,
          channels: 'LinkedIn, Email',
          plan_json: generatedPlan
        })
      });

      if (!response.ok) throw new Error('Failed to save plan');
      setPlan(generatedPlan);
    } catch (err) {
      console.error('Failed to generate or save plan:', err);
      setError('Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Marketing Plans"
        subtitle="Create a structured 30-day strategy for your product."
        actions={
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedProduct}
            className="bg-brand text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand/90 transition-all disabled:opacity-50"
          >
            {generating ? <Sparkles className="animate-pulse" size={18} /> : <Plus size={18} />}
            <span>{generating ? 'Generating...' : 'New Plan'}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <SectionCard title="Product Details" description="Tell us what you're marketing.">
            <form className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                    <div className="px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-600">
                      {selectedProduct.product_type || selectedProduct.product_category || 'General'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price</label>
                    <div className="px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-600">
                      {selectedProduct.price || (selectedProduct.price_cents ? `$${(selectedProduct.price_cents / 100).toFixed(2)}` : 'N/A')}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Audience</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  placeholder="e.g. Solo Founders"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                >
                  <option>Lead Generation</option>
                  <option>Direct Sales</option>
                  <option>Brand Awareness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Marketing Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                >
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Bold</option>
                  <option>Educational</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !selectedProduct}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={18} />
                <span>{generating ? 'Generating...' : 'Generate 30-Day Plan'}</span>
              </button>
            </form>
          </SectionCard>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {!plan && !generating && (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No plans created yet</h3>
              <p className="text-slate-500 max-w-xs mt-2">Fill out the form to generate a structured 30-day marketing strategy.</p>
            </div>
          )}

          {generating && (
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
                  <div className="h-6 w-32 bg-slate-100 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-50 rounded" />
                    <div className="h-4 w-3/4 bg-slate-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {plan && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 size={20} />
                  <span className="font-medium text-sm">30-Day Plan Generated Successfully</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/campaigns')}
                    className="px-3 py-1.5 bg-white text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                  >
                    <Send size={14} />
                    <span>Send to Campaigns</span>
                  </button>
                  <button
                    onClick={() => navigate('/content')}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <FileText size={14} />
                    <span>Generate Content</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.map((week) => (
                  <div key={week.week} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand uppercase tracking-widest">Week {week.week}</span>
                      <span className="text-xs font-medium text-slate-500">{week.theme}</span>
                    </div>
                    <div className="p-6 flex-1 space-y-5">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Actions</h4>
                        <ul className="space-y-2">
                          {week.actions.map((action, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                              <ChevronRight size={14} className="mt-1 text-slate-300 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Content Prompts</h4>
                        <ul className="space-y-2">
                          {week.contentPrompts.map((prompt, idx) => (
                            <li key={idx} className="text-sm text-slate-600 italic flex items-start gap-2">
                              <Sparkles size={14} className="mt-1 text-brand/40 flex-shrink-0" />
                              <span>"{prompt}"</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand/10 rounded text-brand">
                          <TargetIcon size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Activity</span>
                          <span className="text-xs font-medium text-slate-900">{week.conversionActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

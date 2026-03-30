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
  Target as TargetIcon,
  Package,
  Trash2,
  Megaphone
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { PlanWeek, Product } from '../types';
import { generateMarketingPlan } from '../services/geminiService';
import { apiFetch } from '../services/api';

const detectCampaignType = (action: string): string => {
  const a = action.toLowerCase();
  if (a.includes('email') || a.includes('newsletter') || a.includes('inbox')) return 'Email Growth';
  if (a.includes('launch') || a.includes('product') || a.includes('release')) return 'Product Launch';
  if (a.includes('lead') || a.includes('magnet') || a.includes('capture') || a.includes('opt-in')) return 'Lead Generation';
  if (a.includes('authority') || a.includes('educate') || a.includes('teach') || a.includes('workshop')) return 'Authority Building';
  return 'General';
};

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
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // Inline add-product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductType, setNewProductType] = useState('digital');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  const fetchProducts = () => {
    apiFetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        if (data.length > 0 && !selectedProductId) setSelectedProductId(data[0].id);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
      });
  };

  const fetchPlans = () => {
    apiFetch('/api/plans')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setSavedPlans(Array.isArray(data) ? data : []);
        // Show the most recent plan if we have one and none is currently displayed
        if (Array.isArray(data) && data.length > 0 && !plan) {
          const latest = data[0];
          try {
            const weeks = typeof latest.plan_json === 'string' ? JSON.parse(latest.plan_json) : latest.plan_json;
            if (Array.isArray(weeks) && weeks.length > 0) setPlan(weeks);
          } catch { /* ignore */ }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProducts();
    fetchPlans();
  }, []);

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    setAddingProduct(true);
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProductName.trim(),
          description: newProductDesc.trim(),
          product_type: newProductType,
          price_cents: newProductPrice ? Math.round(parseFloat(newProductPrice) * 100) : 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to add product');
      const created = await res.json();
      setProducts(prev => [...prev, created]);
      setSelectedProductId(created.id);
      setNewProductName('');
      setNewProductDesc('');
      setNewProductType('digital');
      setNewProductPrice('');
      setShowAddProduct(false);
    } catch {
      setError('Failed to add product. Please try again.');
    } finally {
      setAddingProduct(false);
    }
  };

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
      fetchPlans();
    } catch (err: any) {
      console.error('Failed to generate or save plan:', err);
      setError(err?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Delete this marketing plan?')) return;
    setDeletingPlanId(planId);
    try {
      const res = await apiFetch(`/api/plans/${planId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete plan');
      setSavedPlans(prev => prev.filter(p => p.id !== planId));
      setPlan(null);
    } catch {
      setError('Failed to delete plan.');
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product? Any associated plans will remain.')) return;
    try {
      const res = await apiFetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== productId);
        if (selectedProductId === productId) {
          setSelectedProductId(updated.length > 0 ? updated[0].id : '');
        }
        return updated;
      });
    } catch {
      setError('Failed to delete product.');
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <SectionCard title="Product Details" description="Tell us what you're marketing.">
            <form className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Product</label>
                {products.length === 0 && !showAddProduct ? (
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(true)}
                    className="w-full px-3 py-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-brand hover:text-brand text-slate-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Package size={18} />
                    Add your first product to get started
                  </button>
                ) : !showAddProduct ? (
                  <div className="flex gap-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(true)}
                      className="px-3 py-2.5 rounded-lg border border-slate-200 hover:border-brand hover:text-brand text-slate-400 transition-colors"
                      title="Add new product"
                    >
                      <Plus size={18} />
                    </button>
                    {selectedProductId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(selectedProductId)}
                        className="px-3 py-2.5 rounded-lg border border-slate-200 hover:border-red-300 hover:text-red-500 text-slate-400 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ) : null}
              </div>

              {showAddProduct && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Package size={14} />
                    Add New Product
                  </h4>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Product name *"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <textarea
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    placeholder="Brief description..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 h-16 resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newProductType}
                      onChange={(e) => setNewProductType(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="digital">Digital Product</option>
                      <option value="course">Course</option>
                      <option value="ebook">E-book</option>
                      <option value="template">Template</option>
                      <option value="saas">SaaS</option>
                      <option value="service">Service</option>
                      <option value="membership">Membership</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="Price (USD)"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      disabled={!newProductName.trim() || addingProduct}
                      className="px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand/90 transition-colors disabled:opacity-50"
                    >
                      {addingProduct ? 'Adding...' : 'Add Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        setNewProductName('');
                        setNewProductDesc('');
                        setNewProductType('digital');
                        setNewProductPrice('');
                      }}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {selectedProduct && !showAddProduct && (
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
                  {savedPlans.length > 0 && (
                    <button
                      onClick={() => handleDeletePlan(savedPlans[0].id)}
                      disabled={deletingPlanId !== null}
                      className="px-3 py-1.5 bg-white text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>{deletingPlanId ? 'Deleting...' : 'Delete Plan'}</span>
                    </button>
                  )}
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
                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 group/action">
                              <ChevronRight size={14} className="mt-1 text-slate-300 flex-shrink-0" />
                              <span className="flex-1">{action}</span>
                              <button
                                onClick={() => navigate('/campaigns', { state: { name: action, type: detectCampaignType(action) } })}
                                title="Create campaign from this action"
                                className="opacity-0 group-hover/action:opacity-100 transition-opacity flex-shrink-0 p-1 rounded text-slate-400 hover:text-brand hover:bg-brand/10"
                              >
                                <Megaphone size={12} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Content Prompts</h4>
                        <ul className="space-y-2">
                          {week.contentPrompts.map((prompt, idx) => (
                            <li key={idx} className="text-sm text-slate-600 italic flex items-start gap-2 group/prompt">
                              <Sparkles size={14} className="mt-1 text-brand/40 flex-shrink-0" />
                              <span className="flex-1">"{prompt}"</span>
                              <button
                                onClick={() => navigate('/content', { state: { topic: prompt } })}
                                title="Draft this content"
                                className="opacity-0 group-hover/prompt:opacity-100 transition-opacity flex-shrink-0 p-1 rounded text-slate-400 hover:text-brand hover:bg-brand/10 not-italic"
                              >
                                <FileText size={12} />
                              </button>
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

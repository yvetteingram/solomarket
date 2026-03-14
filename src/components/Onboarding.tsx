import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  FlaskConical,
  Megaphone,
  ArrowRight,
  Sparkles,
  Package,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

interface OnboardingProps {
  hasProducts: boolean;
  hasPlans: boolean;
  hasPosts: boolean;
}

export const Onboarding = ({ hasProducts, hasPlans, hasPosts }: OnboardingProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Inline product creation
  const [showProductForm, setShowProductForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productType, setProductType] = useState('digital');
  const [productPrice, setProductPrice] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);
  const [productAdded, setProductAdded] = useState(hasProducts);
  const [productError, setProductError] = useState('');

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0]?.split(/[\._-]/)[0] || 'there';
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const handleAddProduct = async () => {
    if (!productName.trim()) return;
    setAddingProduct(true);
    setProductError('');
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: productName.trim(),
          description: productDesc.trim(),
          product_type: productType,
          price_cents: productPrice ? Math.round(parseFloat(productPrice) * 100) : 0,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      setProductAdded(true);
      setShowProductForm(false);
      setProductName('');
      setProductDesc('');
      setProductPrice('');
    } catch (err: any) {
      setProductError(err.message || 'Failed to add product. Please try again.');
    } finally {
      setAddingProduct(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Add a Product',
      description: 'Tell us what you\'re marketing — a course, template, SaaS, service, etc.',
      icon: Package,
      done: productAdded,
      action: () => setShowProductForm(true),
      color: 'bg-purple-50 text-purple-600'
    },
    {
      number: 2,
      title: 'Generate a Marketing Plan',
      description: 'AI creates a 30-day strategy tailored to your product and audience.',
      icon: Sparkles,
      done: hasPlans,
      action: () => navigate('/plans'),
      color: 'bg-blue-50 text-blue-600'
    },
    {
      number: 3,
      title: 'Create Content',
      description: 'Generate LinkedIn posts, emails, blog outlines, and more with AI.',
      icon: FlaskConical,
      done: hasPosts,
      action: () => navigate('/content'),
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      number: 4,
      title: 'Launch a Campaign',
      description: 'Pick a playbook and start executing your marketing strategy.',
      icon: Megaphone,
      done: false,
      action: () => navigate('/campaigns'),
      color: 'bg-orange-50 text-orange-600'
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} />
          <span>Welcome to the Beta</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Hey {capitalizedName}, let's get you set up
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Complete these steps to unlock the full power of your marketing OS.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Setup Progress</span>
          <span>{completedCount} of {steps.length} complete</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number}>
            <div
              className={`flex items-center gap-5 p-5 rounded-2xl border transition-all ${
                step.done
                  ? 'bg-slate-50 border-slate-100 opacity-60'
                  : 'bg-white border-slate-200 shadow-sm hover:border-brand/20'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                step.done ? 'bg-emerald-50 text-emerald-600' : step.color
              }`}>
                {step.done ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <step.icon size={24} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${step.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
              </div>

              {!step.done && step.action && (
                <button
                  onClick={step.action}
                  className="px-4 py-2 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand/90 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <span>Start</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {step.done && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg flex-shrink-0">
                  Done
                </span>
              )}
            </div>

            {/* Inline product form — shows below step 1 */}
            {step.number === 1 && showProductForm && !productAdded && (
              <div className="mt-2 ml-17 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Target size={16} className="text-purple-500" />
                  What are you selling?
                </h4>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product name *"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
                <textarea
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Brief description (optional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 h-20 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="Price (USD)"
                    className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                {productError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{productError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAddProduct}
                    disabled={!productName.trim() || addingProduct}
                    className="px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {addingProduct ? 'Adding...' : 'Add Product'}
                  </button>
                  <button
                    onClick={() => { setShowProductForm(false); setProductName(''); setProductDesc(''); setProductPrice(''); }}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Skip option */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
        >
          Skip for now — go to Dashboard
        </button>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import {
  Save,
  Linkedin,
  Twitter,
  Globe,
  LogOut,
  Plus,
  Trash2,
  Package,
  Camera,
  Users,
  Play,
  Video,
  MapPin,
  MessageCircle,
  Pencil,
  Zap,
  Crown,
  Building2,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { supabase } from '../services/supabase';

interface UserSettings {
  full_name: string;
  primary_product: string;
  brand_voice: string;
  target_audience: string;
  avatar_url: string;
}

// ── Plan config ──────────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  free: {
    label: 'Free',
    icon: Zap,
    color: 'bg-slate-100 text-slate-600',
    upgrades: [
      { name: 'Starter', price: '$29/mo', url: 'https://ketorahdigital.gumroad.com/l/starter', color: 'bg-slate-900 hover:bg-slate-800 text-white' },
      { name: 'Growth', price: '$59/mo', url: 'https://ketorahdigital.gumroad.com/l/growth', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
      { name: 'Agency', price: '$249/mo', url: 'https://ketorahdigital.gumroad.com/l/agency', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    ],
  },
  starter: {
    label: 'Starter',
    icon: Zap,
    color: 'bg-slate-100 text-slate-700',
    upgrades: [
      { name: 'Growth', price: '$59/mo', url: 'https://ketorahdigital.gumroad.com/l/growth', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
      { name: 'Agency', price: '$249/mo', url: 'https://ketorahdigital.gumroad.com/l/agency', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    ],
  },
  growth: {
    label: 'Growth',
    icon: Crown,
    color: 'bg-emerald-100 text-emerald-700',
    upgrades: [
      { name: 'Agency', price: '$249/mo', url: 'https://ketorahdigital.gumroad.com/l/agency', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    ],
  },
  agency: {
    label: 'Agency',
    icon: Building2,
    color: 'bg-indigo-100 text-indigo-700',
    upgrades: [],
  },
  pro: {
    label: 'Pro',
    icon: Crown,
    color: 'bg-emerald-100 text-emerald-700',
    upgrades: [
      { name: 'Agency', price: '$249/mo', url: 'https://ketorahdigital.gumroad.com/l/agency', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    ],
  },
  founder: {
    label: 'Founder',
    icon: Crown,
    color: 'bg-amber-100 text-amber-700',
    upgrades: [],
  },
};

const BillingSection = ({ plan }: { plan: string }) => {
  const key = (plan in PLAN_CONFIG ? plan : 'free') as keyof typeof PLAN_CONFIG;
  const config = PLAN_CONFIG[key];
  const PlanIcon = config.icon;

  return (
    <SectionCard title="Subscription & Billing" description="Your current plan and upgrade options.">
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${config.color}`}>
          <PlanIcon size={15} />
          {config.label} Plan
        </div>
        {key !== 'free' && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 size={13} />
            Active
          </span>
        )}
      </div>

      {config.upgrades.length > 0 && (
        <div className="space-y-2 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {plan === 'free' ? 'Choose a plan' : 'Upgrade to'}
          </p>
          {config.upgrades.map(u => (
            <a
              key={u.name}
              href={u.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-sm transition-all ${u.color}`}
            >
              <span>{u.name} — {u.price}</span>
              <ArrowRight size={15} />
            </a>
          ))}
        </div>
      )}

      {(key === 'agency' || key === 'founder') && (
        <p className="text-sm text-slate-500 mb-5">You're on the highest plan — all features unlocked.</p>
      )}

      {key !== 'free' && (
        <>
          <a
            href="https://app.gumroad.com/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ExternalLink size={12} />
            Manage or cancel subscription on Gumroad
          </a>
          {config.upgrades.length > 0 && (
            <p className="text-[11px] text-slate-400 mt-3">
              To upgrade: cancel your current plan on Gumroad, then purchase the new plan above.
            </p>
          )}
        </>
      )}
    </SectionCard>
  );
}

export const Settings = () => {
  const { user, plan, signOut } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    full_name: '',
    primary_product: '',
    brand_voice: '',
    target_audience: '',
    avatar_url: ''
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<{ id: string; name: string; description: string; product_type: string; price_cents: number }[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', product_type: 'digital', price: '' });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState({ name: '', description: '', product_type: 'digital', price: '' });

  useEffect(() => {
    apiFetch('/api/settings')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setSettings({
          full_name: data.full_name || user?.user_metadata?.full_name || '',
          primary_product: data.primary_product || '',
          brand_voice: data.brand_voice || '',
          target_audience: data.target_audience || '',
          avatar_url: data.avatar_url || ''
        });
      })
      .catch(() => {
        setSettings(prev => ({
          ...prev,
          full_name: user?.user_metadata?.full_name || ''
        }));
      })
      .finally(() => setLoading(false));

    apiFetch('/api/products')
      .then(res => res.ok ? res.json() : [])
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user?.id]);

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return;
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          product_type: newProduct.product_type,
          price_cents: newProduct.price ? Math.round(parseFloat(newProduct.price) * 100) : 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to add product');
      const created = await res.json();
      setProducts(prev => [...prev, created]);
      setNewProduct({ name: '', description: '', product_type: 'digital', price: '' });
      setShowAddProduct(false);
    } catch {
      setError('Failed to add product. Please try again.');
    }
  };

  const startEditProduct = (product: { id: string; name: string; description: string; product_type: string; price_cents: number }) => {
    setEditingProductId(product.id);
    setEditProduct({
      name: product.name,
      description: product.description || '',
      product_type: product.product_type,
      price: product.price_cents > 0 ? (product.price_cents / 100).toFixed(2) : ''
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId || !editProduct.name.trim()) return;
    try {
      const res = await apiFetch(`/api/products/${editingProductId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editProduct.name.trim(),
          description: editProduct.description.trim(),
          product_type: editProduct.product_type,
          price_cents: editProduct.price ? Math.round(parseFloat(editProduct.price) * 100) : 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === editingProductId ? updated : p));
      setEditingProductId(null);
    } catch {
      setError('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product? Plans and content linked to it will remain.')) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete product.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save');
      const saved_data = await res.json();
      setSettings(prev => ({ ...prev, ...saved_data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UserSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !supabase) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      updateField('avatar_url', urlData.publicUrl);
    } catch {
      setError('Failed to upload avatar. Make sure the avatars bucket exists in Supabase Storage.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const initials = (settings.full_name || user?.email || 'U')
    .split(/[\s@]/)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, product defaults, and connected channels."
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => signOut()}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium">
          Settings saved successfully.
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Section */}
        <SectionCard title="Profile & Account" description="Your personal information and subscription.">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              {settings.avatar_url ? (
                <img
                  src={settings.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                title="Change avatar"
                className="absolute inset-0 rounded-2xl bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera size={20} />
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-sm font-semibold text-brand hover:text-brand/80 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? 'Uploading...' : 'Upload photo'}
              </button>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF · max 2MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <input
                type="text"
                value={settings.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 outline-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* Subscription & Billing */}
        <BillingSection plan={plan} />

        {/* Your Products */}
        <SectionCard title="Your Products" description="Add the products you want to market. These appear in Plans and Content Lab.">
          <div className="space-y-3">
            {products.length === 0 && !showAddProduct && (
              <div className="text-center py-8 text-slate-400">
                <Package size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No products yet</p>
                <p className="text-xs mt-1">Add your first product to start generating plans and content.</p>
              </div>
            )}

            {products.map((product) => (
              <div key={product.id}>
                {editingProductId === product.id ? (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Product Name *</label>
                      <input
                        type="text"
                        value={editProduct.name}
                        onChange={(e) => setEditProduct(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                      <textarea
                        value={editProduct.description}
                        onChange={(e) => setEditProduct(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 h-20 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                        <select
                          value={editProduct.product_type}
                          onChange={(e) => setEditProduct(p => ({ ...p, product_type: e.target.value }))}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
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
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editProduct.price}
                          onChange={(e) => setEditProduct(p => ({ ...p, price: e.target.value }))}
                          placeholder="0.00"
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleUpdateProduct}
                        disabled={!editProduct.name.trim()}
                        className="px-5 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingProductId(null)}
                        className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Package size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                        <p className="text-[10px] text-slate-400">
                          {product.product_type} {product.price_cents > 0 ? `· $${(product.price_cents / 100).toFixed(2)}` : '· Free'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditProduct(product)}
                        className="p-2 text-slate-300 hover:text-brand transition-colors"
                        title="Edit product"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {showAddProduct && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. My Online Course"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
                    placeholder="Briefly describe what this product does..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 h-20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                    <select
                      value={newProduct.product_type}
                      onChange={(e) => setNewProduct(p => ({ ...p, product_type: e.target.value }))}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
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
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAddProduct}
                    disabled={!newProduct.name.trim()}
                    className="px-5 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors disabled:opacity-50"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProduct(false);
                      setNewProduct({ name: '', description: '', product_type: 'digital', price: '' });
                    }}
                    className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!showAddProduct && (
              <button
                onClick={() => setShowAddProduct(true)}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-400 hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Product
              </button>
            )}
          </div>
        </SectionCard>

        {/* Product Defaults */}
        <SectionCard title="Product Defaults" description="Default settings for your marketing plans and AI generations.">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Primary Product Name</label>
              <input
                type="text"
                value={settings.primary_product}
                onChange={(e) => updateField('primary_product', e.target.value)}
                placeholder="e.g. SoloMarket"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Brand Voice / Tone</label>
              <textarea
                value={settings.brand_voice}
                onChange={(e) => updateField('brand_voice', e.target.value)}
                placeholder="Describe your brand's tone and voice..."
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Audience Description</label>
              <textarea
                value={settings.target_audience}
                onChange={(e) => updateField('target_audience', e.target.value)}
                placeholder="Describe who your product is for..."
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 h-24 resize-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* Connected Channels */}
        <SectionCard title="Connected Channels" description="Where your content gets published.">
          <div className="space-y-4">
            {[
              { name: 'LinkedIn', icon: Linkedin, status: 'Copy & Share', enabled: true, color: 'text-blue-600' },
              { name: 'Twitter / X', icon: Twitter, status: 'Copy & Share', enabled: true, color: 'text-sky-500' },
              { name: 'Facebook', icon: Users, status: 'Copy & Share', enabled: true, color: 'text-blue-500' },
              { name: 'Instagram', icon: Camera, status: 'Copy & Share', enabled: true, color: 'text-pink-500' },
              { name: 'YouTube', icon: Play, status: 'Copy & Share', enabled: true, color: 'text-red-500' },
              { name: 'TikTok', icon: Video, status: 'Copy & Share', enabled: true, color: 'text-slate-900' },
              { name: 'Pinterest', icon: MapPin, status: 'Copy & Share', enabled: true, color: 'text-red-600' },
              { name: 'Threads', icon: MessageCircle, status: 'Copy & Share', enabled: true, color: 'text-slate-700' },
              { name: 'Substack', icon: Globe, status: 'Copy & Share', enabled: true, color: 'text-orange-500' },
            ].map((channel) => (
              <div key={channel.name} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 bg-slate-50 rounded-lg ${channel.color}`}>
                    <channel.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{channel.name}</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${channel.enabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {channel.status}
                    </p>
                  </div>
                </div>
                {channel.enabled ? (
                  <span className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600">
                    Copy &amp; Share
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-400">
                    Coming Soon
                  </span>
                )}
              </div>
            ))}
            <p className="text-xs text-slate-400 text-center pt-2">
              Active channels use Copy & Share — content is copied to your clipboard and the platform opens in a new tab.
            </p>
          </div>
        </SectionCard>

        {/* Danger Zone */}
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
          <h4 className="text-sm font-bold text-rose-900">Danger Zone</h4>
          <p className="text-xs text-rose-600 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                signOut();
              }
            }}
            className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Save,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  LogOut
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

interface UserSettings {
  full_name: string;
  primary_product: string;
  brand_voice: string;
  target_audience: string;
}

export const Settings = () => {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    full_name: '',
    primary_product: '',
    brand_voice: '',
    target_audience: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/settings')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setSettings({
          full_name: data.full_name || user?.user_metadata?.full_name || '',
          primary_product: data.primary_product || '',
          brand_voice: data.brand_voice || '',
          target_audience: data.target_audience || ''
        });
      })
      .catch(() => {
        // Use defaults from user metadata
        setSettings(prev => ({
          ...prev,
          full_name: user?.user_metadata?.full_name || ''
        }));
      })
      .finally(() => setLoading(false));
  }, [user]);

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
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">
              {initials}
            </div>
            <div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Change Avatar
              </button>
              <p className="text-xs text-slate-400 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
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
              { name: 'LinkedIn', icon: Linkedin, status: 'Coming Soon', color: 'text-blue-600' },
              { name: 'Twitter / X', icon: Twitter, status: 'Coming Soon', color: 'text-sky-500' },
              { name: 'Email (Mailchimp)', icon: Mail, status: 'Coming Soon', color: 'text-slate-400' },
              { name: 'Personal Blog', icon: Globe, status: 'Coming Soon', color: 'text-slate-400' },
            ].map((channel) => (
              <div key={channel.name} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 bg-slate-50 rounded-lg ${channel.color}`}>
                    <channel.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{channel.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {channel.status}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-colors bg-slate-100 text-slate-400 cursor-not-allowed" disabled>
                  Coming Soon
                </button>
              </div>
            ))}
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

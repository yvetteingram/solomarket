import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download, CheckCircle2, ChevronRight, X, Loader2,
  Play, Pause, Trash2, BarChart3, Zap, FileText,
  Mail, MessageSquare, ClipboardList, Globe, Users,
  ArrowRight, ChevronDown, ChevronUp, Sparkles, Wand2
} from 'lucide-react';
import { generateCampaignSystem } from '../services/geminiService';
import { apiFetch } from '../services/api';
import { Campaign, CampaignAsset, CampaignTemplate, Product } from '../types';
import {
  CAMPAIGN_TEMPLATES,
  TEMPLATE_COLORS,
  TEMPLATE_ICONS,
  installCampaign,
  getTemplateById
} from '../services/campaignInstaller';
import { PageHeader } from '../components/PageHeader';

// ── Asset type metadata ──────────────────────────────────────────────────────
const ASSET_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  linkedin_post:    { label: 'LinkedIn Post',    icon: FileText,      color: 'text-blue-600 bg-blue-50' },
  outreach_script:  { label: 'Outreach Script',  icon: MessageSquare, color: 'text-indigo-600 bg-indigo-50' },
  email:            { label: 'Email',             icon: Mail,          color: 'text-purple-600 bg-purple-50' },
  lead_form:        { label: 'Lead Form',         icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50' },
  landing_page_copy:{ label: 'Page Copy',         icon: Globe,         color: 'text-orange-600 bg-orange-50' },
  follow_up:        { label: 'Follow-up',         icon: MessageSquare, color: 'text-pink-600 bg-pink-50' },
  social_post:      { label: 'Social Post',       icon: FileText,      color: 'text-sky-600 bg-sky-50' },
};

function assetIcon(type: string) {
  return ASSET_META[type] ?? { label: type, icon: FileText, color: 'text-slate-600 bg-slate-100' };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status: Campaign['status']) {
  const map = {
    active:    'bg-emerald-100 text-emerald-700',
    paused:    'bg-amber-100 text-amber-700',
    completed: 'bg-blue-100 text-blue-700',
    draft:     'bg-slate-100 text-slate-600',
  };
  return map[status] ?? map.draft;
}

// ── Template Library Card ────────────────────────────────────────────────────
function TemplateCard({
  template,
  installed,
  onInstall,
  onView,
}: {
  template: CampaignTemplate;
  installed: Campaign | undefined;
  onInstall: (t: CampaignTemplate) => void;
  onView: (c: Campaign) => void;
}) {
  const colors = TEMPLATE_COLORS[template.color] ?? TEMPLATE_COLORS.blue;
  const emoji = TEMPLATE_ICONS[template.id] ?? '📦';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
    >
      {/* Icon + category */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center text-2xl`}>
          {emoji}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${colors.bg} ${colors.text}`}>
          {template.category}
        </span>
      </div>

      {/* Name + description */}
      <h3 className="font-bold text-slate-900 text-base mb-1">{template.name}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{template.description}</p>

      {/* Outcome */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${colors.bg} mb-4`}>
        <BarChart3 size={13} className={colors.text} />
        <span className={`text-xs font-semibold ${colors.text}`}>{template.outcome}</span>
      </div>

      {/* Asset summary */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {template.assetSummary.map((item) => (
          <span key={item} className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
            {item}
          </span>
        ))}
      </div>

      {/* Duration */}
      <p className="text-xs text-slate-400 mb-4">
        <span className="font-medium text-slate-500">{template.estimatedDuration}</span> campaign
      </p>

      {/* CTA */}
      {installed ? (
        <button
          onClick={() => onView(installed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
        >
          <CheckCircle2 size={16} className="text-emerald-600" />
          Installed — View System
          <ChevronRight size={14} />
        </button>
      ) : (
        <button
          onClick={() => onInstall(template)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${colors.icon} hover:opacity-90 text-white font-semibold rounded-xl transition-all text-sm shadow-sm`}
        >
          <Download size={15} />
          Install System
        </button>
      )}
    </motion.div>
  );
}

// ── Installed Campaign Card ──────────────────────────────────────────────────
function InstalledCard({
  campaign,
  onClick,
}: {
  campaign: Campaign;
  onClick: () => void;
}) {
  const template = getTemplateById(campaign.type);
  const colors = template ? TEMPLATE_COLORS[template.color] ?? TEMPLATE_COLORS.blue : TEMPLATE_COLORS.blue;
  const emoji = template ? TEMPLATE_ICONS[template.id] ?? '📦' : '📦';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-slate-900 truncate">{campaign.name}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md flex-shrink-0 ${statusBadge(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.icon} opacity-80 rounded-full transition-all`}
                style={{ width: `${campaign.progress || 0}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 flex-shrink-0">{campaign.progress || 0}%</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
      </div>
    </motion.div>
  );
}

// ── Asset Row (in drawer) ────────────────────────────────────────────────────
function AssetRow({ asset }: { asset: CampaignAsset }) {
  const [expanded, setExpanded] = useState(false);
  const meta = assetIcon(asset.asset_type);
  const Icon = meta.icon;

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
          <Icon size={14} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{asset.title}</p>
          <p className="text-[11px] text-slate-400">{meta.label}</p>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto border border-slate-100">
            {asset.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Install Modal ────────────────────────────────────────────────────────────
function InstallModal({
  template,
  products,
  onConfirm,
  onClose,
  installing,
}: {
  template: CampaignTemplate;
  products: Product[];
  onConfirm: (productId: string | null) => void;
  onClose: () => void;
  installing: boolean;
}) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const colors = TEMPLATE_COLORS[template.color] ?? TEMPLATE_COLORS.blue;
  const emoji = TEMPLATE_ICONS[template.id] ?? '📦';

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[80]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[90] p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 ${colors.icon} rounded-xl flex items-center justify-center text-2xl`}>
              {emoji}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Install System</h3>
              <p className="text-sm text-slate-500">{template.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* What's included */}
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">What's included</p>
        <ul className="space-y-1.5 mb-5">
          {template.assetSummary.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              {item}
            </li>
          ))}
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <Zap size={14} className="text-amber-500 flex-shrink-0" />
            {template.automation.length} automation rule{template.automation.length !== 1 ? 's' : ''}
          </li>
        </ul>

        {/* Product selector */}
        {products.length > 0 && (
          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Link to product (optional)
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">No product selected</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Outcome */}
        <div className={`flex items-center gap-2 px-3 py-2.5 ${colors.bg} rounded-xl mb-5`}>
          <BarChart3 size={14} className={colors.text} />
          <span className={`text-xs font-semibold ${colors.text}`}>Expected outcome: {template.outcome}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={installing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedProduct || null)}
            disabled={installing}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${colors.icon} text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60`}
          >
            {installing ? (
              <><Loader2 size={15} className="animate-spin" /> Installing…</>
            ) : (
              <><Download size={15} /> Install Now</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Detail Drawer ────────────────────────────────────────────────────────────
function SystemDrawer({
  campaign,
  assets,
  loadingAssets,
  onClose,
  onDelete,
  onUpdateStatus,
  onUpdateProgress,
}: {
  campaign: Campaign;
  assets: CampaignAsset[];
  loadingAssets: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Campaign['status']) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}) {
  const navigate = useNavigate();
  const template = getTemplateById(campaign.type);
  const colors = template ? TEMPLATE_COLORS[template.color] ?? TEMPLATE_COLORS.blue : TEMPLATE_COLORS.blue;
  const emoji = template ? TEMPLATE_ICONS[campaign.type] ?? '📦' : '📦';
  const [progress, setProgress] = useState(campaign.progress || 0);

  const assetsByType = assets.reduce<Record<string, CampaignAsset[]>>((acc, a) => {
    (acc[a.asset_type] = acc[a.asset_type] || []).push(a);
    return acc;
  }, {});

  const assetTypeOrder = ['linkedin_post', 'social_post', 'email', 'outreach_script', 'follow_up', 'lead_form', 'landing_page_copy'];
  const sortedTypes = [
    ...assetTypeOrder.filter(t => assetsByType[t]),
    ...Object.keys(assetsByType).filter(t => !assetTypeOrder.includes(t)),
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-full max-w-lg bg-white shadow-2xl z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 ${colors.icon} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>{emoji}</div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 truncate text-sm">{campaign.name}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>{template?.category ?? campaign.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status + progress */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase ${statusBadge(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                <span className="text-xs font-bold text-slate-700">{progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                onMouseUp={() => onUpdateProgress(campaign.id, progress)}
                onTouchEnd={() => onUpdateProgress(campaign.id, progress)}
                className="w-full h-1.5 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Automation rules */}
          {template && template.automation.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Zap size={12} /> Automation Flow
              </p>
              <div className="space-y-2">
                {template.automation.map((rule, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs">
                    <p className="font-semibold text-amber-800">{rule.trigger}</p>
                    <p className="text-amber-700">→ {rule.action}</p>
                    <p className="text-amber-600">→ {rule.followUp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Assets */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText size={12} /> Campaign Assets ({assets.length})
            </p>
            {loadingAssets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-slate-300" />
              </div>
            ) : assets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No assets found — try reinstalling.</p>
            ) : (
              <div className="space-y-2">
                {sortedTypes.map((type) =>
                  assetsByType[type].map((asset) => (
                    <AssetRow key={asset.id} asset={asset} />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Next steps */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Next Steps</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/content', { state: { topic: `${campaign.name} content` } })}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left group"
              >
                <FileText size={16} className="text-slate-400 group-hover:text-emerald-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Create Campaign Content</p>
                  <p className="text-xs text-slate-400">Generate posts and copy in Content Lab</p>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
              </button>
              <button
                onClick={() => navigate('/leads')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
              >
                <Users size={16} className="text-slate-400 group-hover:text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">View Your Leads</p>
                  <p className="text-xs text-slate-400">Track who's coming through this system</p>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          {campaign.status === 'active' ? (
            <button
              onClick={() => onUpdateStatus(campaign.id, 'paused')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Pause size={14} /> Pause
            </button>
          ) : campaign.status === 'paused' ? (
            <button
              onClick={() => onUpdateStatus(campaign.id, 'active')}
              className="flex items-center gap-2 px-4 py-2 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <Play size={14} /> Reactivate
            </button>
          ) : null}
          <div className="flex-1" />
          <button
            onClick={() => onDelete(campaign.id)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Systems Screen ──────────────────────────────────────────────────────
export function Systems() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [assets, setAssets] = useState<CampaignAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [loading, setLoading] = useState(true);
  const [installTarget, setInstallTarget] = useState<CampaignTemplate | null>(null);
  const [installing, setInstalling] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // AI generator state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    const res = await apiFetch('/api/campaigns');
    if (res.ok) setCampaigns(await res.json());
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/campaigns').then(r => r.ok ? r.json() : []),
      apiFetch('/api/products').then(r => r.ok ? r.json() : []),
    ]).then(([c, p]) => {
      setCampaigns(c);
      setProducts(p);
    }).finally(() => setLoading(false));
  }, []);

  const openDrawer = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setLoadingAssets(true);
    setAssets([]);
    try {
      const res = await apiFetch(`/api/campaign-assets?campaign_id=${campaign.id}`);
      if (res.ok) setAssets(await res.json());
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleInstallConfirm = async (productId: string | null) => {
    if (!installTarget) return;
    setInstalling(true);
    try {
      const { campaignId } = await installCampaign(installTarget, productId);
      setInstallTarget(null);
      setSuccessId(campaignId);
      await fetchCampaigns();
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setInstalling(false);
    }
  };

  const handleDelete = async (id: string) => {
    await apiFetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    setSelectedCampaign(null);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiError(null);
    try {
      const generated = await generateCampaignSystem(aiPrompt.trim());

      // Create the campaign record
      const campaignRes = await apiFetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generated.name,
          type: `ai-${Date.now()}`,
          status: 'active',
          progress: 0,
          product_id: null,
        }),
      });

      if (!campaignRes.ok) throw new Error('Failed to create campaign');
      const campaign = await campaignRes.json();

      // Save all generated assets
      await Promise.all(
        generated.assets.map(asset =>
          apiFetch('/api/campaign-assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaign_id: campaign.id,
              asset_type: asset.type,
              title: asset.title,
              content: asset.content,
              order_index: asset.order_index,
            }),
          }).catch(() => null)
        )
      );

      setAiModalOpen(false);
      setAiPrompt('');
      setSuccessId(campaign.id);
      setTimeout(() => setSuccessId(null), 4000);
      await fetchCampaigns();
    } catch (err: any) {
      setAiError(err.message || 'Generation failed — please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Campaign['status']) => {
    const res = await apiFetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
      setSelectedCampaign(updated);
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    const res = await apiFetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  // Map installed campaigns by template id
  const installedByType = campaigns.reduce<Record<string, Campaign>>((acc, c) => {
    acc[c.type] = c;
    return acc;
  }, {});

  const installedCampaigns = campaigns.filter(c =>
    CAMPAIGN_TEMPLATES.some(t => t.id === c.type)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Marketing Systems"
        subtitle="Install a complete marketing system and launch your campaigns in minutes."
      />

      {/* Success toast */}
      <AnimatePresence>
        {successId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800"
          >
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span><strong>System installed!</strong> Your campaign and all assets are ready.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Installed Systems */}
      {installedCampaigns.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
            Your Installed Systems ({installedCampaigns.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {installedCampaigns.map(c => (
              <InstalledCard key={c.id} campaign={c} onClick={() => openDrawer(c)} />
            ))}
          </div>
        </div>
      )}

      {/* Template Library */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
          Available Systems
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAMPAIGN_TEMPLATES.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              installed={installedByType[template.id]}
              onInstall={setInstallTarget}
              onView={openDrawer}
            />
          ))}

          {/* AI Generate Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 flex flex-col text-white cursor-pointer hover:shadow-xl hover:shadow-violet-200 transition-all"
            onClick={() => setAiModalOpen(true)}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-base mb-1">Generate Custom System</h3>
            <p className="text-sm text-violet-100 leading-relaxed mb-4 flex-1">
              Describe your business and goal — AI builds a complete marketing system tailored to you.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {['3 posts', '2 scripts', '2 emails', '1 lead form'].map(a => (
                <span key={a} className="text-[11px] bg-white/15 text-white px-2 py-0.5 rounded-md">{a}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white text-violet-700 font-bold rounded-xl px-4 py-2.5 text-sm w-full justify-center hover:bg-violet-50 transition-colors">
              <Wand2 size={15} />
              Generate with AI
            </div>
          </motion.div>
        </div>
      </div>

      {/* Install Modal */}
      <AnimatePresence>
        {installTarget && (
          <InstallModal
            template={installTarget}
            products={products}
            onConfirm={handleInstallConfirm}
            onClose={() => !installing && setInstallTarget(null)}
            installing={installing}
          />
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {aiModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
              onClick={() => !aiGenerating && setAiModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[90] p-6"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Generate Custom System</h3>
                    <p className="text-xs text-slate-500">AI builds a full campaign tailored to your business</p>
                  </div>
                </div>
                <button onClick={() => setAiModalOpen(false)} disabled={aiGenerating} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Describe your business and goal
              </label>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                disabled={aiGenerating}
                rows={4}
                placeholder={"e.g. I'm a freelance UX designer looking to attract 3-5 new client inquiries per month using LinkedIn content and cold outreach"}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 disabled:bg-slate-50 mb-2"
              />
              <p className="text-xs text-slate-400 mb-5">
                Be specific: mention your role, target client, and what success looks like.
              </p>

              {/* Example prompts */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  "Freelance copywriter attracting B2B SaaS clients",
                  "Online course creator growing email list",
                  "Marketing consultant launching a new service",
                ].map(example => (
                  <button
                    key={example}
                    onClick={() => setAiPrompt(example)}
                    disabled={aiGenerating}
                    className="text-[11px] px-2.5 py-1 bg-violet-50 text-violet-700 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors disabled:opacity-50"
                  >
                    {example}
                  </button>
                ))}
              </div>

              {aiError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                  <X size={14} className="flex-shrink-0" />
                  {aiError}
                </div>
              )}

              {aiGenerating && (
                <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 rounded-xl mb-4">
                  <Loader2 size={16} className="animate-spin text-violet-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-violet-800">Generating your campaign system…</p>
                    <p className="text-xs text-violet-500">Creating posts, scripts, and emails tailored to your business</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setAiModalOpen(false)}
                  disabled={aiGenerating}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <><Loader2 size={15} className="animate-spin" /> Generating…</>
                  ) : (
                    <><Wand2 size={15} /> Generate System</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedCampaign && (
          <SystemDrawer
            campaign={selectedCampaign}
            assets={assets}
            loadingAssets={loadingAssets}
            onClose={() => setSelectedCampaign(null)}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

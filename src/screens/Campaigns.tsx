import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  ChevronRight,
  Rocket,
  Target,
  Users,
  TrendingUp,
  X,
  FileText
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { Campaign } from '../types';
import { apiFetch } from '../services/api';

interface PlaybookCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

const PlaybookCard = ({ title, description, icon: Icon, color, onClick }: PlaybookCardProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl hover:border-brand/30 hover:shadow-md transition-all text-left group"
  >
    <div className={`p-3 rounded-xl mb-4 ${color}`}>
      <Icon size={24} />
    </div>
    <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    <div className="mt-4 flex items-center gap-1 text-brand text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
      <span>Use Playbook</span>
      <ChevronRight size={14} />
    </div>
  </button>
);

export const Campaigns = () => {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiFetch('/api/campaigns')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load campaigns');
        return res.json();
      })
      .then(data => {
        setCampaigns(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch campaigns:', err);
        setError('Unable to load campaigns.');
        setLoading(false);
      });
  }, []);

  const openDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDrawerOpen(true);
  };

  const deleteCampaign = async (id: string) => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      const res = await apiFetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setIsDrawerOpen(false);
      setSelectedCampaign(null);
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const updateCampaignStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, progress: status === 'completed' ? 100 : undefined })
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
      setSelectedCampaign(updated);
    } catch (err) {
      console.error('Failed to update campaign:', err);
    }
  };

  const createCampaign = async (type: string) => {
    setCreating(true);
    try {
      const res = await apiFetch('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          type,
          name: `${type} Campaign`,
          status: 'active',
          progress: 0
        })
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      const newCampaign = await res.json();
      setCampaigns(prev => [newCampaign, ...prev]);
      openDetails(newCampaign);
    } catch (err) {
      console.error('Failed to create campaign:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      <PageHeader
        title="Campaigns"
        subtitle="Launch repeatable marketing playbooks and track their progress."
        actions={
          <button
            onClick={() => createCampaign('General')}
            disabled={creating}
            className="bg-brand text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            <Plus size={18} />
            <span>{creating ? 'Creating...' : 'Create Campaign'}</span>
          </button>
        }
      />

      {/* Playbook Launcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <PlaybookCard
          title="Product Launch"
          description="A 14-day sequence to build hype and drive initial sales."
          icon={Rocket}
          color="bg-purple-50 text-purple-600"
          onClick={() => createCampaign('Product Launch')}
        />
        <PlaybookCard
          title="Lead Generation"
          description="Focus on lead magnets and email capture sequences."
          icon={Target}
          color="bg-blue-50 text-blue-600"
          onClick={() => createCampaign('Lead Generation')}
        />
        <PlaybookCard
          title="Authority Building"
          description="Educational content to position you as an expert."
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-600"
          onClick={() => createCampaign('Authority Building')}
        />
        <PlaybookCard
          title="Email Growth"
          description="Campaigns specifically designed to grow your list."
          icon={Users}
          color="bg-orange-50 text-orange-600"
          onClick={() => createCampaign('Email Growth')}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center mb-6">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      <SectionCard title="Active Campaigns" description="Manage your ongoing marketing operations.">
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No campaigns yet. Pick a playbook above to get started!</div>
          ) : campaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => openDetails(campaign)}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-brand/20 hover:bg-slate-50/50 transition-all cursor-pointer group gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors flex-shrink-0">
                  <Play size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{campaign.name || campaign.type}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{campaign.products?.name || 'General'}</span>
                    <span className="text-slate-300">·</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      campaign.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                      campaign.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-48">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>Progress</span>
                    <span>{campaign.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-500"
                      style={{ width: `${campaign.progress || 0}%` }}
                    />
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Detail Drawer */}
      {isDrawerOpen && selectedCampaign && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedCampaign.name || selectedCampaign.type}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Campaign Details</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedCampaign.type}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <p className="text-sm font-bold text-emerald-600 mt-1 capitalize">{selectedCampaign.status}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Completion</span>
                      <span className="font-bold">{selectedCampaign.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${selectedCampaign.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Suggested Next Steps</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => { setIsDrawerOpen(false); navigate('/content'); }}
                    className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-brand/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded text-slate-400">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Create Campaign Content</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>
                  <button
                    onClick={() => { setIsDrawerOpen(false); navigate('/leads'); }}
                    className="w-full flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-brand/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded text-slate-400">
                        <Users size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">View Lead Pipeline</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <button
                onClick={() => { setIsDrawerOpen(false); navigate('/content'); }}
                className="w-full py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
              >
                <span>Generate Campaign Content</span>
                <ChevronRight size={16} />
              </button>
              <div className="flex gap-2">
                {selectedCampaign.status === 'active' && (
                  <button
                    onClick={() => updateCampaignStatus(selectedCampaign.id, 'completed')}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
                {selectedCampaign.status === 'completed' && (
                  <button
                    onClick={() => updateCampaignStatus(selectedCampaign.id, 'active')}
                    className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Reactivate
                  </button>
                )}
                <button
                  onClick={() => deleteCampaign(selectedCampaign.id)}
                  className="px-4 py-2 bg-red-50 text-red-500 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

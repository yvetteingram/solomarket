import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  Download,
  ChevronDown,
  Linkedin,
  Twitter,
  Mail,
  Globe
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { MetricCard } from '../components/MetricCard';
import { SectionCard } from '../components/SectionCard';
import { apiFetch } from '../services/api';

interface AnalyticsSummary {
  contentPublished: number;
  engagementRate: string;
  leadsGenerated: number;
  conversionActions: number;
}

interface TopContentItem {
  id: string;
  title: string;
  platform: string;
  status: string;
}

interface CampaignPerf {
  id: string;
  name: string;
  status: string;
  progress: number;
}

interface LeadSourceData {
  total: number;
  sources: Array<{ source: string; value: number; count: number }>;
}

const SOURCE_COLORS: Record<string, string> = {
  'LinkedIn': 'bg-blue-500',
  'Twitter': 'bg-sky-400',
  'Email': 'bg-rose-500',
  'Direct': 'bg-slate-400',
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'LinkedIn': return <Linkedin size={18} className="text-blue-600" />;
    case 'Twitter': return <Twitter size={18} className="text-sky-500" />;
    case 'Email': return <Mail size={18} className="text-rose-500" />;
    default: return <Globe size={18} className="text-slate-400" />;
  }
};

export const Analytics = () => {
  const navigate = useNavigate();
  const [timeRange] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topContent, setTopContent] = useState<TopContentItem[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerf[]>([]);
  const [leadSourceData, setLeadSourceData] = useState<LeadSourceData>({ total: 0, sources: [] });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/analytics/summary').then(r => r.ok ? r.json() : Promise.reject()),
      apiFetch('/api/analytics/top-content').then(r => r.ok ? r.json() : Promise.reject()),
      apiFetch('/api/analytics/campaign-performance').then(r => r.ok ? r.json() : Promise.reject()),
      apiFetch('/api/analytics/lead-sources').then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([summaryData, contentData, campaignData, sourceData]) => {
        setSummary(summaryData);
        setTopContent(contentData);
        setCampaignPerformance(campaignData);
        setLeadSourceData(sourceData);
      })
      .catch(err => {
        console.error('Analytics error:', err);
        setError('Unable to load analytics data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Analytics" subtitle="Review what is working and decide what to do next." />
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Analytics"
        subtitle="Review what is working and decide what to do next."
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Calendar size={16} />
                <span>{timeRange}</span>
                <ChevronDown size={14} />
              </button>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        }
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Content Published"
          value={loading ? '...' : (summary?.contentPublished || 0)}
          icon={Calendar}
        />
        <MetricCard
          label="Engagement Rate"
          value={loading ? '...' : (summary?.engagementRate || '0%')}
          icon={TrendingUp}
        />
        <MetricCard
          label="Leads Generated"
          value={loading ? '...' : (summary?.leadsGenerated || 0)}
          icon={Users}
        />
        <MetricCard
          label="Conversion Actions"
          value={loading ? '...' : (summary?.conversionActions || 0)}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Performance */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard title="Top Performing Content" description="Your most recent published content.">
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : topContent.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No published content yet. Start creating in Content Lab!</div>
              ) : topContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-brand/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      {getPlatformIcon(item.platform)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.platform}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                    item.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Campaign Performance" description="Progress on active marketing playbooks.">
            <div className="space-y-6">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : campaignPerformance.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No active campaigns yet.</div>
              ) : campaignPerformance.map((campaign) => (
                <div key={campaign.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{campaign.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{campaign.status}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{campaign.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <SectionCard title="Lead Sources" description="Where your prospects are coming from.">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{leadSourceData.total}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Leads</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {leadSourceData.sources.length === 0 && !loading ? (
                  <p className="text-center text-xs text-slate-400">No lead data yet.</p>
                ) : leadSourceData.sources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${SOURCE_COLORS[source.source] || 'bg-slate-400'}`} />
                      <span className="text-xs font-medium text-slate-600">{source.source}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{source.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recent Insights" className="bg-slate-900 text-white border-none">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-brand/20 rounded text-brand">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium leading-relaxed">
                    {topContent.length > 0
                      ? `Your latest content "${topContent[0].title}" is live on ${topContent[0].platform}. Keep the momentum going!`
                      : 'Start publishing content to unlock performance insights here.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-500/20 rounded text-blue-400">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium leading-relaxed">
                    {leadSourceData.total > 0
                      ? `You have ${leadSourceData.total} total leads. Focus on your top source to maximize conversion.`
                      : 'Once leads start flowing in, you\'ll see source insights here.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/leads')}
                className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
              >
                View All Leads
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

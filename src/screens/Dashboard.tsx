import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Megaphone,
  Calendar,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { SectionCard } from '../components/SectionCard';
import { PageHeader } from '../components/PageHeader';
import { DashboardSummary, Lead, Post, PlanWeek } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; channel: string; dueDate: string; status: string }>>([]);
  const [leadCounts, setLeadCounts] = useState<Record<string, number>>({});
  const [upcomingPosts, setUpcomingPosts] = useState<Array<{ id: string; title: string; platform: string; scheduled_at: string }>>([]);
  const [latestPlan, setLatestPlan] = useState<{ theme: string; conversionActivity: string; actions: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    Promise.all([
      apiFetch('/api/dashboard/summary').then(res => res.ok ? res.json() : Promise.reject()),
      apiFetch('/api/dashboard/tasks').then(res => res.ok ? res.json() : Promise.reject()),
      apiFetch('/api/leads').then(res => res.ok ? res.json() : []),
      apiFetch('/api/posts').then(res => res.ok ? res.json() : []),
      apiFetch('/api/plans').then(res => res.ok ? res.json() : []),
    ])
      .then(([summaryData, tasksData, leadsData, postsData, plansData]) => {
        setSummary(summaryData);
        setTasks(tasksData);

        // Compute lead pipeline counts
        const counts: Record<string, number> = { Visitor: 0, Subscriber: 0, Lead: 0, Customer: 0 };
        for (const lead of leadsData as Lead[]) {
          counts[lead.stage] = (counts[lead.stage] || 0) + 1;
        }
        setLeadCounts(counts);

        // Get upcoming scheduled posts
        const scheduled = (postsData as Post[])
          .filter(p => p.status === 'scheduled' && p.scheduled_at)
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
          .slice(0, 3);
        setUpcomingPosts(scheduled);

        // Get latest plan's first week
        if (plansData.length > 0) {
          const latest = plansData[plansData.length - 1];
          try {
            const weeks: PlanWeek[] = typeof latest.plan_json === 'string'
              ? JSON.parse(latest.plan_json)
              : latest.plan_json;
            if (Array.isArray(weeks) && weeks.length > 0) {
              setLatestPlan({
                theme: weeks[0].theme,
                conversionActivity: weeks[0].conversionActivity,
                actions: weeks[0].actions.slice(0, 3)
              });
            }
          } catch { /* ignore parse errors */ }
        }
      })
      .catch(err => {
        console.error('Dashboard error:', err);
        setError('Unable to load dashboard data. Please try refreshing.');
      })
      .finally(() => setLoading(false));
  }, []);

  const founderName = user?.user_metadata?.full_name ||
    user?.email?.split('@')[0]
      ?.split(/[\._-]/)
      ?.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(' ') ||
    'Founder';

  const leadValues = Object.values(leadCounts) as number[];
  const totalLeads = leadValues.reduce((a, b) => a + b, 0);
  const maxLeadCount = Math.max(...leadValues, 1);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={`${greeting}, ${founderName}`}
        subtitle="Here's what's happening in your marketing world this week."
        actions={
          <button
            onClick={() => navigate('/plans')}
            className="bg-brand text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand/90 transition-colors"
          >
            <Plus size={18} />
            <span>Generate Weekly Plan</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="This Week's Focus"
          value={loading ? '...' : (summary?.focus || 'No active plan')}
          icon={TrendingUp}
          helperText="Priority: High"
        />
        <MetricCard
          label="Active Campaigns"
          value={loading ? '...' : (summary?.activeCampaigns || 0)}
          icon={Megaphone}
        />
        <MetricCard
          label="Scheduled Posts"
          value={loading ? '...' : (summary?.scheduledPosts || 0)}
          icon={Calendar}
        />
        <MetricCard
          label="New Leads"
          value={loading ? '...' : (summary?.newLeads || 0)}
          icon={Users}
          helperText="Last 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title="This Week's Marketing Tasks"
            description="High-impact actions to move your pipeline forward."
            actionSlot={
              <button
                onClick={() => navigate('/content')}
                className="text-brand text-sm font-medium hover:underline"
              >
                View All
              </button>
            }
          >
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No tasks yet. Create a marketing plan to get started!</div>
              ) : tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-brand/20 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/5 group-hover:text-brand transition-colors">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{task.channel}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">Due {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SectionCard title="Upcoming Content" description="Next scheduled items.">
              <div className="space-y-4">
                {loading ? (
                  <div className="py-4 text-center text-sm text-slate-400">Loading...</div>
                ) : upcomingPosts.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No scheduled content yet.</p>
                ) : upcomingPosts.map(post => (
                  <div key={post.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-brand flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{post.title}</p>
                      <p className="text-xs text-slate-500">{post.platform} · {new Date(post.scheduled_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/content')}
                  className="w-full mt-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Open Content Lab
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Lead Pipeline" description="Current stage distribution.">
              <div className="space-y-4">
                {[
                  { label: 'Visitors', count: leadCounts['Visitor'] || 0, color: 'bg-slate-200' },
                  { label: 'Subscribers', count: leadCounts['Subscriber'] || 0, color: 'bg-blue-200' },
                  { label: 'Leads', count: leadCounts['Lead'] || 0, color: 'bg-brand/30' },
                  { label: 'Customers', count: leadCounts['Customer'] || 0, color: 'bg-brand' },
                ].map(stage => (
                  <div key={stage.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">{stage.label}</span>
                      <span className="text-slate-400">{stage.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stage.color} transition-all duration-500`}
                        style={{ width: `${totalLeads > 0 ? Math.max(2, (stage.count / maxLeadCount) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {totalLeads === 0 && !loading && (
                  <p className="text-xs text-slate-400 text-center pt-2">No leads yet.</p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="space-y-8">
          <SectionCard
            title="Weekly Plan Snapshot"
            className="bg-brand text-white border-none shadow-brand/20"
          >
            {latestPlan ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Current Theme</span>
                  <h4 className="text-xl font-bold mt-1">{latestPlan.theme}</h4>
                </div>

                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-sm font-medium">Primary CTA</p>
                  <p className="text-xs opacity-80 mt-1">{latestPlan.conversionActivity}</p>
                </div>

                <div className="space-y-2">
                  {latestPlan.actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-white/60 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/plans')}
                  className="w-full py-3 bg-white text-brand font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span>View Full Plan</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm opacity-80">No marketing plan created yet.</p>
                <button
                  onClick={() => navigate('/plans')}
                  className="w-full py-3 bg-white text-brand font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Sparkles size={18} />
                  <span>Create Your First Plan</span>
                </button>
              </div>
            )}
          </SectionCard>

          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h4 className="font-bold text-lg">AI Assistant</h4>
            <p className="text-sm text-slate-400 mt-2">
              {summary && summary.newLeads > 0
                ? `You have ${summary.newLeads} new leads this week. Want me to draft follow-up content?`
                : 'Ready to help you create content, plan campaigns, or analyze your marketing performance.'}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate('/content')}
                className="flex-1 py-2 bg-brand rounded-lg text-sm font-bold hover:bg-brand/90 transition-colors"
              >
                Create Content
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="flex-1 py-2 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

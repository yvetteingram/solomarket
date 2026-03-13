import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Mail,
  Calendar,
  ChevronRight,
  LayoutGrid,
  List,
  X,
  MessageSquare,
  User,
  Target,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { MetricCard } from '../components/MetricCard';
import { Lead as LeadType } from '../types';
import { apiFetch } from '../services/api';

type Lead = LeadType;

export const Leads = () => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  useEffect(() => {
    apiFetch('/api/leads')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load leads');
        return res.json();
      })
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leads:', err);
        setError('Unable to load leads.');
        setLoading(false);
      });
  }, []);

  const stages = ['Visitor', 'Subscriber', 'Lead', 'Customer'];

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.email.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q)
      );
    }
    if (stageFilter !== 'All') {
      result = result.filter(l => l.stage === stageFilter);
    }
    return result;
  }, [leads, searchQuery, stageFilter]);

  const openDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Visitor': return 'bg-slate-100 text-slate-600';
      case 'Subscriber': return 'bg-blue-50 text-blue-600';
      case 'Lead': return 'bg-brand/10 text-brand';
      case 'Customer': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Leads"
        subtitle="Track prospects and follow-up status to grow your business."
        actions={
          <div className="flex gap-2">
            <div className="flex bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        }
      />

      {/* Stage Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <MetricCard label="Visitors" value={leads.filter(l => l.stage === 'Visitor').length} icon={User} />
        <MetricCard label="Subscribers" value={leads.filter(l => l.stage === 'Subscriber').length} icon={MessageSquare} />
        <MetricCard label="Leads" value={leads.filter(l => l.stage === 'Lead').length} icon={Target} />
        <MetricCard label="Customers" value={leads.filter(l => l.stage === 'Customer').length} icon={CheckCircle2} />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="All">All Stages</option>
            {stages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 font-medium">Showing {filteredLeads.length} leads</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center mb-6">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading leads...</div>
      ) : viewMode === 'table' ? (
        <SectionCard className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Contact</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {searchQuery || stageFilter !== 'All' ? 'No leads match your search.' : 'No leads yet.'}
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => openDetails(lead)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {getInitials(lead.email)}
                      </div>
                      <p className="text-sm font-bold text-slate-900">{lead.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getStageColor(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{lead.source}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{lead.last_contacted || 'Never'}</td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={16} className="text-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            return (
              <div key={stage} className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stage}</h4>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => openDetails(lead)}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand/30 transition-all cursor-pointer group"
                    >
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors truncate">{lead.email}</h5>
                      <p className="text-xs text-slate-500 mt-1">{lead.source}</p>
                      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Last: {lead.last_contacted || 'Never'}</span>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No leads in this stage.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      {isDrawerOpen && selectedLead && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                  {getInitials(selectedLead.email)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 truncate max-w-[220px]">{selectedLead.email}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Lead Details</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex-1 py-2.5 bg-brand text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors"
                >
                  <Mail size={16} />
                  <span>Email</span>
                </a>
                <button className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                  <Calendar size={16} />
                  <span>Schedule</span>
                </button>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Lead Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage</span>
                    <div className="mt-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStageColor(selectedLead.stage)}`}>
                        {selectedLead.stage}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedLead.source}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Contact</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedLead.last_contacted || 'Never'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Notes</h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    {selectedLead.notes || "No notes available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

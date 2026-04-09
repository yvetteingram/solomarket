import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Plus, X, Trash2, Edit2, CheckCircle2,
  Users, BarChart3, Loader2, ChevronRight, Mail,
  AlertCircle, ShoppingBag, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Agency, ClientWorkspace } from '../types';
import { apiFetch } from '../services/api';
import { PageHeader } from '../components/PageHeader';

// ── Workspace Card ────────────────────────────────────────────────────────────
function WorkspaceCard({
  workspace,
  onEdit,
  onDelete,
}: {
  workspace: ClientWorkspace;
  onEdit: (w: ClientWorkspace) => void;
  onDelete: (id: string) => void;
}) {
  const initial = workspace.client_name.charAt(0).toUpperCase();
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
  ];
  const color = colors[workspace.client_name.charCodeAt(0) % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm hover:border-slate-300 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm">{workspace.client_name}</h3>
          {workspace.client_email && (
            <div className="flex items-center gap-1 mt-0.5">
              <Mail size={11} className="text-slate-400" />
              <span className="text-xs text-slate-400 truncate">{workspace.client_email}</span>
            </div>
          )}
          {workspace.notes && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{workspace.notes}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-2">
            Added {new Date(workspace.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(workspace)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(workspace.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Workspace Form Modal ──────────────────────────────────────────────────────
function WorkspaceModal({
  agencyId,
  editing,
  onSave,
  onClose,
}: {
  agencyId: string;
  editing: ClientWorkspace | null;
  onSave: (w: ClientWorkspace) => void;
  onClose: () => void;
}) {
  const [clientName, setClientName] = useState(editing?.client_name || '');
  const [clientEmail, setClientEmail] = useState(editing?.client_email || '');
  const [notes, setNotes] = useState(editing?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const isEdit = !!editing;
      const res = await apiFetch(
        isEdit ? `/api/workspaces/${editing!.id}` : '/api/workspaces',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agency_id: agencyId,
            client_name: clientName.trim(),
            client_email: clientEmail.trim() || null,
            notes: notes.trim() || null,
          }),
        }
      );
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      onSave(saved);
    } catch {
      setError('Failed to save workspace. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[80]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[90] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">{editing ? 'Edit Client' : 'Add Client Workspace'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Client Name *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="Acme Corp / Jane Smith"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Client Email
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              placeholder="client@company.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Industry, goals, current challenges..."
              className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !clientName.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Setup Card (no agency yet) ────────────────────────────────────────────────
function AgencySetup({ onSetup }: { onSetup: (agency: Agency) => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch('/api/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), client_limit: 3 }),
      });
      if (res.ok) {
        onSetup(await res.json());
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Failed to create agency (${res.status})`);
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Building2 size={28} className="text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Up Your Agency</h2>
      <p className="text-slate-500 mb-8 leading-relaxed">
        Create your agency workspace to manage multiple clients, run campaigns on their behalf, and track results per client.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-left">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-3 max-w-sm mx-auto">
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your Agency Name"
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Create
        </button>
      </form>

      <div className="mt-10 grid grid-cols-3 gap-4 text-left">
        {[
          { icon: Users, label: 'Client Workspaces', desc: 'Separate campaigns and leads per client' },
          { icon: BarChart3, label: 'Per-Client Analytics', desc: 'Track performance for each client account' },
          { icon: Building2, label: 'Agency Billing', desc: 'Upgrade to Agency plan for up to 10 clients' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-4 text-center">
            <Icon size={20} className="text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 mb-1">{label}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Agency Screen ────────────────────────────────────────────────────────
export function Agency() {
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<ClientWorkspace | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [agencyRes, wsRes] = await Promise.all([
        apiFetch('/api/agency'),
        apiFetch('/api/workspaces'),
      ]);
      if (agencyRes.ok) {
        const a = await agencyRes.json();
        setAgency(a);
      }
      if (wsRes.ok) setWorkspaces(await wsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client workspace? This cannot be undone.')) return;
    await apiFetch(`/api/workspaces/${id}`, { method: 'DELETE' });
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  const handleSave = (saved: ClientWorkspace) => {
    setWorkspaces(prev => {
      const idx = prev.findIndex(w => w.id === saved.id);
      return idx >= 0 ? prev.map(w => w.id === saved.id ? saved : w) : [saved, ...prev];
    });
    setModalOpen(false);
    setEditingWorkspace(null);
  };

  const openAdd = () => { setEditingWorkspace(null); setModalOpen(true); };
  const openEdit = (w: ClientWorkspace) => { setEditingWorkspace(w); setModalOpen(true); };

  const atLimit = agency && workspaces.length >= agency.client_limit;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={22} className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (!agency) {
    return <AgencySetup onSetup={(a) => { setAgency(a); }} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Agency"
        subtitle="Manage client workspaces and run campaigns on behalf of your clients."
      />

      {/* Agency overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 flex items-center gap-5">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 size={22} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900">{agency.name}</h2>
          <p className="text-sm text-slate-500">
            {workspaces.length} / {agency.client_limit} client workspaces used
          </p>
        </div>
        <div className="flex items-center gap-3">
          {atLimit && (
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <ShoppingBag size={13} />
              Upgrade for more
            </button>
          )}
          <button
            onClick={openAdd}
            disabled={!!atLimit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} />
            Add Client
          </button>
        </div>
      </div>

      {/* Usage bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Client Workspaces</span>
          <span>{workspaces.length} / {agency.client_limit}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              atLimit ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min((workspaces.length / agency.client_limit) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Workspace list */}
      {workspaces.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No clients yet</h3>
          <p className="text-sm text-slate-400 mb-5">Add your first client workspace to get started.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={15} />
            Add First Client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workspaces.map(w => (
            <WorkspaceCard
              key={w.id}
              workspace={w}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Agency plan CTA */}
      <div className="mt-10 flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl">
        <div className="flex-1">
          <p className="font-bold text-slate-900 text-sm">Need more than {agency.client_limit} clients?</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Upgrade to the Agency plan for 10 client workspaces, white-label reports, and advanced analytics.
          </p>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0"
        >
          Upgrade <ArrowRight size={14} />
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {(modalOpen || editingWorkspace) && agency && (
          <WorkspaceModal
            agencyId={agency.id}
            editing={editingWorkspace}
            onSave={handleSave}
            onClose={() => { setModalOpen(false); setEditingWorkspace(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

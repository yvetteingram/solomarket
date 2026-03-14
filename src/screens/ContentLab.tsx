import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Sparkles,
  Search,
  Filter,
  Edit3,
  Calendar,
  Send,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  FileText,
  Mail,
  Linkedin,
  Twitter,
  Package
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { generateContentDraft } from '../services/geminiService';
import { apiFetch } from '../services/api';
import { Product } from '../types';

interface ContentItem {
  id: string;
  type: 'LinkedIn' | 'Twitter' | 'Email' | 'Blog';
  title: string;
  preview: string;
  status: 'Draft' | 'Scheduled' | 'Published';
  scheduledAt?: string;
}

export const ContentLab = () => {
  const [generating, setGenerating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [contentType, setContentType] = useState('LinkedIn Post');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('Educate');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  // Inline add-product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    setAddingProduct(true);
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: newProductName.trim(), product_type: 'digital', price_cents: 0 }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      setProducts(prev => [...prev, created]);
      setSelectedProductId(created.id);
      setNewProductName('');
      setShowAddProduct(false);
    } catch {
      setError('Failed to add product.');
    } finally {
      setAddingProduct(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, postsRes] = await Promise.all([
          apiFetch('/api/products'),
          apiFetch('/api/posts')
        ]);

        if (!productsRes.ok || !postsRes.ok) throw new Error('Failed to load data');

        const productsData = await productsRes.json();
        const postsData = await postsRes.json();

        setProducts(productsData);
        if (productsData.length > 0) setSelectedProductId(productsData[0].id);

        const mappedPosts: ContentItem[] = postsData.map((post: { id: string; platform: string; title: string; content: string; status: string; scheduled_at?: string }) => ({
          id: post.id,
          type: post.platform as ContentItem['type'],
          title: post.title,
          preview: post.content,
          status: post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : 'Draft',
          scheduledAt: post.scheduled_at
        }));

        setContent(mappedPosts);
        if (mappedPosts.length > 0) {
          setSelectedId(mappedPosts[0].id);
          setEditTitle(mappedPosts[0].title);
          setEditBody(mappedPosts[0].preview);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Unable to load content. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedContent = content.find(c => c.id === selectedId);

  // When selection changes, update editor fields
  const handleSelect = (id: string) => {
    setSelectedId(id);
    const item = content.find(c => c.id === id);
    if (item) {
      setEditTitle(item.title);
      setEditBody(item.preview);
    }
  };

  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return content;
    const q = searchQuery.toLowerCase();
    return content.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.preview.toLowerCase().includes(q)
    );
  }, [content, searchQuery]);

  const handleGenerate = async () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    setGenerating(true);
    try {
      const draft = await generateContentDraft({
        type: contentType,
        topic,
        goal,
        product
      });

      const typeMap: Record<string, 'LinkedIn' | 'Twitter' | 'Email' | 'Blog'> = {
        'LinkedIn Post': 'LinkedIn',
        'Twitter Thread': 'Twitter',
        'Email Newsletter': 'Email',
        'Blog Outline': 'Blog'
      };

      const platform = typeMap[contentType] || 'LinkedIn';

      const response = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          platform,
          title: topic || `New ${contentType}`,
          content: draft,
          status: 'draft'
        })
      });

      if (!response.ok) throw new Error('Failed to save post');
      const savedPost = await response.json();

      const newItem: ContentItem = {
        id: savedPost.id,
        type: platform,
        title: savedPost.title,
        preview: savedPost.content,
        status: 'Draft'
      };

      setContent([newItem, ...content]);
      handleSelect(newItem.id);
    } catch (error) {
      console.error('Failed to generate draft:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedContent) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/posts/${selectedContent.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: editTitle, content: editBody })
      });
      if (!res.ok) throw new Error('Failed to save');

      setContent(prev => prev.map(c =>
        c.id === selectedContent.id ? { ...c, title: editTitle, preview: editBody } : c
      ));
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedContent) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/posts/${selectedContent.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: editTitle, content: editBody, status: 'published' })
      });
      if (!res.ok) throw new Error('Failed to publish');

      setContent(prev => prev.map(c =>
        c.id === selectedContent.id ? { ...c, title: editTitle, preview: editBody, status: 'Published' } : c
      ));
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedContent) return;
    // Schedule for tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    setSaving(true);
    try {
      const res = await apiFetch(`/api/posts/${selectedContent.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: editTitle, content: editBody, status: 'scheduled', scheduled_at: tomorrow.toISOString() })
      });
      if (!res.ok) throw new Error('Failed to schedule');

      setContent(prev => prev.map(c =>
        c.id === selectedContent.id
          ? { ...c, title: editTitle, preview: editBody, status: 'Scheduled', scheduledAt: tomorrow.toISOString() }
          : c
      ));
    } catch (err) {
      console.error('Schedule failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRepurpose = (targetType: string) => {
    if (!selectedContent) return;
    const typeMap: Record<string, string> = {
      'Turn into Email': 'Email Newsletter',
      'Blog Outline': 'Blog Outline',
      'Twitter Thread': 'Twitter Thread'
    };
    setContentType(typeMap[targetType] || 'LinkedIn Post');
    setTopic(`Repurpose: ${selectedContent.title}`);
  };

  const handleDelete = async () => {
    if (!selectedContent) return;
    if (!window.confirm('Delete this content?')) return;
    try {
      await apiFetch(`/api/posts/${selectedContent.id}`, { method: 'DELETE' });
    } catch {
      // still remove from UI
    }
    setContent(prev => prev.filter(c => c.id !== selectedContent.id));
    setSelectedId(null);
    setEditTitle('');
    setEditBody('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LinkedIn': return <Linkedin size={16} className="text-blue-600" />;
      case 'Twitter': return <Twitter size={16} className="text-sky-500" />;
      case 'Email': return <Mail size={16} className="text-rose-500" />;
      default: return <FileText size={16} className="text-slate-500" />;
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Content Lab" subtitle="Generate, edit, and schedule your marketing assets." />
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Content Lab"
        subtitle="Generate, edit, and schedule your marketing assets."
        actions={
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} />
            <span>New Content Batch</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Controls */}
        <div className="lg:col-span-3 space-y-6">
          <SectionCard title="Generator" description="AI-powered draft creation.">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Product</label>
                {products.length === 0 && !showAddProduct ? (
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(true)}
                    className="w-full px-3 py-3 rounded-lg border-2 border-dashed border-slate-200 hover:border-brand hover:text-brand text-slate-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Package size={16} />
                    Add a product first
                  </button>
                ) : showAddProduct ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <input
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Product name"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddProduct}
                        disabled={!newProductName.trim() || addingProduct}
                        className="px-3 py-1.5 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand/90 disabled:opacity-50"
                      >
                        {addingProduct ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddProduct(false); setNewProductName(''); }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(true)}
                      className="px-2 py-2 rounded-lg border border-slate-200 hover:border-brand hover:text-brand text-slate-400 transition-colors"
                      title="Add new product"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                >
                  <option>LinkedIn Post</option>
                  <option>Twitter Thread</option>
                  <option>Email Newsletter</option>
                  <option>Blog Outline</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Topic / Theme</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-brand/20 outline-none h-24 resize-none"
                  placeholder="e.g. Why solopreneurs need a marketing OS..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                >
                  <option>Educate</option>
                  <option>Inspire</option>
                  <option>Sell / Convert</option>
                  <option>Entertain</option>
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? <Sparkles className="animate-pulse" size={16} /> : <Sparkles size={16} />}
                <span>{generating ? 'Generating...' : 'Generate Draft'}</span>
              </button>
            </div>
          </SectionCard>

          <div className="p-4 bg-brand/5 rounded-2xl border border-brand/10">
            <h4 className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Tip</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate a plan in <strong>Plans</strong> first, then use those themes here for consistent messaging.
            </p>
          </div>
        </div>

        {/* Content List & Editor */}
        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* List */}
            <div className="md:col-span-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Loading content...</div>
                ) : filteredContent.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    {searchQuery ? 'No matches found.' : 'No content yet. Generate your first draft!'}
                  </div>
                ) : filteredContent.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedId === item.id
                        ? 'bg-white border-brand shadow-sm ring-1 ring-brand/10'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getIcon(item.type)}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type}</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        item.status === 'Published' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.preview}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="md:col-span-8 flex flex-col">
              {selectedContent ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        {getIcon(selectedContent.type)}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="font-bold text-slate-900 bg-transparent outline-none border-none p-0 focus:ring-0 w-full"
                        />
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                          {selectedContent.status === 'Published' ? 'Published' : selectedContent.status === 'Scheduled' ? 'Scheduled' : 'Editing Draft'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="p-6">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full min-h-[300px] resize-none outline-none text-slate-700 leading-relaxed"
                    />
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSchedule}
                        disabled={saving}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Calendar size={14} />
                        <span>Schedule</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={saving}
                        className="px-6 py-2 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send size={16} />
                        <span>Publish Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 min-h-[400px]">
                  <Edit3 size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">Select an item to edit or generate new content.</p>
                </div>
              )}

              {/* Repurposing Suggestions */}
              {selectedContent && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Turn into Email', icon: Mail },
                    { label: 'Blog Outline', icon: FileText },
                    { label: 'Twitter Thread', icon: Twitter },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleRepurpose(opt.label)}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-brand/30 hover:bg-brand/5 transition-all flex flex-col items-center gap-2 group"
                    >
                      <opt.icon size={18} className="text-slate-400 group-hover:text-brand transition-colors" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-brand transition-colors">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

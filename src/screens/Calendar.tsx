import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Linkedin,
  Twitter,
  Mail,
  FileText,
  Megaphone,
  Clock,
  CheckCircle2,
  Send,
  Camera,
  Users,
  Play,
  Video,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../services/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  type: 'content' | 'campaign';
  subtype: string; // platform or campaign type
  status: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getIcon = (type: string, subtype: string) => {
  if (type === 'campaign') return <Megaphone size={12} />;
  switch (subtype) {
    case 'LinkedIn': return <Linkedin size={12} />;
    case 'Twitter': return <Twitter size={12} />;
    case 'Email': return <Mail size={12} />;
    case 'Instagram': case 'Instagram Reel': return <Camera size={12} />;
    case 'Facebook': return <Users size={12} />;
    case 'YouTube': case 'YouTube Short': return <Play size={12} />;
    case 'TikTok': return <Video size={12} />;
    case 'Pinterest': return <MapPin size={12} />;
    case 'Threads': return <MessageCircle size={12} />;
    default: return <FileText size={12} />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'published': return <CheckCircle2 size={10} className="text-emerald-500" />;
    case 'scheduled': return <Clock size={10} className="text-blue-500" />;
    case 'active': return <Send size={10} className="text-emerald-500" />;
    case 'completed': return <CheckCircle2 size={10} className="text-blue-500" />;
    default: return <Clock size={10} className="text-slate-400" />;
  }
};

const getEventColor = (type: string, subtype: string) => {
  if (type === 'campaign') return 'bg-orange-50 border-orange-200 text-orange-700';
  switch (subtype) {
    case 'LinkedIn': return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'Twitter': return 'bg-sky-50 border-sky-200 text-sky-700';
    case 'Email': return 'bg-rose-50 border-rose-200 text-rose-700';
    case 'Instagram': case 'Instagram Reel': return 'bg-pink-50 border-pink-200 text-pink-700';
    case 'Facebook': return 'bg-blue-50 border-blue-300 text-blue-800';
    case 'YouTube': case 'YouTube Short': return 'bg-red-50 border-red-200 text-red-700';
    case 'TikTok': return 'bg-slate-100 border-slate-300 text-slate-800';
    case 'Pinterest': return 'bg-red-50 border-red-300 text-red-800';
    case 'Threads': return 'bg-slate-50 border-slate-300 text-slate-700';
    default: return 'bg-slate-50 border-slate-200 text-slate-700';
  }
};

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [postsRes, campaignsRes] = await Promise.all([
          apiFetch('/api/posts'),
          apiFetch('/api/campaigns')
        ]);

        const calEvents: CalendarEvent[] = [];

        if (postsRes.ok) {
          const posts = await postsRes.json();
          posts.forEach((post: { id: string; title: string; scheduled_at?: string; created_at: string; platform: string; status: string }) => {
            calEvents.push({
              id: post.id,
              title: post.title,
              date: post.scheduled_at || post.created_at,
              type: 'content',
              subtype: post.platform,
              status: post.status
            });
          });
        }

        if (campaignsRes.ok) {
          const campaigns = await campaignsRes.json();
          campaigns.forEach((c: { id: string; name?: string; type: string; created_at: string; status: string }) => {
            calEvents.push({
              id: c.id,
              title: c.name || c.type,
              date: c.created_at,
              type: 'campaign',
              subtype: c.type,
              status: c.status
            });
          });
        }

        setEvents(calEvents);
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      const d = new Date(ev.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  // Stats
  const thisMonthEvents = calendarDays
    .filter((d): d is number => d !== null)
    .reduce((acc, d) => acc + (eventsByDate[dateKey(d)]?.length || 0), 0);

  const scheduledCount = events.filter(e => e.status === 'scheduled').length;
  const publishedCount = events.filter(e => e.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Calendar"
        subtitle="See your scheduled content and campaigns at a glance."
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Month</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{thisMonthEvents}</p>
          <p className="text-xs text-slate-500">total items</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheduled</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{scheduledCount}</p>
          <p className="text-xs text-slate-500">awaiting publish</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Published</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{publishedCount}</p>
          <p className="text-xs text-slate-500">pieces live</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon size={20} className="text-brand" />
                <h2 className="text-lg font-bold text-slate-900">
                  {MONTHS[month]} {year}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToday}
                  className="px-3 py-1.5 text-xs font-bold text-brand bg-brand/5 rounded-lg hover:bg-brand/10 transition-colors"
                >
                  Today
                </button>
                <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAYS.map(day => (
                <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading calendar...</div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-50 bg-slate-50/30" />;
                  }
                  const dk = dateKey(day);
                  const dayEvents = eventsByDate[dk] || [];
                  const isToday = dk === todayStr;
                  const isSelected = dk === selectedDate;

                  return (
                    <button
                      key={dk}
                      onClick={() => setSelectedDate(isSelected ? null : dk)}
                      className={`min-h-[100px] border-b border-r border-slate-50 p-1.5 text-left transition-colors hover:bg-brand/5 ${
                        isSelected ? 'bg-brand/5 ring-1 ring-brand/20' : ''
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ${
                        isToday ? 'bg-brand text-white' : 'text-slate-700'
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border truncate ${getEventColor(ev.type, ev.subtype)}`}
                          >
                            {getIcon(ev.type, ev.subtype)}
                            <span className="truncate">{ev.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-bold pl-1">+{dayEvents.length - 3} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-8">
            {selectedDate ? (
              <>
                <h3 className="font-bold text-slate-900 mb-1">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{selectedEvents.length} item{selectedEvents.length !== 1 ? 's' : ''}</p>

                {selectedEvents.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    Nothing scheduled for this day.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map(ev => (
                      <div key={ev.id} className={`p-3 rounded-xl border ${getEventColor(ev.type, ev.subtype)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getIcon(ev.type, ev.subtype)}
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {ev.type === 'campaign' ? 'Campaign' : ev.subtype}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(ev.status)}
                            <span className="text-[10px] font-bold capitalize">{ev.status}</span>
                          </div>
                        </div>
                        <p className="text-sm font-semibold mt-1">{ev.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(ev.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <CalendarIcon size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Click a day to see details</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Legend</h4>
            <div className="space-y-2">
              {[
                { label: 'LinkedIn', color: 'bg-blue-100 text-blue-600', icon: <Linkedin size={12} /> },
                { label: 'Twitter/X', color: 'bg-sky-100 text-sky-600', icon: <Twitter size={12} /> },
                { label: 'Instagram', color: 'bg-pink-100 text-pink-600', icon: <Camera size={12} /> },
                { label: 'Facebook', color: 'bg-blue-100 text-blue-500', icon: <Users size={12} /> },
                { label: 'YouTube', color: 'bg-red-100 text-red-600', icon: <Play size={12} /> },
                { label: 'TikTok', color: 'bg-slate-200 text-slate-700', icon: <Video size={12} /> },
                { label: 'Pinterest', color: 'bg-red-100 text-red-700', icon: <MapPin size={12} /> },
                { label: 'Threads', color: 'bg-slate-100 text-slate-600', icon: <MessageCircle size={12} /> },
                { label: 'Email', color: 'bg-rose-100 text-rose-600', icon: <Mail size={12} /> },
                { label: 'Blog', color: 'bg-slate-100 text-slate-600', icon: <FileText size={12} /> },
                { label: 'Campaign', color: 'bg-orange-100 text-orange-600', icon: <Megaphone size={12} /> },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

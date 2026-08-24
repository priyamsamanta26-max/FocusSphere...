import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Target, Clock, Trophy } from 'lucide-react';

function Sparkline({ data = [], width = 400, height = 80, stroke = '#3dd3d9' }) {
  if (!data || data.length === 0) return <div style={{height}}></div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = max === min ? height / 2 : height - ((d - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPts = `0,${height} ${pts} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={areaPts} fill="rgba(61,211,217,0.06)" />
    </svg>
  );
}

export default function Dashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, streak: 0, focusTime: 0 });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data: tasksData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        const { data: examsData } = await supabase.from('exams').select('*').order('exam_date', { ascending: true }).limit(10);
        const { data: sessionsData } = await supabase.from('study_sessions').select('duration_minutes, created_at').order('created_at', { ascending: true });

        if (!mounted) return;
        setTasks(tasksData || []);
        setExams(examsData || []);
        setSessions(sessionsData || []);

        const pending = (tasksData || []).filter(t => !t.is_completed).length;
        const completed = (tasksData || []).filter(t => t.is_completed).length;
        const focusTime = (sessionsData || []).reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

        // derive simple streak from user profile if available
        let streak = 0;
        try {
          const { data: profile } = await supabase.from('user_profiles').select('current_streak').eq('user_id', user?.id).maybeSingle();
          streak = profile?.current_streak || 0;
        } catch (e) {
          streak = 0;
        }

        setStats({ pending, completed, streak, focusTime });
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  // prepare 7-day series from sessions
  const last7 = React.useMemo(() => {
    const days = 7;
    const arr = Array.from({ length: days }, (_, i) => 0);
    const now = new Date();
    for (const s of sessions || []) {
      const d = new Date(s.created_at);
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < days) {
        arr[days - 1 - diffDays] += s.duration_minutes || 0;
      }
    }
    return arr;
  }, [sessions]);

  const totalTasks = stats.pending + stats.completed || 1;
  const completedPct = Math.round((stats.completed / Math.max(1, totalTasks)) * 100);
  const pendingPct = Math.round((stats.pending / Math.max(1, totalTasks)) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 font-mono">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="dashboard-ui p-8">
      <div className="container space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="display-oversize">Dashboard</h1>
            <p className="text-slate-400">Your non-interactive progress overview</p>
          </div>

          <div className="text-right">
            <div className="text-sm font-mono text-slate-400">
              {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-lg font-bold text-slate-100">
              {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
          </div>
        </header>

        {/* Top metrics row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="editorial-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="small-label">PENDING TASKS</div>
                <div className="big-number mt-3">{stats.pending}</div>
              </div>
              <div className="text-teal-400"><Target size={36} /></div>
            </div>
            <div className="mt-4 h-3 bg-transparent rounded overflow-hidden">
              <div style={{width: `${pendingPct}%`}} className="h-full bg-amber-500" />
            </div>
            <div className="text-xs text-slate-500 mt-2">{pendingPct}% of tasks pending</div>
          </div>

          <div className="editorial-card p-6">
            <div className="small-label">COMPLETED TASKS</div>
            <div className="big-number mt-3">{stats.completed}</div>
            <div className="mt-4 h-3 bg-transparent rounded overflow-hidden">
              <div style={{width: `${completedPct}%`}} className="h-full bg-teal-400" />
            </div>
            <div className="text-xs text-slate-500 mt-2">{completedPct}% completed</div>
          </div>

          <div className="editorial-card p-6">
            <div className="small-label">CURRENT STREAK</div>
            <div className="big-number mt-3">{stats.streak}</div>
            <div className="text-xs text-slate-500 mt-2">Consecutive study days</div>
          </div>

          <div className="editorial-card p-6">
            <div className="small-label">ACCUMULATED FLOW</div>
            <div className="big-number mt-3">{stats.focusTime} mins</div>
            <div className="text-xs text-slate-500 mt-2">Total focus minutes</div>
          </div>
        </section>

        {/* Middle: Study backlog & Milestones */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 editorial-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="small-label">STUDY BACKLOG</div>
                <div className="mt-3 text-xl font-bold">{tasks.length} items</div>
              </div>
              <div className="text-slate-400">&nbsp;</div>
            </div>
            <div className="mt-4 text-slate-400 text-sm">
              {tasks.length === 0 ? 'No items in backlog' : 'This list shows current backlog progress summaries.'}
            </div>
            <div className="mt-4">
              {/* show small list summary (non-clickable) */}
              {(tasks || []).slice(0,5).map(t => (
                <div key={t.id} className={`flex items-center justify-between py-2 border-b border-slate-800/20 text-sm ${t.is_completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                  <div className="min-w-0 truncate">{t.title}</div>
                  <div className="ml-4 text-xs text-slate-400">{t.is_completed ? 'Done' : 'Open'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="editorial-card p-6">
            <div className="small-label">MILESTONES</div>
            <div className="big-number mt-3">{exams.length}</div>
            <div className="text-xs text-slate-500 mt-2">Upcoming milestones (exam count)</div>
          </div>
        </section>

        {/* Bottom: 7-day progress graph */}
        <section className="editorial-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="small-label">WEEKLY PROGRESS</div>
              <div className="text-slate-400 text-sm mt-2">Focus minutes over the last 7 days</div>
            </div>
            <div className="text-xs text-slate-400">Total: {stats.focusTime} mins</div>
          </div>
          <div className="mt-4">
            <Sparkline data={last7} width={680} height={120} stroke={'#3dd3d9'} />
          </div>
        </section>

      </div>
    </div>
  );
}

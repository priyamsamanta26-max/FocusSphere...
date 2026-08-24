import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Play, Square, RotateCcw, Coffee, Sparkles, Sliders, History, Timer } from 'lucide-react';

export default function FocusTimer({ user }) {
  // Focus and Break durations in seconds
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  
  // Timer active variables
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  
  // Input fields state
  const [customFocusMins, setCustomFocusMins] = useState('25');
  const [customBreakMins, setCustomBreakMins] = useState('5');
  
  const [recentSessions, setRecentSessions] = useState([]);
  
  useEffect(() => {
    fetchRecentSessions();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      clearInterval(interval);
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreakMode]);

  const fetchRecentSessions = async () => {
    const { data } = await supabase
      .from('study_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setRecentSessions(data);
  };

  const handleSessionComplete = async () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (e) {}

    if (!isBreakMode) {
      // Completed Focus Mode
      const minutes = Math.round(focusDuration / 60);
      await supabase.from('study_sessions').insert([{ user_id: user.id, duration_minutes: minutes }]);
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle();
      
      if (profile) {
        let streak = profile.current_streak || 0;
        if (profile.last_study_date !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (profile.last_study_date === yesterdayStr) {
            streak += 1;
          } else {
            streak = 1;
          }
          
          await supabase.from('user_profiles').upsert({
            user_id: user.id,
            current_streak: streak,
            last_study_date: today
          });
        }
      }

      alert('🎉 Focus session complete! Time for a well-deserved break.');
      fetchRecentSessions();
      
      // Automatically switch to Break Mode
      setIsBreakMode(true);
      setTimeLeft(breakDuration);
    } else {
      // Completed Break Mode
      alert('⚡ Break time over! Let\'s get back to work.');
      setIsBreakMode(false);
      setTimeLeft(focusDuration);
    }
  };

  const applyIntervals = (e) => {
    e.preventDefault();
    const focusVal = parseInt(customFocusMins, 10);
    const breakVal = parseInt(customBreakMins, 10);

    if (isRunning) return;

    if (!isNaN(focusVal) && focusVal > 0 && focusVal <= 180) {
      setFocusDuration(focusVal * 60);
      if (!isBreakMode) setTimeLeft(focusVal * 60);
    }
    
    if (!isNaN(breakVal) && breakVal > 0 && breakVal <= 180) {
      setBreakDuration(breakVal * 60);
      if (isBreakMode) setTimeLeft(breakVal * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreakMode ? breakDuration : focusDuration);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = isBreakMode ? breakDuration : focusDuration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const getMotivationPhrase = () => {
    if (isBreakMode) return 'Rest, hydrate, and stretch your body.';
    if (!isRunning) return 'Ready to start focus flow?';
    if (progress < 25) return 'Setting up your focus session...';
    if (progress < 50) return 'Keep going, you are building momentum!';
    if (progress < 75) return 'Over halfway there! Stay disciplined.';
    return 'Almost done, push through to the finish!';
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 font-sans">
      {/* Left: Large Timer Panel */}
      <div className="lg:col-span-2 glass-card p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-slate-900/30 to-slate-950/40 border border-teal-500/12 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-100">Focus Timer</h2>
            <p className="text-xs text-slate-400">A minimal, distraction-free timer to power your sessions</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">Mode: <span className={`font-black ${isBreakMode ? 'text-amber-400' : 'text-teal-400'}`}>{isBreakMode ? 'Break' : 'Focus'}</span></div>
        </div>

        <div className="relative flex items-center justify-center w-full">
          <div className="relative w-[360px] h-[360px] rounded-full flex items-center justify-center bg-slate-900/30 border-4 border-slate-800 shadow-inner">
            <div className="absolute inset-4 rounded-full" style={{
              background: `conic-gradient(${isBreakMode ? '#f59e0b' : '#0d9488'} ${progress}%, rgba(30, 41, 59, 0.4) ${progress}%)`
            }} />

            <div className="absolute inset-8 rounded-full bg-slate-955/95 backdrop-blur flex flex-col items-center justify-center shadow-2xl border border-slate-800">
              <div className="text-center">
                <div className="text-7xl font-mono font-extrabold text-slate-100 select-none">{formatTime(timeLeft)}</div>
                <div className="mt-3 text-sm text-slate-400">{getMotivationPhrase()}</div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={toggleTimer} className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all ${isRunning ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white'}`}>
                  {isRunning ? <Square size={18} /> : <Play size={18} />} {isRunning ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="px-4 py-3 rounded-2xl bg-slate-900 text-slate-300 font-bold">Reset</button>

                <div className="ml-4 flex items-center gap-2">
                  <button onClick={() => { if (!isRunning) { setCustomFocusMins('25'); setCustomBreakMins('5'); applyIntervals({ preventDefault: () => {} }); } }} className="px-3 py-2 rounded-full bg-slate-800 text-slate-300 text-xs">25/5</button>
                  <button onClick={() => { if (!isRunning) { setCustomFocusMins('50'); setCustomBreakMins('10'); applyIntervals({ preventDefault: () => {} }); } }} className="px-3 py-2 rounded-full bg-slate-800 text-slate-300 text-xs">50/10</button>
                  <button onClick={() => { if (!isRunning) { setCustomFocusMins('90'); setCustomBreakMins('15'); applyIntervals({ preventDefault: () => {} }); } }} className="px-3 py-2 rounded-full bg-slate-800 text-slate-300 text-xs">90/15</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-6 flex items-center justify-center gap-4">
          <div className="text-xs text-slate-400">Progress: <span className="font-black text-slate-100">{Math.round(progress)}%</span></div>
          <div className="w-2/3 bg-slate-900/30 h-2 rounded overflow-hidden">
            <div style={{ width: `${progress}%` }} className={`${isBreakMode ? 'bg-amber-400' : 'bg-teal-400'} h-full`} />
          </div>
        </div>
      </div>

      {/* Right: Settings & History */}
      <div className="glass-card p-6 rounded-3xl shadow-2xl border border-teal-500/12 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Session Settings</h3>
          <p className="text-xs text-slate-400">Customize your focus and break durations</p>
        </div>

        <form onSubmit={applyIntervals} className="flex flex-col gap-3">
          <label className="text-[11px] uppercase font-black text-teal-400">Focus (mins)</label>
          <input type="number" min="1" max="180" value={customFocusMins} onChange={e => setCustomFocusMins(e.target.value)} disabled={isRunning} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" />

          <label className="text-[11px] uppercase font-black text-amber-400">Break (mins)</label>
          <input type="number" min="1" max="180" value={customBreakMins} onChange={e => setCustomBreakMins(e.target.value)} disabled={isRunning} className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-md text-slate-100" />

          <div className="flex items-center gap-2 mt-2">
            <button type="submit" disabled={isRunning} className="px-4 py-2 bg-teal-600 text-white rounded-md font-bold">Apply</button>
            <button type="button" onClick={() => { setCustomFocusMins(String(Math.round(focusDuration/60))); setCustomBreakMins(String(Math.round(breakDuration/60))); }} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-md">Sync</button>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-200 mb-2">Recent Sessions</h4>
            <div className="space-y-2">
              {recentSessions.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No sessions completed today.</div>
              ) : (
                recentSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-slate-900/30 px-3 py-2 rounded-md border border-slate-800">
                    <div className="text-sm text-slate-100">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-xs font-black text-teal-400">+{s.duration_minutes}m</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

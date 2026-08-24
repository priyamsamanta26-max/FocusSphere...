import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bell, Plus, Trash2, Calendar, Volume2, Play, Square } from 'lucide-react';
import { startLoudAlarm, stopLoudAlarm } from '../utils/audioAlarm';

export default function Alarms({ user }) {
  const [alarms, setAlarms] = useState([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [timeHour, setTimeHour] = useState('08');
  const [timeMinute, setTimeMinute] = useState('00');
  const [timeAmpm, setTimeAmpm] = useState('AM');
  const [date, setDate] = useState('');
  const [displayDate, setDisplayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [displayDateFormatted, setDisplayDateFormatted] = useState(() => new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
  const [isTestingSound, setIsTestingSound] = useState(false);
  // if user edits the time/date manually, stop auto-syncing
  const [isTimeManual, setIsTimeManual] = useState(false);

  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return '';
    // timeStr expected like HH:MM or HH:MM:SS
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = (minutesStr || '00').substring(0, 2);
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    // initialize time and date selectors to current local time
    const now = new Date();
    let hh = now.getHours();
    const mm = now.getMinutes();
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12;
    hh = hh ? hh : 12; // convert 0 -> 12
    setTimeHour(hh.toString().padStart(2, '0'));
    setTimeMinute(mm.toString().padStart(2, '0'));
    setTimeAmpm(ampm);
    // initialize date to today (YYYY-MM-DD)
    const today = now.toISOString().split('T')[0];
    setDate(today);

    fetchAlarms();
  }, []);

  // Auto-sync time/date every second unless user has manually edited the controls
  useEffect(() => {
    if (isTimeManual) return;
    const sync = () => {
      const now = new Date();
      let hh = now.getHours();
      const mm = now.getMinutes();
      const ampm = hh >= 12 ? 'PM' : 'AM';
      hh = hh % 12; hh = hh ? hh : 12;
      setTimeHour(hh.toString().padStart(2, '0'));
      setTimeMinute(mm.toString().padStart(2, '0'));
      setTimeAmpm(ampm);
      setDate(now.toISOString().split('T')[0]);
    };
    sync();
    const t = setInterval(sync, 1000);
    return () => clearInterval(t);
  }, [isTimeManual]);

  // Keep a separate displayDate that always reflects the current local date
  useEffect(() => {
    // update displayDate (YYYY-MM-DD) and formatted date like dashboard every second to match dashboard timing
    const update = () => {
      const now = new Date();
      setDisplayDate(now.toISOString().split('T')[0]);
      setDisplayDateFormatted(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    update();
    const id = setInterval(update, 1000); // update every second to mirror dashboard
    return () => clearInterval(id);
  }, []);

  const fetchAlarms = async () => {
    const { data } = await supabase.from('alarms').select('*').order('created_at', { ascending: false });
    if (data) setAlarms(data);
  };

  const addAlarm = async (e) => {
    e.preventDefault();
    // build time from hour/minute/ampm
    if (!title || !timeHour || !timeMinute || !timeAmpm) return;

    let hh = parseInt(timeHour, 10);
    const mm = timeMinute.toString().padStart(2, '0');
    if (timeAmpm === 'PM' && hh < 12) hh += 12;
    if (timeAmpm === 'AM' && hh === 12) hh = 0;
    const hhStr = hh.toString().padStart(2, '0');
    const timeStr = `${hhStr}:${mm}`;

    const newAlarm = {
      user_id: user.id,
      title,
      alarm_time: timeStr + ':00',
      alarm_date: date || null,
      is_active: true
    };

    const { data, error } = await supabase.from('alarms').insert([newAlarm]).select();
    if (!error && data) {
      setAlarms([data[0], ...alarms]);
      setTitle('');
      setTime('');
      // reset selects to current time and date
      const nowReset = new Date();
      let hhReset = nowReset.getHours();
      const mmReset = nowReset.getMinutes();
      const ampmReset = hhReset >= 12 ? 'PM' : 'AM';
      hhReset = hhReset % 12; hhReset = hhReset ? hhReset : 12;
      setTimeHour(hhReset.toString().padStart(2, '0'));
      setTimeMinute(mmReset.toString().padStart(2, '0'));
      setTimeAmpm(ampmReset);
      setDate(nowReset.toISOString().split('T')[0]);
      setIsTimeManual(false);
    }
  };

  const toggleAlarm = async (id, isActive) => {
    await supabase.from('alarms').update({ is_active: !isActive }).eq('id', id);
    setAlarms(alarms.map(a => a.id === id ? { ...a, is_active: !isActive } : a));
  };

  const deleteAlarm = async (id) => {
    await supabase.from('alarms').delete().eq('id', id);
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const handleTestSound = () => {
    if (isTestingSound) {
      stopLoudAlarm();
      setIsTestingSound(false);
    } else {
      setIsTestingSound(true);
      startLoudAlarm();
      setTimeout(() => {
        stopLoudAlarm();
        setIsTestingSound(false);
      }, 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10 font-sans">
      {/* Top header: Big clock + controls */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-slate-900/40 to-slate-950/40 border border-teal-500/12 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-start">
            <div className="text-4xl font-extrabold tracking-tight text-slate-100 leading-none flex items-baseline gap-3">
              <span className="font-mono text-5xl">{timeHour}</span>
              <span className="font-mono text-5xl">:</span>
              <span className="font-mono text-5xl">{timeMinute}</span>
              <span className="text-sm ml-2 font-black uppercase text-teal-400">{timeAmpm}</span>
            </div>
            <div className="text-sm text-slate-400 mt-1">{displayDateFormatted} · Local Time</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestSound}
            className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-2 text-sm transition-all ${isTestingSound ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-900 text-amber-400 border border-amber-500/12'}`}>
            {isTestingSound ? <Square size={14} fill="currentColor" /> : <Play size={14} />} {isTestingSound ? 'Stop Test' : 'Test Sound'}
          </button>

          {/* quick helper showing current alarm count */}
          <div className="px-4 py-2 rounded-2xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 font-bold">
            {alarms.length} alarms
          </div>
        </div>
      </div>

      {/* Set Alarm Panel: left = big time selector, right = details */}
      <div className="glass-card p-6 rounded-3xl shadow-xl border border-teal-500/12 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="bg-slate-900/60 p-6 rounded-2xl w-full text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <select value={timeHour} onChange={e => { setTimeHour(e.target.value); setIsTimeManual(true); }} className="text-4xl font-mono bg-transparent outline-none appearance-none px-3">
                {Array.from({length:12}, (_,i)=> (i+1).toString().padStart(2,'0')).map(h=> (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-4xl font-mono">:</span>
              <select value={timeMinute} onChange={e => { setTimeMinute(e.target.value); setIsTimeManual(true); }} className="text-4xl font-mono bg-transparent outline-none appearance-none px-3">
                {Array.from({length:60}, (_,i)=> i.toString().padStart(2,'0')).map(m=> (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select value={timeAmpm} onChange={e => { setTimeAmpm(e.target.value); setIsTimeManual(true); }} className="ml-3 rounded-xl px-3 py-2 bg-slate-800/70">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <div className="text-xs text-slate-400">Select alarm time</div>
          </div>
        </div>

        <form onSubmit={addAlarm} className="md:col-span-2 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Alarm Title (e.g. Study: Chemistry)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 font-bold placeholder:text-slate-500"
            required
          />

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setIsTimeManual(true); }}
              className="px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 font-medium"
            />

            <button type="submit" className="ml-auto bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold">Set Alarm</button>
          </div>
        </form>
      </div>

      {/* Alarms list: tiles with big time */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configured Alarms</h3>
        <div className="grid grid-cols-1 gap-3">
          {alarms.length === 0 && (
            <div className="py-10 text-center text-slate-500 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <Bell size={40} className="mx-auto mb-2 text-slate-600 animate-pulse" />
              <p className="font-bold text-slate-400">No alarms set</p>
              <p className="text-xs mt-0.5">Add a new alarm using the panel above.</p>
            </div>
          )}

          {alarms.map(alarm => (
            <div key={alarm.id} className={`flex items-center justify-between p-4 rounded-xl border ${alarm.is_active ? 'bg-slate-900/50 border-teal-500/20' : 'bg-slate-950/20 border-slate-800/40'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-xl flex items-center justify-center font-mono text-2xl font-extrabold ${alarm.is_active ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {formatTo12Hour(alarm.alarm_time).split(' ')[0]}
                  <div className="text-xs mt-1 uppercase font-bold text-slate-300">{formatTo12Hour(alarm.alarm_time).split(' ')[1]}</div>
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-100 truncate">{alarm.title}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    {alarm.alarm_date ? (
                      <span className="flex items-center gap-1"><Calendar size={12} /> {alarm.alarm_date}</span>
                    ) : (
                      <span className="text-teal-300 font-bold uppercase">Daily</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => toggleAlarm(alarm.id, alarm.is_active)} className={`px-3 py-2 rounded-lg font-bold ${alarm.is_active ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{alarm.is_active ? 'Active' : 'Off'}</button>
                <button onClick={() => deleteAlarm(alarm.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

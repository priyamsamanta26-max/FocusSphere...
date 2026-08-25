// Forced HMR reload trigger
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, CheckSquare, Timer, Bell, 
  GraduationCap, Calculator, Music, LogOut, Plus, 
  Play, Pause, Disc, Sparkles, ChevronRight, Loader2,
  Menu, X, Gamepad2
} from 'lucide-react';

import { startLoudAlarm, stopLoudAlarm } from './utils/audioAlarm';
import { MusicProvider, useMusic } from './context/MusicContext';

import Dashboard from './views/Dashboard';
import Tasks from './views/Tasks';
import FocusTimer from './views/FocusTimer';
import Alarms from './views/Alarms';
import Exams from './views/Exams';
import SgpaCalc from './views/SgpaCalc';
import FocusMusic from './views/Music';
import FocusGames from './views/Games';
import Auth from './views/Auth';

function Sidebar({ onLogout, showMobile, closeMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { num: '01', name: 'Dashboard', path: '/', icon: <LayoutDashboard size={16} /> },
    { num: '02', name: 'Tasks backlog', path: '/tasks', icon: <CheckSquare size={16} /> },
    { num: '03', name: 'Focus Timer', path: '/timer', icon: <Timer size={16} /> },
    { num: '04', name: 'Smart Alarms', path: '/alarms', icon: <Bell size={16} /> },
    { num: '05', name: 'Exams planner', path: '/exams', icon: <GraduationCap size={16} /> },
    { num: '06', name: 'SGPA Calc', path: '/sgpa', icon: <Calculator size={16} /> },
    { num: '07', name: 'Focus Music', path: '/music', icon: <Music size={16} /> },
    { num: '08', name: 'Focus Games', path: '/games', icon: <Gamepad2 size={16} /> }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (closeMobile) closeMobile();
  };

  return (
    <aside className={`w-72 sidebar-new glass h-[calc(100vh-2rem)] m-4 rounded-[1.25rem] fixed flex flex-col z-40 shadow-2xl border border-slate-800/80 transition-transform duration-300 md:translate-x-0 ${
      showMobile ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand & collapse */}
      <div className="p-6 flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-650 flex items-center justify-center text-white font-extrabold">FS</div>
          <div>
            <div className="text-sm font-extrabold text-slate-100">FocusSphere</div>
            <div className="text-xs text-slate-400">Student Focus Hub</div>
          </div>
        </div>
        <button onClick={closeMobile} className="p-2 rounded-md text-slate-400 md:hidden">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button onClick={() => handleNavClick(item.path)} className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'active' : 'inactive'}`}>
                  <div className="icon text-slate-300">{item.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-100">{item.name}</div>
                  </div>
                  <div className="chev">{isActive ? <ChevronRight size={16} className="text-teal-300" /> : null}</div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-200">
            {/* avatar placeholder */}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-100">User</div>
            <div className="text-xs text-slate-500">Ready</div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full py-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/90 text-amber-500 hover:text-white transition-all"> <LogOut size={14} /> Logout</button>
      </div>
    </aside>
  );
}

function FloatingActionButton() {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate('/tasks')}
      title="Quick Add Task"
      className="fixed bottom-8 right-8 w-14 h-14 bg-teal-650 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-teal-500/20 hover:scale-110 active:scale-95 transition-all z-30 animate-float"
    >
      <Plus size={28} />
    </button>
  );
}

function BackgroundBlobs() {
  return (
    <div className="bg-blobs">
      <div className="blob-1 animate-float"></div>
      <div className="blob-2 animate-float-delayed"></div>
    </div>
  );
}

// Persistent Floating Music Mini-Player (Dark Mode)
function FloatingMusicBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const musicCtx = useMusic();

  if (!musicCtx || location.pathname === '/music' || !musicCtx.currentTrack) return null;
  const { currentTrack, isPlaying, togglePlayPause } = musicCtx;

  return (
    <div 
      className="fixed bottom-8 md:left-80 left-8 right-8 md:right-auto glass-card px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/20 flex items-center gap-4.5 z-30 animate-float group hover:scale-105 active:scale-98 transition-all"
      style={{ animationDuration: '8s' }}
    >
      {/* Spinning Artwork disk */}
      <div className="relative w-12 h-12 flex-shrink-0 cursor-pointer" onClick={() => navigate('/music')}>
        <img
          src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
          alt={currentTrack.title}
          className="w-full h-full object-cover rounded-xl shadow-md border border-slate-700"
        />
        {isPlaying && (
          <div className="absolute inset-0 bg-black/25 rounded-xl flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
            <Disc size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Track details */}
      <div className="max-w-[200px] text-xs cursor-pointer select-none" onClick={() => navigate('/music')}>
        <p className="font-bold text-slate-100 truncate">{currentTrack.title}</p>
        <p className="text-teal-400 font-bold truncate text-[11px] mt-0.5">{currentTrack.artist}</p>
      </div>

      {/* Control button */}
      <button
        onClick={(e) => { e.stopPropagation(); togglePlayPause && togglePlayPause(); }}
        className="w-10 h-10 rounded-full bg-teal-650 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 hover:scale-110 active:scale-95 transition-all"
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>
    </div>
  );
}

// Full-screen Loud Alarm Ringing Modal
function AlarmTriggerModal({ ringingAlarm, onDismiss }) {
  if (!ringingAlarm) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-8 rounded-3xl text-center border-4 border-amber-500 shadow-2xl animate-bounce">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-300 animate-pulse">
          <Bell size={40} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/35">
          🚨 ALARM RINGING NOW
        </span>
        <h2 className="text-3xl font-black text-slate-100 mt-4">{ringingAlarm.title}</h2>
        <p className="text-sm font-bold text-slate-400 mt-2 font-mono">
          Scheduled: {(() => {
            const [hoursStr, minutesStr] = ringingAlarm.alarm_time.split(':');
            let hours = parseInt(hoursStr, 10);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${hours.toString().padStart(2, '0')}:${minutesStr.substring(0, 2)} ${ampm}`;
          })()}
        </p>
        <p className="text-xs text-amber-450 font-bold mt-4 animate-pulse">
          Loud Speaker Siren Active!
        </p>

        <button
          onClick={onDismiss}
          className="mt-6 w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-amber-300 transition-all hover:scale-105"
        >
          STOP ALARM (SILENCE)
        </button>
      </div>
    </div>
  );
}

function MainLayout({ user, onLogout }) {
  const location = useLocation();
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const [triggeredIds, setTriggeredIds] = useState(new Set()); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/tasks': return 'Task Management';
      case '/timer': return 'Customizable Focus Timer';
      case '/alarms': return 'Smart Alarms & Reminders';
      case '/exams': return 'Examination Planner';
      case '/sgpa': return 'SGPA & Performance Calculator';
      case '/music': return 'Focus Music Station';
      case '/games': return 'Mind Focus Hub & Games';
      default: return 'FocusSphere';
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const triggeredIdsRef = useRef(new Set());

  useEffect(() => {
    let mounted = true;

    const checkAlarmTime = async () => {
      try {
        const { data: alarms } = await supabase.from('alarms').select('*').eq('is_active', true);
        if (!alarms || alarms.length === 0) return;

        const now = new Date();
        const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;

        alarms.forEach((alarm) => {
          const alarmHHMM = (alarm.alarm_time || '').substring(0, 5);
          const dateMatches = !alarm.alarm_date || alarm.alarm_date === currentDate;
          const alarmKey = `${alarm.id}_${alarmHHMM}_${currentDate}`;

          if (dateMatches && alarmHHMM === currentHHMM && !triggeredIdsRef.current.has(alarmKey)) {
            if (!mounted) return;
            console.info('Alarm triggered', alarmKey, alarm);
            try { startLoudAlarm(); } catch (e) { console.error('startLoudAlarm failed', e); }
            setRingingAlarm(alarm);
            triggeredIdsRef.current.add(alarmKey);
            setTriggeredIds(new Set(triggeredIdsRef.current));
          }
        });
      } catch (e) {
        console.error('Alarm check error:', e);
      }
    };

    const interval = setInterval(checkAlarmTime, 1000);
    checkAlarmTime();

    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const dismissAlarm = () => {
    stopLoudAlarm();
    setRingingAlarm(null);
  };

  return (
    <div className="flex h-screen relative selection:bg-teal-950 selection:text-teal-300">
      <BackgroundBlobs />
      
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-35 bg-black/60 backdrop-blur-sm md:hidden block"
        />
      )}

      <Sidebar onLogout={onLogout} showMobile={isSidebarOpen} closeMobile={() => setIsSidebarOpen(false)} />
      
      <main className="md:ml-[20rem] ml-0 flex-1 p-4 md:p-8 overflow-y-auto h-screen relative z-10">
        <header className="glass-card rounded-3xl px-4 md:px-8 py-4 md:py-5.5 mb-8 flex justify-between items-center shadow-lg border border-teal-500/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl border border-teal-500/25 text-teal-400 hover:bg-teal-500/10 md:hidden block"
            >
              <Menu size={20} />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 bg-teal-950/60 border border-teal-500/30 px-3 py-1 rounded-full">
                {getGreeting()}, Champ!
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-100 mt-1.5 uppercase">
                {getTitle()}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-555 via-teal-650 to-teal-750 shadow-lg shadow-teal-500/20 flex items-center justify-center text-white font-black border-2 border-slate-700">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log in as</p>
              <p className="text-xs font-bold text-slate-350 mt-0.5">{user.email}</p>
            </div>
          </div>
        </header>

        <div className="pb-24">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/tasks" element={<Tasks user={user} />} />
            <Route path="/timer" element={<FocusTimer user={user} />} />
            <Route path="/alarms" element={<Alarms user={user} />} />
            <Route path="/exams" element={<Exams user={user} />} />
            <Route path="/sgpa" element={<SgpaCalc user={user} />} />
            <Route path="/music" element={<FocusMusic user={user} />} />
            <Route path="/games" element={<FocusGames user={user} />} />
            <Route path="/preview-dashboard" element={<Dashboard user={{ email: 'preview@local', id: 'preview' }} />} />
            <Route path="*" element={<Dashboard user={user} />} />
          </Routes>
        </div>
      </main>

      <FloatingMusicBar />
      <FloatingActionButton />
      <AlarmTriggerModal ringingAlarm={ringingAlarm} onDismiss={dismissAlarm} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen flex-col justify-center items-center text-teal-650 gap-4 bg-[#090b11]">
        <Loader2 size={48} className="animate-spin text-teal-500" />
        <span className="font-bold tracking-widest text-xs uppercase animate-pulse text-slate-300">Loading FocusSphere...</span>
      </div>
    );
  }

  return (
    <Router>
      <MusicProvider>
        {!session ? (
          <Auth />
        ) : (
          <MainLayout user={session.user} onLogout={() => supabase.auth.signOut()} />
        )}
      </MusicProvider>
    </Router>
  );
}

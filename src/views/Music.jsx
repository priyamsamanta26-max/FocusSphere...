import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { 
  Search, Play, Pause, SkipBack, SkipForward, 
  Repeat, Shuffle, Volume2, VolumeX, Music, Disc, 
  ListMusic, Radio, Clock, Loader2, Sparkles,
  Flame, Moon, Sun, Wind, Coffee
} from 'lucide-react';

const POPULAR_SEARCHES = [
  'Lofi Study Chill',
  'Taylor Swift Cruel Summer',
  'Coldplay Viva La Vida',
  'Arijit Singh Kesariya',
  'Interstellar Main Theme',
  'Ludovico Einaudi Nuvole Bianche',
  'Chopin Nocturne',
  'The Weeknd Starboy',
  'Imagine Dragons Believer',
  'Ed Sheeran Shape of You'
];

const MOODS = [
  { name: 'Lofi Study', query: 'Lofi Chill Study Beats', icon: <Coffee size={14} className="text-amber-400" /> },
  { name: 'Deep Focus', query: 'Deep Focus Ambient', icon: <Moon size={14} className="text-teal-400" /> },
  { name: 'Rain & Ambient', query: 'Rain Nature Soundscape', icon: <Wind size={14} className="text-teal-500" /> },
  { name: 'Acoustic Study', query: 'Acoustic Instrumental Piano Guitar', icon: <Sun size={14} className="text-amber-500" /> },
  { name: 'Synthwave Focus', query: 'Synthwave Study Chill', icon: <Flame size={14} className="text-rose-400" /> }
];

export default function FocusMusic() {
  const {
    searchResults,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isAutoRandom,
    isLooping,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchMusic,
    playTrack,
    togglePlayPause,
    seekTime,
    changeVolume,
    toggleLoop,
    toggleAutoRandom,
    unlockAudio,
    audioUnlocked,
    playNextTrack,
    playPrevTrack,
    playRandomNextSong
  } = useMusic();

  const [inputVal, setInputVal] = useState(searchQuery || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchQuery(inputVal);
      searchMusic(inputVal);
    }
  };

  const handlePresetClick = (term) => {
    setInputVal(term);
    setSearchQuery(term);
    searchMusic(term);
  };

  const formatSeconds = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl space-y-8 pb-28 font-sans">
      {/* Premium Search Header Bar */}
      <div className="relative overflow-hidden glass-card p-8 rounded-[2.5rem] shadow-2xl border border-teal-500/15">
        {/* Decorative background glow blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 z-10">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-100 via-teal-350 to-teal-400 bg-clip-text text-transparent flex items-center gap-2.5 uppercase tracking-wide">
              <Music className="text-teal-400 animate-bounce" size={24} /> Focus Audio Hub
            </h3>
            <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
              Search any song on earth to play the <strong className="text-teal-400">100% full song</strong> directly with pure audio layout.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auto-Play Random Toggle Button */}
            <button
              onClick={toggleAutoRandom}
              className={`px-4.5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all duration-300 shadow-sm border ${
                isAutoRandom 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-650 text-white border-teal-500 shadow-teal-950/45 hover:brightness-105' 
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
              }`}
              title="Automatically plays another random song when the current track finishes"
            >
              <Shuffle size={14} className={isAutoRandom ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
              Auto-Shuffle: {isAutoRandom ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={playRandomNextSong}
              className="px-4.5 py-2.5 bg-teal-605 hover:bg-teal-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
            >
              <Sparkles size={14} /> Play Random
            </button>

            {!audioUnlocked && (
              <>
                <button
                  onClick={unlockAudio}
                  className="px-4.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                  title="Enable audio playback in this tab (click once to unlock browser audio)"
                >
                  Enable Sound
                </button>

                <button
                  onClick={() => {
                    // small test beep to ensure audio context unlocked
                    try {
                      const AC = window.AudioContext || window.webkitAudioContext;
                      if (!AC) return;
                      const ctx = new AC();
                      const o = ctx.createOscillator();
                      const g = ctx.createGain();
                      o.type = 'sine';
                      o.frequency.value = 880;
                      g.gain.setValueAtTime(0.0001, ctx.currentTime);
                      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
                      o.connect(g);
                      g.connect(ctx.destination);
                      o.start();
                      setTimeout(() => {
                        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
                        try { o.stop(); } catch (e) {}
                        try { ctx.close(); } catch (e) {}
                      }, 300);
                    } catch (e) {}
                  }}
                  className="px-4.5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-lg shadow-slate-500/10 transition-all hover:scale-105"
                  title="Play a short test sound"
                >
                  Test Sound
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex gap-3 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search any song, artist, band, album (e.g. 'Taylor Swift', 'Coldplay')..."
              className="w-full pl-12.5 pr-4 py-4 bg-slate-900/90 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 outline-none text-slate-100 font-bold placeholder:text-slate-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-teal-605 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Search
          </button>
        </form>

        {/* Mood Selector Pills */}
        <div className="flex items-center gap-2.5 mt-6 overflow-x-auto pb-1 scrollbar-none z-10 relative">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap mr-1">
            Moods:
          </span>
          {MOODS.map((mood) => (
            <button
              key={mood.name}
              onClick={() => handlePresetClick(mood.query)}
              className="px-4 py-2 bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-teal-405 rounded-2xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm hover:scale-105"
            >
              {mood.icon}
              {mood.name}
            </button>
          ))}
        </div>
      </div>

      {/* Futuristic Floating Glass Audio Deck */}
      {currentTrack && (
        <div className="relative overflow-hidden glass-card p-10 rounded-[2.5rem] shadow-2xl border border-teal-500/15 bg-slate-900/40 backdrop-blur-xl animate-float">
          {/* Ambient Glowing Aura */}
          <div className="absolute top-1/2 left-10 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
            {/* Premium Sliding Vinyl & Cover Art */}
            <div className="relative w-60 h-60 flex-shrink-0 flex items-center justify-center">
              {/* Sleeve Shadow / Glow */}
              <div className="absolute inset-0 bg-teal-500/5 rounded-3xl blur-xl" />

              {/* Vinyl Record Disc */}
              <div 
                className={`absolute w-52 h-52 bg-slate-950 rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-900 transition-all duration-700 z-0 ${
                  isPlaying ? 'translate-x-12 animate-spin' : 'translate-x-0'
                }`}
                style={{ animationDuration: '6s' }}
              >
                {/* Vinyl grooves */}
                <div className="absolute inset-4 rounded-full border border-slate-900/40 opacity-70" />
                <div className="absolute inset-8 rounded-full border border-slate-900/40 opacity-70" />
                <div className="absolute inset-12 rounded-full border border-slate-900/40 opacity-70" />
                <div className="absolute inset-16 rounded-full border border-slate-900/40 opacity-70" />
                {/* Center sticker */}
                <div className="w-16 h-16 bg-teal-700 border-4 border-slate-900 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white shadow-inner" />
                </div>
              </div>

              {/* Album Cover Card (Sleeve) */}
              <div className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-xl border-4 border-slate-800 z-10 bg-slate-900 flex-shrink-0">
                <img
                  src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Visualizer bars */}
                {isPlaying && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-center gap-1.5 h-12 pointer-events-none">
                    {[...Array(9)].map((_, i) => (
                      <span 
                        key={i} 
                        className="w-1.5 bg-teal-400/90 rounded-full animate-bounce"
                        style={{ 
                          height: '100%',
                          animationDuration: `${0.6 + i * 0.15}s`,
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Controls, Waveform & Track Details */}
            <div className="flex-1 w-full flex flex-col justify-between space-y-6 lg:pl-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-teal-950/60 border border-teal-500/30 text-teal-400 rounded-full">
                  {currentTrack.genre || 'Exact Match'}
                </span>
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100 mt-3 line-clamp-1">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-bold text-teal-400 mt-0.5">
                  {currentTrack.artist}
                </p>
                <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                  Album: {currentTrack.album}
                </p>
              </div>

              {/* Audio Waveform Equalizer */}
              <div className="h-10 flex items-center justify-between gap-1 w-full px-1">
                {[...Array(38)].map((_, i) => {
                  const baseHeight = 15 + Math.sin(i * 0.5) * 15;
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying ? 'bg-teal-450 animate-pulse' : 'bg-slate-700'
                      }`}
                      style={{
                        height: isPlaying ? `${Math.max(10, Math.random() * 32 + 8)}px` : `${baseHeight}px`,
                        animationDelay: `${i * 0.04}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress Seek Bar */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-mono font-black text-slate-400">
                  <span>{formatSeconds(currentTime)}</span>
                  <span className="px-2 py-0.5 bg-teal-955 text-teal-455 rounded-md border border-teal-900/40">
                    {formatSeconds(duration || currentTrack.duration || 210)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || currentTrack.duration || 210}
                  step="1"
                  value={currentTime || 0}
                  onChange={(e) => seekTime(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-500 outline-none"
                />
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                {/* Loop Mode */}
                <button
                  onClick={toggleLoop}
                  className={`p-3.5 rounded-2xl transition-all duration-300 border ${
                    isLooping 
                      ? 'bg-teal-605 text-white border-teal-500 shadow-md shadow-teal-950/40' 
                      : 'bg-slate-900 text-slate-500 border-slate-850 hover:text-slate-205'
                  }`}
                  title={isLooping ? 'Single song loop enabled' : 'Loop off'}
                >
                  <Repeat size={18} />
                </button>

                {/* Playback Buttons */}
                <div className="flex items-center gap-5">
                  <button
                    onClick={playPrevTrack}
                    className="p-4 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-teal-400 rounded-2xl shadow-sm border border-slate-800 transition-all hover:scale-105 active:scale-95"
                    title="Previous Song"
                  >
                    <SkipBack size={20} />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="w-16 h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-teal-500/20 hover:scale-110 active:scale-95 transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                  </button>

                  <button
                    onClick={playNextTrack}
                    className="p-4 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-teal-400 rounded-2xl shadow-sm border border-slate-800 transition-all hover:scale-105 active:scale-95"
                    title="Next Song"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => changeVolume(volume === 0 ? 0.85 : 0)}
                    className="text-slate-550 hover:text-teal-400 transition-all"
                  >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Song Search Results Grid */}
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl border border-teal-500/15">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <ListMusic className="text-teal-450" size={24} />
            Search Results ({searchResults.length})
          </h4>
          <span className="text-xs font-semibold text-slate-500">
            Click any song to stream immediately
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-teal-450 flex flex-col items-center gap-3">
            <Loader2 size={40} className="animate-spin" />
            <p className="font-bold text-xs tracking-wider uppercase">Loading matching tracks...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Music size={48} className="mx-auto mb-3 text-slate-600 animate-pulse" />
            <p className="font-bold text-slate-400">No songs found for "{searchQuery}"</p>
            <p className="text-xs mt-1">Try another song title or artist above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-300 border ${
                    isCurrent
                      ? 'bg-gradient-to-r from-teal-650 to-teal-750 text-white shadow-xl shadow-teal-500/20 border-teal-600 scale-[1.02]'
                      : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border-slate-800/80 hover:shadow-2xl hover:border-teal-500/35'
                  }`}
                >
                  {/* Artwork */}
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={track.artwork}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Disc size={18} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Song Details */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs uppercase tracking-wider truncate">
                      {track.title}
                    </h5>
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-teal-200' : 'text-slate-550'}`}>
                      {track.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full inline-block ${
                        isCurrent ? 'bg-teal-950/60 text-teal-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {track.genre}
                      </span>
                      <span className={`text-[9px] font-bold flex items-center gap-1 ${
                        isCurrent ? 'text-teal-300' : 'text-slate-550'
                      }`}>
                        <Clock size={10} /> {formatSeconds(track.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Play/Pause indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isCurrent ? 'bg-white text-teal-600' : 'bg-slate-800 text-teal-400 hover:scale-105'
                  }`}>
                    {isCurrent && isPlaying ? (
                      <Disc size={18} className="animate-spin" />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

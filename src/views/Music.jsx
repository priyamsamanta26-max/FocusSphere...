import React, { useState } from 'react';
import { 
  Search, Play, Pause, Shuffle, Disc, 
  SkipForward, SkipBack, Music, Volume2, 
  Repeat, Loader2, Heart, Sparkles, CheckCircle2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

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
    isAutoplay,
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
    toggleAutoplay,
    unlockAudio,
    audioUnlocked,
    playNextTrack,
    playPrevTrack,
    playRandomNextSong
  } = useMusic();

  const [inputVal, setInputVal] = useState(searchQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      searchMusic(inputVal.trim());
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Search Bar section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              placeholder="Search artist, lofi track, focus instrumentals..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full bg-slate-900/90 hover:bg-slate-850 focus:bg-slate-950/90 text-slate-100 placeholder-slate-450 pl-14 pr-6 py-4.5 rounded-[2rem] border-2 border-slate-800 focus:border-teal-500/80 outline-none transition-all duration-300 shadow-inner text-sm font-semibold focus:shadow-teal-950/20"
            />
            <Search className="absolute left-5.5 top-1/2 -translate-y-1/2 text-slate-450 group-focus-within:text-teal-400 transition-colors" size={20} />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-teal-500 to-teal-650 hover:from-teal-500 hover:to-teal-600 disabled:from-slate-800 disabled:to-slate-850 text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer select-none"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
            </button>
          </form>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3.5 ml-4">
            Powered by Apple iTunes API & YouTube Web Services
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Play random shortcut */}
          <button
            onClick={playRandomNextSong}
            className="px-4.5 py-2.5 bg-gradient-to-r from-teal-500/10 to-teal-650/15 hover:from-teal-500 hover:to-teal-600 text-teal-350 hover:text-white rounded-2xl font-black text-xs flex items-center gap-1.5 border border-teal-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles size={14} /> Play Random
          </button>

          {/* Autoplay Next toggle */}
          <button
            onClick={toggleAutoplay}
            className={`px-4.5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all duration-300 border cursor-pointer ${
              isAutoplay 
                ? 'bg-gradient-to-r from-teal-500 to-teal-650 text-white border-teal-500 shadow-lg shadow-teal-950/40' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
            }`}
            title="Automatically play the next song in list sequentially"
          >
            <Repeat size={14} className={isAutoplay ? 'animate-pulse' : ''} />
            Autoplay: {isAutoplay ? 'ON' : 'OFF'}
          </button>

          {/* Auto Shuffle toggle */}
          <button
            onClick={toggleAutoRandom}
            className={`px-4.5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all duration-300 border cursor-pointer ${
              isAutoRandom 
                ? 'bg-gradient-to-r from-teal-500 to-teal-650 text-white border-teal-500 shadow-lg shadow-teal-950/40' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
            }`}
            title="Automatically play a random song next"
          >
            <Shuffle size={14} className={isAutoRandom ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
            Auto-Shuffle: {isAutoRandom ? 'ON' : 'OFF'}
          </button>

          {!audioUnlocked && (
            <button
              onClick={unlockAudio}
              className="px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 cursor-pointer"
            >
              Enable Sound
            </button>
          )}
        </div>
      </div>

      {/* Split Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Premium Active Player Deck */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative overflow-hidden glass-card p-8 rounded-[2.5rem] shadow-2xl border border-teal-500/10 bg-slate-900/40 backdrop-blur-xl">
            {/* Decorative aura */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {currentTrack ? (
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                
                {/* Spinning Vinyl Record Visual */}
                <div className="relative w-56 h-56 flex items-center justify-center">
                  {/* Vinyl Plate */}
                  <div 
                    className={`absolute w-48 h-48 bg-slate-950 rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-900/90 transition-transform duration-700 z-0 ${
                      isPlaying ? 'translate-x-10 animate-spin' : 'translate-x-0'
                    }`}
                    style={{ animationDuration: '8s' }}
                  >
                    <div className="absolute inset-2 rounded-full border border-slate-900/20" />
                    <div className="absolute inset-4 rounded-full border border-slate-900/20" />
                    <div className="absolute inset-6 rounded-full border border-slate-900/20" />
                    <div className="absolute w-14 h-14 bg-slate-900 border-4 border-slate-950 rounded-full" />
                  </div>

                  {/* Album Cover sleeve */}
                  <div className={`relative w-44 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 z-10 transition-transform duration-500 ${
                    isPlaying ? '-rotate-3 scale-98 shadow-teal-500/5' : 'rotate-0 scale-100'
                  }`}>
                    <img 
                      src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'} 
                      alt={currentTrack.title} 
                      className="w-full h-full object-cover"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-teal-400 gap-2">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-[9px] font-black uppercase tracking-widest font-mono">Caching Stream</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-1 select-none">
                  <h3 className="text-xl font-extrabold text-slate-100 tracking-tight leading-snug truncate max-w-[280px]">
                    {currentTrack.title}
                  </h3>
                  <p className="text-teal-400 text-sm font-bold truncate max-w-[240px]">
                    {currentTrack.artist}
                  </p>
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-950/65 px-3 py-1 rounded-full border border-slate-800/80">
                    {currentTrack.album || 'Single'}
                  </span>
                </div>

                {/* Progress bar Slider */}
                <div className="w-full space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime || 0}
                    onChange={(e) => seekTime && seekTime(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[11px] font-black text-slate-450 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Core Player Controls deck */}
                <div className="flex items-center gap-6.5 justify-center">
                  <button 
                    onClick={playPrevTrack}
                    className="p-3 text-slate-400 hover:text-teal-450 hover:bg-slate-850/60 rounded-full transition-all active:scale-90 cursor-pointer"
                  >
                    <SkipBack size={20} fill="currentColor" />
                  </button>

                  <button 
                    onClick={togglePlayPause}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 text-white flex items-center justify-center shadow-xl shadow-teal-500/20 hover:scale-108 active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>

                  <button 
                    onClick={playNextTrack}
                    className="p-3 text-slate-400 hover:text-teal-450 hover:bg-slate-850/60 rounded-full transition-all active:scale-90 cursor-pointer"
                  >
                    <SkipForward size={20} fill="currentColor" />
                  </button>
                </div>

                {/* Volume slider control */}
                <div className="w-full flex items-center gap-3 pt-3 border-t border-slate-800/40">
                  <Volume2 size={16} className="text-slate-450 flex-shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-450 font-mono w-8 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 gap-4 select-none">
                <Music size={48} className="text-slate-700 animate-pulse" />
                <p className="text-sm font-bold uppercase tracking-wider">No active track selected</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Search Results list */}
        <div className="lg:col-span-7 glass-card p-6 rounded-[2.5rem] border border-teal-500/10">
          <div className="flex justify-between items-center mb-5 px-2 select-none">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Search Results</h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-500/25 flex items-center gap-1.5">
              <CheckCircle2 size={10} /> {searchResults.length} Songs Loaded
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {searchResults.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`group p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                    isCurrent
                      ? 'bg-teal-950/30 border-teal-500/35 shadow-lg shadow-teal-950/20'
                      : 'bg-slate-900/60 border-slate-850 hover:bg-slate-850/80 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Small Art preview */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-inner flex-shrink-0 border border-slate-800">
                      <img 
                        src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'} 
                        alt={track.title} 
                        className="w-full h-full object-cover" 
                      />
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-teal-950/60 flex items-center justify-center">
                          <Disc size={16} className="text-teal-400 animate-spin" style={{ animationDuration: '4s' }} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 select-none">
                      <p className={`text-sm font-bold truncate group-hover:text-teal-400 transition-colors max-w-[240px] md:max-w-[340px] ${
                        isCurrent ? 'text-teal-350' : 'text-slate-100'
                      }`}>
                        {track.title}
                      </p>
                      <p className="text-xs font-semibold text-slate-450 truncate mt-0.5 max-w-[200px]">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 font-mono select-none">
                      {formatTime(track.duration)}
                    </span>
                    <button className="p-2 text-slate-650 hover:text-rose-500 transition-colors">
                      <Heart size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

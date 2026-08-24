import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { 
  Search, Play, Pause, SkipBack, SkipForward, 
  Repeat, Shuffle, Volume2, VolumeX, Music, Disc, 
  ListMusic, Clock, Loader2, Sparkles,
  Flame, Moon, Sun, Wind, Coffee
} from 'lucide-react';

const MOODS = [
  { name: 'Lofi Study', query: 'Lofi Chill Study Beats', icon: <Coffee size={12} className="text-amber-400" /> },
  { name: 'Deep Focus', query: 'Deep Focus Ambient', icon: <Moon size={12} className="text-teal-455" /> },
  { name: 'Rain Sounds', query: 'Rain Nature Soundscape', icon: <Wind size={12} className="text-teal-500" /> },
  { name: 'Acoustic Study', query: 'Acoustic Instrumental Piano Guitar', icon: <Sun size={12} className="text-amber-500" /> },
  { name: 'Synthwave Focus', query: 'Synthwave Study Chill', icon: <Flame size={12} className="text-rose-400" /> }
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
    <div className="max-w-7xl mx-auto space-y-8 pb-28 font-sans">
      
      {/* Page Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-slate-100 to-teal-450 bg-clip-text text-transparent uppercase tracking-wider flex items-center gap-3">
            <Music className="text-teal-400 animate-pulse" size={28} />
            Focus Audio Hub
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
            Stream full-length audio tracks, focus beats, and ambient soundscapes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Play random shortcut */}
          <button
            onClick={playRandomNextSong}
            className="px-4.5 py-2.5 bg-gradient-to-r from-teal-500/10 to-teal-650/15 hover:from-teal-500 hover:to-teal-600 text-teal-355 hover:text-white rounded-2xl font-black text-xs flex items-center gap-1.5 border border-teal-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles size={14} /> Play Random
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
                    <div className="absolute inset-8 rounded-full border border-slate-900/20" />
                    <div className="w-14 h-14 rounded-full bg-teal-700 border-4 border-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-100" />
                    </div>
                  </div>

                  {/* Album Art Cover (Sleeve) */}
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800/90 z-10 bg-slate-900">
                    <img
                      src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Visualizer bars */}
                    {isPlaying && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-center gap-1 h-8 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <span 
                            key={i} 
                            className="w-1 bg-teal-400 rounded-full animate-bounce"
                            style={{ 
                              height: '100%',
                              animationDuration: `${0.5 + i * 0.12}s`,
                              animationDelay: `${i * 0.04}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="w-full">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-teal-950/60 border border-teal-500/20 text-teal-400 rounded-full">
                    {currentTrack.genre || 'Exact Match'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mt-3 truncate px-4 uppercase tracking-wide">
                    {currentTrack.title}
                  </h3>
                  <p className="text-xs font-bold text-teal-400 mt-0.5 truncate">
                    {currentTrack.artist}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase tracking-wider truncate">
                    Source: {currentTrack.album}
                  </p>
                </div>

                {/* Equalizer Audio Waves */}
                <div className="h-8 flex items-center justify-center gap-0.5 w-full max-w-[240px]">
                  {[...Array(24)].map((_, i) => {
                    const baseHeight = 6 + Math.sin(i * 0.8) * 6;
                    return (
                      <div
                        key={i}
                        className={`w-0.5 rounded-full transition-all duration-300 ${
                          isPlaying ? 'bg-teal-400 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{
                          height: isPlaying ? `${Math.max(4, Math.random() * 20 + 4)}px` : `${baseHeight}px`,
                          animationDelay: `${i * 0.03}s`,
                          animationDuration: '0.7s'
                        }}
                      />
                    );
                  })}
                </div>

                {/* Progress Slider */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 px-1">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>{formatSeconds(duration || currentTrack.duration || 210)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || currentTrack.duration || 210}
                    step="1"
                    value={currentTime || 0}
                    onChange={(e) => seekTime(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 outline-none"
                  />
                </div>

                {/* Player Controllers */}
                <div className="w-full flex items-center justify-between pt-2">
                  {/* Loop */}
                  <button
                    onClick={toggleLoop}
                    className={`p-3 rounded-xl transition-all duration-300 border cursor-pointer ${
                      isLooping 
                        ? 'bg-teal-500/10 text-teal-450 border-teal-500/30 shadow' 
                        : 'bg-slate-900/60 text-slate-500 border-slate-850 hover:text-slate-300'
                    }`}
                    title={isLooping ? 'Loop Enabled' : 'Loop Off'}
                  >
                    <Repeat size={16} />
                  </button>

                  {/* Navigation Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={playPrevTrack}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-teal-405 rounded-xl border border-slate-800 transition-all hover:scale-105 cursor-pointer"
                      title="Previous Track"
                    >
                      <SkipBack size={16} />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      className="w-12 h-12 bg-teal-650 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button
                      onClick={playNextTrack}
                      className="p-3 bg-slate-900/80 hover:bg-slate-805 text-slate-300 hover:text-teal-405 rounded-xl border border-slate-800 transition-all hover:scale-105 cursor-pointer"
                      title="Next Track"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeVolume(volume === 0 ? 0.85 : 0)}
                      className="text-slate-550 hover:text-teal-400 transition-all cursor-pointer"
                    >
                      {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <Music size={40} className="text-slate-700 mb-1 animate-pulse" />
                <p className="font-bold text-xs uppercase tracking-wider text-slate-400">No active track selected</p>
                <p className="text-[10px]">Select a song from the list to start streaming.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Search, Moods & Tracks Catalog */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Search Panel */}
          <div className="glass-card p-6 rounded-[2rem] shadow-xl border border-slate-800/80">
            <form onSubmit={handleSearchSubmit} className="relative flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Search any song, artist, band, album..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-100 font-bold placeholder:text-slate-500 text-xs shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-teal-605 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Search
              </button>
            </form>

            {/* Grid Mood Board */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.name}
                  type="button"
                  onClick={() => handlePresetClick(mood.query)}
                  className="p-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-teal-400 rounded-xl text-[10px] font-bold border border-slate-850 hover:border-teal-500/20 flex flex-col items-center gap-1.5 text-center transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {mood.icon}
                  </div>
                  <span className="truncate w-full">{mood.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tracks Catalog Panel */}
          <div className="glass-card p-6 rounded-[2rem] shadow-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/50">
              <h4 className="text-xs font-black text-slate-100 flex items-center gap-2 uppercase tracking-widest">
                <ListMusic className="text-teal-405" size={16} />
                Catalog List ({searchResults.length})
              </h4>
              <span className="text-[10px] font-bold text-slate-500">
                Select to stream
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-teal-400 flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin" />
                <p className="font-bold text-[10px] tracking-widest uppercase">Loading catalog tracks...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
                <Music size={36} className="text-slate-700 mb-2 animate-pulse" />
                <p className="font-bold text-xs text-slate-400">No songs found for "{searchQuery}"</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Try search terms like 'Lofi', 'Study Beats', or an artist's name.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {searchResults.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 border ${
                        isCurrent
                          ? 'bg-gradient-to-r from-teal-550/10 to-teal-650/15 border-teal-500/30 text-white shadow-sm'
                          : 'bg-slate-950/40 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-900/80 hover:border-slate-850'
                      }`}
                    >
                      {/* Index */}
                      <span className="w-5 text-center text-[10px] font-mono text-slate-500 font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Artwork */}
                      <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && isPlaying && (
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <Disc size={14} className="text-teal-450 animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Song Details */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs uppercase tracking-wide truncate text-slate-200">
                          {track.title}
                        </h5>
                        <p className={`text-[10px] font-bold truncate mt-0.5 ${isCurrent ? 'text-teal-450' : 'text-slate-550'}`}>
                          {track.artist}
                        </p>
                      </div>

                      {/* Genre Tag */}
                      <span className={`hidden sm:inline-block text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        isCurrent ? 'bg-teal-950/65 text-teal-400' : 'bg-slate-900 text-slate-650'
                      }`}>
                        {track.genre || 'Focus'}
                      </span>

                      {/* Duration */}
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {formatSeconds(track.duration)}
                      </span>

                      {/* Inline play status */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrent ? 'bg-teal-500 text-white' : 'bg-slate-900/80 text-teal-400 hover:scale-105'
                      }`}>
                        {isCurrent && isPlaying ? (
                          <Disc size={14} className="animate-spin" />
                        ) : (
                          <Play size={12} fill="currentColor" className="ml-0.5" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

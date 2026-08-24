import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);
  const [volume, setVolume] = useState(0.85);
  const [isAutoRandom, setIsAutoRandom] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Lofi Study Chill');
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const ytPlayerRef = useRef(null);
  const isPlayerReadyRef = useRef(false);
  const searchResultsRef = useRef([]);
  const currentTrackRef = useRef(null);
  const isAutoRandomRef = useRef(true);
  const isLoopingRef = useRef(false);
  // HTMLAudio fallback for reliable playback (iTunes previewUrl)
  const audioRef = useRef(null);
  const currentSourceRef = useRef('yt'); // 'yt' or 'audio'
  const audioReadyRef = useRef(false);
  searchResultsRef.current = searchResults;
  currentTrackRef.current = currentTrack;
  isAutoRandomRef.current = isAutoRandom;
  isLoopingRef.current = isLooping;

  // Initialize YouTube Player
  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player && !ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player('yt-bg-player', {
          height: '200',
          width: '200',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              isPlayerReadyRef.current = true;
              event.target.setVolume(Math.round(volume * 100));
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                if (isLoopingRef.current) {
                  event.target.seekTo(0);
                  event.target.playVideo();
                } else if (isAutoRandomRef.current) {
                  playRandomNextSong();
                } else {
                  playNextTrack();
                }
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      
      // Load YouTube API script if not loaded
      if (!document.getElementById('yt-iframe-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    // Smooth progress tracker (polls active source every 250ms)
    const interval = setInterval(() => {
      if (currentSourceRef.current === 'audio' && audioRef.current) {
        try {
          const audio = audioRef.current;
          const curr = audio.currentTime || 0;
          const dur = audio.duration || 0;
          setCurrentTime(curr);
          if (dur > 0 && dur !== Infinity) setDuration(dur);
        } catch (e) {}
        return;
      }

      const player = ytPlayerRef.current;
      if (player && isPlayerReadyRef.current && typeof player.getCurrentTime === 'function') {
        try {
          const curr = player.getCurrentTime() || 0;
          const dur = player.getDuration() || 0;
          setCurrentTime(curr);
          if (dur > 0) {
            setDuration(dur);
          }
        } catch (e) {}
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // HTMLAudio fallback and event wiring for previews
  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    const onTime = () => {
      try {
        setCurrentTime(audio.currentTime || 0);
        if (audio.duration && audio.duration > 0) setDuration(audio.duration);
      } catch (e) {}
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (isLoopingRef.current) {
        try { audio.currentTime = 0; audio.play(); } catch (e) {}
      } else if (isAutoRandomRef.current) {
        playRandomNextSong();
      } else {
        playNextTrack();
      }
    };

    const onLoaded = () => {
      audioReadyRef.current = true;
      try { if (audio.duration) setDuration(audio.duration); } catch (e) {}
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoaded);
      try { audio.pause(); audio.src = ''; } catch (e) {}
    };
  }, []);

  // List of public Invidious instances for robust search queries
  const INVIDIOUS_INSTANCES = [
    'https://yewtu.be',
    'https://invidious.lunar.icu',
    'https://invidious.projectsegfau.lt',
    'https://inv.tux.im',
    'https://invidious.flokinet.to'
  ];

  // Search songs globally
  const searchMusic = async (term) => {
    if (!term || !term.trim()) return;
    setIsLoading(true);
    const q = term.trim();
    setSearchQuery(q);

    let tracks = [];
    let searchSuccessful = false;

    // Try Invidious search first to retrieve direct full-length YouTube videoIds
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const url = `${instance}/api/v1/search?q=${encodeURIComponent(q + ' audio')}&type=video`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            tracks = data.map((item) => {
              const duration = item.lengthSeconds || 240;
              return {
                id: item.videoId,
                title: item.title,
                artist: item.author || 'YouTube Audio',
                album: 'YouTube Stream',
                artwork: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
                genre: 'Study Focus',
                duration: duration,
                previewUrl: null, // Plays via loadVideoById in YouTube Player
                query: item.videoId
              };
            });
            searchSuccessful = true;
            break;
          }
        }
      } catch (err) {
        console.warn(`Invidious instance ${instance} search failed, trying next...`, err);
      }
    }

    // Fallback to iTunes Search API if Invidious is unavailable or rate-limited
    if (!searchSuccessful) {
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=30`
        );
        const data = await res.json();

        if (data && data.results && data.results.length > 0) {
          tracks = data.results.map((item) => {
            const rawDuration = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210;
            const artwork = item.artworkUrl100
              ? item.artworkUrl100.replace('100x100bb', '600x600bb')
              : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

            return {
              id: String(item.trackId || item.collectionId || Math.random()),
              title: item.trackName || q,
              artist: item.artistName || 'Artist',
              album: item.collectionName || 'Single',
              artwork: artwork,
              genre: item.primaryGenreName || 'Music',
              duration: rawDuration,
              previewUrl: item.previewUrl || null,
              query: `${item.trackName} ${item.artistName} audio`
            };
          });
          searchSuccessful = true;
        }
      } catch (err) {
        console.error('iTunes search fallback error:', err);
      }
    }

    // Final hard fallback if everything is offline
    if (tracks.length === 0) {
      tracks = [
        {
          id: 'exact_' + Date.now(),
          title: q,
          artist: 'Exact Search Result',
          album: 'Full Duration Track',
          artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
          genre: 'Music',
          duration: 210,
          query: `${q} audio`
        }
      ];
    }

    setSearchResults(tracks);

    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setDuration(tracks[0].duration || 210);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    searchMusic('Lofi Chill Study Beats');
  }, []);

  // Play track using either HTMLAudio preview (preferred) or YouTube search playlist as fallback
  const playTrack = (track) => {
    if (!track) return;

    setCurrentTrack(track);
    setDuration(track.duration || 210);
    setCurrentTime(0);

    // Pause YouTube if switching to audio
    try {
      const player = ytPlayerRef.current;
      if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
    } catch (e) {}

    // Pause HTMLAudio if switching to YouTube
    try {
      if (audioRef.current) audioRef.current.pause();
    } catch (e) {}

    // If iTunes provides a previewUrl, play via HTMLAudio for reliable playback
    if (track.previewUrl) {
      currentSourceRef.current = 'audio';
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      try {
        audio.src = track.previewUrl;
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('Audio preview play blocked:', err);
            setIsPlaying(false);
          });
        } else {
          setIsPlaying(true);
        }
      } catch (e) {
        console.error('Audio preview error:', e);
        setIsPlaying(false);
      }

      return;
    }

    // Fallback to YouTube playlist loading or direct video play
    currentSourceRef.current = 'yt';
    setIsPlaying(true);
    let player = ytPlayerRef.current;

    const loadAndPlay = () => {
      player = ytPlayerRef.current;
      if (!player) return;
      try {
        // If we have a direct video id from Invidious search
        if (track.id && track.id.length === 11) {
          player.loadVideoById({
            videoId: track.id,
            suggestedQuality: 'small'
          });
        } else if (typeof player.loadPlaylist === 'function') {
          player.loadPlaylist({
            listType: 'search',
            list: track.query || `${track.title} ${track.artist} audio`,
            index: 0,
            suggestedQuality: 'small'
          });
        }
        try { if (player && typeof player.playVideo === 'function') player.playVideo(); } catch (e) {}
      } catch (err) {
        console.error('Player load error:', err);
      }
    };

    if (player && isPlayerReadyRef.current) {
      loadAndPlay();
      return;
    }

    // Player not yet ready: poll until ready (timeout after 8s)
    const waiter = setInterval(() => {
      if (ytPlayerRef.current && isPlayerReadyRef.current) {
        clearInterval(waiter);
        loadAndPlay();
      }
    }, 300);

    setTimeout(() => clearInterval(waiter), 8000);
  };

  const playRandomNextSong = () => {
    const list = searchResultsRef.current;
    if (!list || list.length === 0) return;
    if (list.length === 1) {
      playTrack(list[0]);
      return;
    }

    let randomIndex;
    let attempts = 0;
    do {
      randomIndex = Math.floor(Math.random() * list.length);
      attempts++;
    } while (list[randomIndex]?.id === currentTrackRef.current?.id && attempts < 10);

    playTrack(list[randomIndex]);
  };

  const togglePlayPause = () => {
    if (!currentTrack) {
      if (searchResults.length > 0) playTrack(searchResults[0]);
      return;
    }

    if (currentSourceRef.current === 'audio') {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        try { audio.pause(); } catch (e) {}
        setIsPlaying(false);
      } else {
        try {
          const p = audio.play();
          if (p && typeof p.then === 'function') {
            p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            setIsPlaying(true);
          }
        } catch (e) { setIsPlaying(false); }
      }
      return;
    }

    // default: YouTube player
    const player = ytPlayerRef.current;
    if (isPlaying) {
      if (player && typeof player.pauseVideo === 'function') {
        try { player.pauseVideo(); } catch (e) {}
      }
      setIsPlaying(false);
    } else {
      if (player && typeof player.playVideo === 'function') {
        try { player.playVideo(); } catch (e) {}
      }
      setIsPlaying(true);
    }
  };

  const seekTime = (newTime) => {
    if (currentSourceRef.current === 'audio') {
      const audio = audioRef.current;
      if (audio) {
        try { audio.currentTime = newTime; setCurrentTime(newTime); } catch (e) {}
      }
      return;
    }

    const player = ytPlayerRef.current;
    if (player && typeof player.seekTo === 'function') {
      try {
        player.seekTo(newTime, true);
        setCurrentTime(newTime);
      } catch (e) {}
    }
  };

  const changeVolume = (newVol) => {
    if (currentSourceRef.current === 'audio') {
      const audio = audioRef.current;
      if (audio) {
        try { audio.volume = Math.max(0, Math.min(1, newVol)); } catch (e) {}
      }
      setVolume(newVol);
      return;
    }

    const player = ytPlayerRef.current;
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(Math.round(newVol * 100));
      } catch (e) {}
    }
    setVolume(newVol);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const toggleAutoRandom = () => {
    setIsAutoRandom(!isAutoRandom);
  };

  const unlockAudio = async () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        if (ctx.state === 'suspended') await ctx.resume();
      }
    } catch (e) {
      // ignore
    }

    const player = ytPlayerRef.current;
    if (player && typeof player.playVideo === 'function') {
      try {
        // This call is triggered by a user click (gesture) from the UI; it should allow autoplay to start.
        player.playVideo();
        player.pauseVideo();
      } catch (e) {}
    }

    // Also try to unlock HTMLAudio element
    try {
      if (!audioRef.current) audioRef.current = new Audio();
      const a = audioRef.current;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(() => { a.pause(); }).catch(() => {});
      } else { a.pause(); }
    } catch (e) {}

    setAudioUnlocked(true);
  };

  const playNextTrack = () => {
    const list = searchResultsRef.current;
    if (!list || list.length === 0) return;
    const currentIndex = list.findIndex(t => t.id === currentTrackRef.current?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    playTrack(list[nextIndex]);
  };

  const playPrevTrack = () => {
    const list = searchResultsRef.current;
    if (!list || list.length === 0) return;
    const currentIndex = list.findIndex(t => t.id === currentTrackRef.current?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    playTrack(list[prevIndex]);
  };

  return (
    <MusicContext.Provider value={{
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
    }}>
      {/* 
        This is the invisible player frame. 
        We size it at 200x200 so the browser allows background execution and autoplay,
        but we style it with absolute positioning off the edge of screen and set opacity to 0.01.
        It is 100% hidden from the user, but fully functional!
      */}
      <div 
        style={{
          position: 'fixed',
          bottom: '-1000px',
          right: '-1000px',
          width: '200px',
          height: '200px',
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -9999
        }}
      >
        <div id="yt-bg-player"></div>
      </div>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  return ctx || {
    searchResults: [],
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 210,
    volume: 0.85,
    isAutoRandom: true,
    isLooping: false,
    isLoading: false,
    searchQuery: '',
    searchMusic: () => {},
    playTrack: () => {},
    togglePlayPause: () => {},
    seekTime: () => {},
    changeVolume: () => {},
    toggleLoop: () => {},
    toggleAutoRandom: () => {},
    playNextTrack: () => {},
    playPrevTrack: () => {},
    playRandomNextSong: () => {}
  };
}

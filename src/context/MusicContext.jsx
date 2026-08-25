import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);
  const [volume, setVolume] = useState(0.85);
  const [isAutoRandom, setIsAutoRandom] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Lofi Study Chill');
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const ytPlayerRef = useRef(null);
  const isPlayerReadyRef = useRef(false);
  const searchResultsRef = useRef([]);
  const currentTrackRef = useRef(null);
  const isAutoRandomRef = useRef(false);
  const isLoopingRef = useRef(false);
  const isAutoplayRef = useRef(true);
  // HTMLAudio fallback for reliable playback (iTunes previewUrl)
  const audioRef = useRef(null);
  const currentSourceRef = useRef('yt'); // 'yt' or 'audio'
  const audioReadyRef = useRef(false);
  const searchCacheRef = useRef({});
  const ytUrlCacheRef = useRef({});
  searchResultsRef.current = searchResults;
  currentTrackRef.current = currentTrack;
  isAutoRandomRef.current = isAutoRandom;
  isLoopingRef.current = isLooping;
  isAutoplayRef.current = isAutoplay;

  // Initialize YouTube Player
  useEffect(() => {
    let checkInterval = null;
    let attempts = 0;

    const initPlayer = () => {
      if (window.YT && window.YT.Player && !ytPlayerRef.current) {
        if (checkInterval) clearInterval(checkInterval);
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
                } else if (isAutoplayRef.current) {
                  if (isAutoRandomRef.current) {
                    playRandomNextSong();
                  } else {
                    playNextTrack();
                  }
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
      
      // Poll as a fallback in case onYouTubeIframeAPIReady is missed
      checkInterval = setInterval(() => {
        attempts++;
        if (window.YT && window.YT.Player) {
          initPlayer();
        }
        if (attempts > 50) { // Stop after 5 seconds
          clearInterval(checkInterval);
        }
      }, 100);

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

    return () => {
      clearInterval(interval);
      if (checkInterval) clearInterval(checkInterval);
    };
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
    'https://invidious.flokinet.to',
    'https://invidious.jing.rocks',
    'https://invidious.privacydev.net',
    'https://invidious.no-logs.com',
    'https://invidious.perennialte.ch',
    'https://invidious.nerdvpn.de'
  ];

  // Search songs globally
  const searchMusic = async (term) => {
    if (!term || !term.trim()) return;
    const q = term.trim();
    const cacheKey = q.toLowerCase();

    // Zero-latency RAM cache hit (Electric Speed!)
    if (searchCacheRef.current[cacheKey]) {
      const cachedTracks = searchCacheRef.current[cacheKey];
      setSearchResults(cachedTracks);
      setSearchQuery(q);
      if (cachedTracks.length > 0) {
        setCurrentTrack(cachedTracks[0]);
        setDuration(cachedTracks[0].duration || 210);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchQuery(q);

    let tracks = [];
    let searchSuccessful = false;

    // Fetch from a single Invidious instance helper
    const fetchInstance = async (instance) => {
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(q + ' audio')}&type=video`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s abort timeout
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            return data.map((item) => {
              const duration = item.lengthSeconds || 240;
              return {
                id: item.videoId,
                title: item.title,
                artist: item.author || 'YouTube Audio',
                album: 'YouTube Stream',
                artwork: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
                genre: 'Study Focus',
                duration: duration,
                previewUrl: null,
                query: item.videoId
              };
            });
          }
        }
        throw new Error('Empty or invalid results');
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    // Fetch from iTunes Search API helper
    const fetchITunes = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6050); // 6s abort timeout
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=30`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.results && data.results.length > 0) {
            return data.results.map((item) => {
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
          }
        }
        throw new Error('Empty iTunes results');
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    // Try parallel fetches concurrently using Promise.any
    try {
      const promises = [
        fetchITunes(),
        ...INVIDIOUS_INSTANCES.map((instance) => fetchInstance(instance))
      ];
      tracks = await Promise.any(promises);
      searchSuccessful = true;
    } catch (err) {
      console.warn('All concurrent search requests failed or timed out:', err);
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
    searchCacheRef.current[cacheKey] = tracks; // Store in memory cache

    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setDuration(tracks[0].duration || 210);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial default search
    searchMusic('Lofi Chill Study Beats');

    // Preset queries for background pre-fetching
    const presets = [
      'Lofi Chill Study Beats',
      'Deep Focus Ambient',
      'Rain Nature Soundscape',
      'Acoustic Instrumental Piano Guitar',
      'Synthwave Study Chill'
    ];

    // Background prefetch task to cache other preset moods in RAM (0ms switches)
    const prefetchTimer = setTimeout(() => {
      presets.forEach(async (preset) => {
        const cacheKey = preset.toLowerCase();
        if (searchCacheRef.current[cacheKey]) return; // already cached
        try {
          const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(preset)}&media=music&entity=song&limit=30`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.results && data.results.length > 0) {
              const mapped = data.results.map((item) => {
                const rawDuration = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210;
                const artwork = item.artworkUrl100
                  ? item.artworkUrl100.replace('100x100bb', '600x600bb')
                  : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';

                return {
                  id: String(item.trackId || item.collectionId || Math.random()),
                  title: item.trackName || preset,
                  artist: item.artistName || 'Artist',
                  album: item.collectionName || 'Single',
                  artwork: artwork,
                  genre: item.primaryGenreName || 'Music',
                  duration: rawDuration,
                  previewUrl: item.previewUrl || null,
                  query: `${item.trackName} ${item.artistName} audio`
                };
              });
              searchCacheRef.current[cacheKey] = mapped;
            }
          }
        } catch (e) {}
      });
    }, 1500);

    return () => clearTimeout(prefetchTimer);
  }, []);

  // Helper to sanitize search strings for 100% reliable matching on YouTube
  const cleanSearchQuery = (title, artist) => {
    let cleanTitle = title.replace(/\([^)]*\)/g, '');
    cleanTitle = cleanTitle.replace(/\[[^\]]*\]/g, '');
    cleanTitle = cleanTitle.replace(/official\s+video|official\s+audio|lyric\s+video|remastered|remaster/gi, '');
    
    let cleanArtist = artist.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
    cleanArtist = cleanArtist.replace(/&|feat\.|ft\./gi, ' ');

    return `${cleanTitle.trim()} ${cleanArtist.trim()} audio`.replace(/\s+/g, ' ').trim();
  };

  // Resolve search term to a real YouTube video ID using Invidious racing
  const resolveYTVideoId = async (track) => {
    if (track.id && track.id.length === 11) return track.id;
    if (ytUrlCacheRef.current[track.id]) return ytUrlCacheRef.current[track.id];

    // Concurrently race Invidious/Piped instances for a given query string
    const raceInstances = async (searchQueryString) => {
      const fetchInvidious = async (instance) => {
        const url = `${instance}/api/v1/search?q=${encodeURIComponent(searchQueryString)}&type=video`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0 && data[0].videoId) {
              return data[0].videoId;
            }
          }
          throw new Error('No Invidious videoId');
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      const PIPED_INSTANCES = [
        'https://pipedapi.kavin.rocks',
        'https://pipedapi.tokhmi.xyz',
        'https://pipedapi.leptons.xyz',
        'https://pipedapi.privacydev.net',
        'https://pipedapi.col.re',
        'https://pipedapi.swish.re'
      ];

      const fetchPiped = async (instance) => {
        const url = `${instance}/search?q=${encodeURIComponent(searchQueryString)}&filter=videos`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
        try {
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.items && data.items.length > 0) {
              const item = data.items[0];
              if (item.url) {
                const videoId = item.url.split('v=')[1];
                if (videoId && videoId.length === 11) {
                  return videoId;
                }
              }
            }
          }
          throw new Error('No Piped videoId');
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      try {
        const promises = [
          ...INVIDIOUS_INSTANCES.map((inst) => fetchInvidious(inst)),
          ...PIPED_INSTANCES.map((inst) => fetchPiped(inst))
        ];
        return await Promise.any(promises);
      } catch (e) {
        return null;
      }
    };

    // Try 1: Clean query (title + artist)
    const q1 = cleanSearchQuery(track.title, track.artist);
    let resolved = await raceInstances(q1);
    if (resolved) {
      ytUrlCacheRef.current[track.id] = resolved;
      return resolved;
    }

    // Try 2: Super simple query (just title)
    const q2 = `${track.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim()} audio`;
    resolved = await raceInstances(q2);
    if (resolved) {
      ytUrlCacheRef.current[track.id] = resolved;
      return resolved;
    }

    return null;
  };

  // Background pre-resolution of the next 3 tracks' video IDs to warm up the cache
  useEffect(() => {
    if (!currentTrack || searchResults.length === 0) return;
    const idx = searchResults.findIndex((t) => t.id === currentTrack.id);
    if (idx !== -1) {
      for (let i = 1; i <= 3; i++) {
        const nextTrack = searchResults[(idx + i) % searchResults.length];
        if (nextTrack) {
          resolveYTVideoId(nextTrack).catch(() => {});
        }
      }
    }
  }, [currentTrack, searchResults]);

  // Play track using background YouTube player stream for full-length support
  const playTrack = (track) => {
    if (!track) return;

    setCurrentTrack(track);
    setDuration(track.duration || 210);
    setCurrentTime(0);

    // Force YouTube background playback for all tracks (ensuring full-length audio stream)
    currentSourceRef.current = 'yt';
    setIsPlaying(true);

    // Pause HTMLAudio
    try {
      if (audioRef.current) audioRef.current.pause();
    } catch (e) {}

    const videoId = (track.id && track.id.length === 11)
      ? track.id
      : ytUrlCacheRef.current[track.id];

    let player = ytPlayerRef.current;
    const loadAndPlay = (resolvedId) => {
      player = ytPlayerRef.current;
      if (!player) return;
      try {
        if (resolvedId) {
          currentSourceRef.current = 'yt';
          player.loadVideoById({
            videoId: resolvedId,
            suggestedQuality: 'small'
          });
          try { if (player && typeof player.playVideo === 'function') player.playVideo(); } catch (e) {}
        } else if (track.previewUrl) {
          // Play 30-sec preview clip fallback via HTML5 Audio
          console.warn("YouTube resolution failed. Falling back to iTunes previewUrl.");
          currentSourceRef.current = 'audio';
          
          if (!audioRef.current) audioRef.current = new Audio();
          const audio = audioRef.current;
          audio.src = track.previewUrl;
          audio.volume = volume;
          audio.currentTime = 0;
          
          // Pause YouTube player if active
          try {
            if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
          } catch (e) {}

          audio.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.error("Preview audio play failed:", err);
            setIsPlaying(false);
          });
        } else {
          // Final absolute fallback if no previewUrl: try playPlaylist search query
          currentSourceRef.current = 'yt';
          if (typeof player.loadPlaylist === 'function') {
            player.loadPlaylist({
              listType: 'search',
              list: track.query || `${track.title} ${track.artist} audio`,
              index: 0,
              suggestedQuality: 'small'
            });
          }
          try { if (player && typeof player.playVideo === 'function') player.playVideo(); } catch (e) {}
        }
      } catch (err) {
        console.error('Player load error:', err);
      }
    };

    // Case 1: Video ID is already resolved & cached (Runs strictly synchronously, enabling background autoplay!)
    if (videoId) {
      if (player && isPlayerReadyRef.current) {
        loadAndPlay(videoId);
      } else {
        const waiter = setInterval(() => {
          if (ytPlayerRef.current && isPlayerReadyRef.current) {
            clearInterval(waiter);
            loadAndPlay(videoId);
          }
        }, 300);
        setTimeout(() => clearInterval(waiter), 8000);
      }
      return;
    }

    // Case 2: Asynchronous resolution fallback (if not pre-resolved)
    setIsLoading(true);
    resolveYTVideoId(track).then((resolvedId) => {
      setIsLoading(false);
      if (player && isPlayerReadyRef.current) {
        loadAndPlay(resolvedId);
      } else {
        const waiter = setInterval(() => {
          if (ytPlayerRef.current && isPlayerReadyRef.current) {
            clearInterval(waiter);
            loadAndPlay(resolvedId);
          }
        }, 300);
        setTimeout(() => clearInterval(waiter), 8000);
      }
    }).catch((err) => {
      console.error("Resolution error:", err);
      setIsLoading(false);
    });
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
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }

    const player = ytPlayerRef.current;
    if (player && isPlayerReadyRef.current) {
      if (isPlaying) {
        player.pauseVideo();
        setIsPlaying(false);
      } else {
        player.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const seekTime = (secs) => {
    setCurrentTime(secs);
    if (currentSourceRef.current === 'audio' && audioRef.current) {
      audioRef.current.currentTime = secs;
      return;
    }
    const player = ytPlayerRef.current;
    if (player && isPlayerReadyRef.current && typeof player.seekTo === 'function') {
      player.seekTo(secs, true);
    }
  };

  const changeVolume = (val) => {
    const cleanVolume = Math.max(0, Math.min(1, val));
    setVolume(cleanVolume);

    if (audioRef.current) {
      audioRef.current.volume = cleanVolume;
    }

    const player = ytPlayerRef.current;
    if (player && isPlayerReadyRef.current && typeof player.setVolume === 'function') {
      player.setVolume(Math.round(cleanVolume * 100));
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const toggleAutoRandom = () => {
    setIsAutoRandom(!isAutoRandom);
  };

  const toggleAutoplay = () => {
    setIsAutoplay(!isAutoplay);
  };

  const unlockAudio = () => {
    setAudioUnlocked(true);
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      try {
        const dummy = new AC();
        dummy.resume();
      } catch (e) {}
    }
    if (audioRef.current) {
      audioRef.current.play().then(() => audioRef.current.pause()).catch(() => {});
    }
  };

  const playNextTrack = () => {
    const list = searchResultsRef.current;
    const current = currentTrackRef.current;
    if (!list || list.length === 0) return;
    if (!current) {
      playTrack(list[0]);
      return;
    }
    const idx = list.findIndex((t) => t.id === current.id);
    if (idx !== -1 && idx < list.length - 1) {
      playTrack(list[idx + 1]);
    } else {
      playTrack(list[0]);
    }
  };

  const playPrevTrack = () => {
    const list = searchResultsRef.current;
    const current = currentTrackRef.current;
    if (!list || list.length === 0) return;
    if (!current) {
      playTrack(list[0]);
      return;
    }
    const idx = list.findIndex((t) => t.id === current.id);
    if (idx !== -1 && idx > 0) {
      playTrack(list[idx - 1]);
    } else {
      playTrack(list[list.length - 1]);
    }
  };

  return (
    <MusicContext.Provider
      value={{
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
      }}
    >
      <div 
        style={{
          position: 'fixed',
          bottom: '0px',
          right: '0px',
          width: '1px',
          height: '1px',
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: 9999
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
    isAutoRandom: false,
    isLooping: false,
    isAutoplay: true,
    isLoading: false,
    searchQuery: '',
    searchMusic: () => {},
    playTrack: () => {},
    togglePlayPause: () => {},
    seekTime: () => {},
    changeVolume: () => {},
    toggleLoop: () => {},
    toggleAutoRandom: () => {},
    toggleAutoplay: () => {},
    playNextTrack: () => {},
    playPrevTrack: () => {},
    playRandomNextSong: () => {}
  };
}

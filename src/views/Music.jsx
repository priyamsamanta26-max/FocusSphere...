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
      
      if (!document.getElementById('yt-iframe-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

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

  // HTMLAudio fallback for previews
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

  const INVIDIOUS_INSTANCES = [
    'https://yewtu.be',
    'https://invidious.lunar.icu',
    'https://invidious.projectsegfau.lt',
    'https://inv.tux.im',
    'https://invidious.flokinet.to'
  ];

  // Search songs globally in parallel
  const searchMusic = async (term) => {
    if (!term || !term.trim()) return;
    setIsLoading(true);
    const q = term.trim();
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

    // Try parallel Invidious fetches concurrently using Promise.any
    try {
      const promises = INVIDIOUS_INSTANCES.map((instance) => fetchInstance(instance));
      tracks = await Promise.any(promises);
      searchSuccessful = true;
    } catch (err) {
      console.warn('All concurrent Invidious requests failed or timed out:', err);
    }

    // Fallback to iTunes Search API
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

  const playTrack = (track) => {
    if (!track) return;
    setCurrentTrack(track);
    setDuration(track.duration || 210);
    setCurrentTime(0);

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    } catch (e) {}

    if (track.previewUrl) {
      currentSourceRef.current = 'audio';
      setIsPlaying(false);
      audioReadyRef.current = false;
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.volume = volume;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    } else {
      currentSourceRef.current = 'yt';
      setIsPlaying(false);
      const player = ytPlayerRef.current;
      if (player && isPlayerReadyRef.current && typeof player.loadVideoById === 'function') {
        player.loadVideoById({
          videoId: track.id,
          suggestedQuality: 'small'
        });
        player.setVolume(Math.round(volume * 100));
        player.playVideo();
      } else {
        // Fallback search resolver
        const instance = INVIDIOUS_INSTANCES[Math.floor(Math.random() * INVIDIOUS_INSTANCES.length)];
        fetch(`${instance}/api/v1/search?q=${encodeURIComponent(track.query)}&type=video`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0 && data[0].videoId) {
              const videoId = data[0].videoId;
              if (player && isPlayerReadyRef.current && typeof player.loadVideoById === 'function') {
                player.loadVideoById({
                  videoId: videoId,
                  suggestedQuality: 'small'
                });
                player.playVideo();
              }
            }
          })
          .catch((err) => console.error('Audio resolve error:', err));
      }
    }
  };

  const togglePlayPause = () => {
    if (currentSourceRef.current === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
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

  const playRandomNextSong = () => {
    const list = searchResultsRef.current;
    if (!list || list.length === 0) return;
    const randIdx = Math.floor(Math.random() * list.length);
    playTrack(list[randIdx]);
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
      }}
    >
      {children}
      <div id="yt-bg-player" style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none', opacity: 0 }} />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}

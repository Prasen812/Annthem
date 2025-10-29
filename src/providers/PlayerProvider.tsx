
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import type { Song, QueueItem } from '@/types';

// This utility function is now defined inside the provider module
// to ensure it's only part of the client-side bundle.
const getSongById = (id: string, allSongs: Song[]): Song | undefined => {
  if (!allSongs || allSongs.length === 0) {
    return undefined;
  }
  return allSongs.find((song) => song.id === id);
};


interface PlayerState {
  songs: Song[];
  queue: QueueItem[];
  originalQueue: QueueItem[]; // For shuffle functionality
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  expandedSongId: string | null;
  currentTime: number;
  duration: number;
  isFullScreen: boolean;
}

type PlayerAction =
  | { type: 'LOAD_SONGS'; payload: Song[] }
  | { type: 'PLAY_PAUSE' }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'PLAY_SONG'; payload: { song: Song; originTrackId?: string } }
  | { type: 'PLAY_NEXT' }
  | { type: 'PLAY_PREV' }
  | { type: 'HANDLE_TRACK_END' }
  | { type: 'SET_QUEUE'; payload: QueueItem[] }
  | { type: 'ADD_TO_QUEUE'; payload: QueueItem }
  | { type: 'SET_EXPANDED_SONG'; payload: { song: Song; recommendations: Song[] } }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'UPDATE_TIME'; payload: { currentTime: number; duration: number } };

const initialState: PlayerState = {
  songs: [],
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isShuffled: false,
  repeatMode: 'none',
  expandedSongId: null,
  currentTime: 0,
  duration: 0,
  isFullScreen: false,
};

const PlayerContext = createContext<{
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  audioRef: React.RefObject<HTMLAudioElement>;
  seek: (time: number) => void;
} | null>(null);

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'LOAD_SONGS':
      // This logic ensures we don't wipe the songs array if it's already populated.
      // And initializes the player with the full list of songs.
      if (state.songs.length > 0) {
        return state;
      }
      return { ...state, songs: action.payload };

    case 'PLAY_PAUSE':
      if (state.queue.length === 0) return state;
      return { ...state, isPlaying: !state.isPlaying };
    
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };

    case 'PLAY_SONG': {
      const { song } = action.payload;
      const newQueueItem: QueueItem = {
        id: `queue-${song.id}-${Date.now()}`,
        song,
        source: action.payload.originTrackId ? 'recommendation' : 'mainList',
        addedAt: Date.now(),
        originTrackId: action.payload.originTrackId,
      };

      const existingIndex = state.queue.findIndex((item) => item.song.id === song.id);
      if (existingIndex !== -1) {
        return { ...state, currentIndex: existingIndex, isPlaying: true };
      }
      
      const newQueue = [...state.queue, newQueueItem];
      return { ...state, queue: newQueue, currentIndex: newQueue.length - 1, isPlaying: true };
    }

    case 'SET_EXPANDED_SONG': {
      const { song, recommendations } = action.payload;
      if (!song) {
        return { ...state, expandedSongId: null };
      }

      // If already expanded, just return
      if (state.expandedSongId === song.id) return state;

      const recQueueItems: QueueItem[] = recommendations
        .map((recSong) => {
          if (state.queue.find((item) => item.song.id === recSong.id)) return null;
          return {
            id: `queue-${recSong.id}-${Date.now()}`,
            song: recSong,
            source: 'recommendation',
            addedAt: Date.now(),
            originTrackId: song.id,
          };
        })
        .filter((item): item is QueueItem => item !== null);

      if (recQueueItems.length === 0) {
        const currentSongInQueue = state.queue.find(q => q.song.id === song.id);
        if (!currentSongInQueue) {
             const songToAdd = state.songs.find(s => s.id === song.id);
             if (songToAdd) {
                const newItem: QueueItem = { id: `queue-${songToAdd.id}-${Date.now()}`, song: songToAdd, source: 'mainList', addedAt: Date.now() };
                const newQueue = [...state.queue, newItem];
                return { ...state, expandedSongId: song.id, queue: newQueue, currentIndex: newQueue.length -1, isPlaying: true };
             }
        }
        return { ...state, expandedSongId: song.id, isPlaying: state.queue.length > 0 };
      }
      
      const insertionIndex = state.currentIndex + 1;
      const newQueue = [...state.queue.slice(0, insertionIndex), ...recQueueItems, ...state.queue.slice(insertionIndex)];
      
      return { ...state, expandedSongId: song.id, queue: newQueue, currentIndex: insertionIndex, isPlaying: true };
    }
    
    case 'HANDLE_TRACK_END': {
        const currentItem = state.queue[state.currentIndex];

        if (currentItem?.source === 'recommendation' && currentItem.originTrackId) {
            const originSongIndex = state.songs.findIndex(s => s.id === currentItem.originTrackId);
            if (originSongIndex > -1 && originSongIndex < state.songs.length - 1) {
                const lowerSong = state.songs[originSongIndex + 1];
                if (lowerSong && !state.queue.find(item => item.song.id === lowerSong.id)) {
                    const newItem: QueueItem = {
                        id: `queue-${lowerSong.id}-${Date.now()}`,
                        song: lowerSong,
                        source: 'mainList',
                        addedAt: Date.now(),
                    };
                     state.queue.push(newItem);
                }
            }
        }
        
        if (state.repeatMode === 'one') {
            return { ...state, isPlaying: true, currentTime: 0 };
        }

        const nextIndex = state.currentIndex + 1;
        if (nextIndex < state.queue.length) {
            return { ...state, currentIndex: nextIndex, isPlaying: true };
        }

        if (state.repeatMode === 'all') {
            return { ...state, currentIndex: 0, isPlaying: true };
        }

        return { ...state, isPlaying: false };
    }

    case 'PLAY_NEXT': {
      if (state.queue.length === 0) return state;
      const nextIndex = (state.currentIndex + 1) % state.queue.length;
      return { ...state, currentIndex: nextIndex, isPlaying: true };
    }

    case 'PLAY_PREV': {
      if (state.queue.length === 0) return state;
      const prevIndex = (state.currentIndex - 1 + state.queue.length) % state.queue.length;
      return { ...state, currentIndex: prevIndex, isPlaying: true };
    }

    case 'TOGGLE_SHUFFLE': {
      const isShuffled = !state.isShuffled;
      if (isShuffled) {
        const currentSong = state.queue[state.currentIndex];
        const restOfQueue = state.queue.filter((_, index) => index !== state.currentIndex);
        const shuffledRest = restOfQueue.sort(() => Math.random() - 0.5);
        const newQueue = currentSong ? [currentSong, ...shuffledRest] : shuffledRest;
        return {
          ...state,
          isShuffled,
          queue: newQueue,
          originalQueue: state.queue,
          currentIndex: 0,
        };
      } else {
        const currentSongId = state.queue[state.currentIndex]?.id;
        const newCurrentIndex = state.originalQueue.findIndex(item => item.id === currentSongId);
        return {
          ...state,
          isShuffled,
          queue: state.originalQueue,
          currentIndex: newCurrentIndex > -1 ? newCurrentIndex : 0,
        };
      }
    }
    
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullScreen: !state.isFullScreen };

    case 'UPDATE_TIME':
      if (state.isPlaying) {
        return { ...state, currentTime: action.payload.currentTime, duration: action.payload.duration };
      }
      return { ...state, duration: action.payload.duration };


    default:
      return state;
  }
};

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeSong = state.queue[state.currentIndex]?.song;

  useEffect(() => {
    if (audioRef.current) {
        state.isPlaying ? audioRef.current.play().catch(e => console.error("Playback error:", e)) : audioRef.current.pause();
    }
  }, [state.isPlaying, activeSong]);

  useEffect(() => {
      if (audioRef.current && activeSong) {
          if (audioRef.current.src !== activeSong.audioUrl) {
            audioRef.current.src = activeSong.audioUrl;
          }
          if(state.isPlaying) {
             audioRef.current.play().catch(e => console.error("Playback error on song change:", e));
          }
      }
  }, [activeSong, state.isPlaying]);
  
  const handleTimeUpdate = () => {
      if (audioRef.current) {
          dispatch({ type: 'UPDATE_TIME', payload: { currentTime: audioRef.current.currentTime, duration: audioRef.current.duration }});
      }
  };

  const handleTrackEnd = () => {
      dispatch({ type: 'HANDLE_TRACK_END' });
  };
  
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
    }
  }, []);

  return (
    <PlayerContext.Provider value={{ state, dispatch, audioRef, seek }}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  
  const { state, dispatch, ...rest } = context;

  const expandAndPlayRecommendations = (song: Song) => {
    const songWithRecs = getSongById(song.id, state.songs);
    const recommendations = songWithRecs?.recommendations
        .map(r => getSongById(r.songId, state.songs))
        .filter((s): s is Song => !!s) || [];
    dispatch({ type: 'SET_EXPANDED_SONG', payload: { song, recommendations } });
  };
  
  const playPause = () => dispatch({ type: 'PLAY_PAUSE' });
  const playNext = () => dispatch({ type: 'PLAY_NEXT' });
  const playPrev = () => dispatch({ type: 'PLAY_PREV' });
  const toggleShuffle = () => dispatch({ type: 'TOGGLE_SHUFFLE' });
  const toggleFullScreen = () => dispatch({ type: 'TOGGLE_FULLSCREEN' });
  const loadSongs = useCallback((songs: Song[]) => dispatch({ type: 'LOAD_SONGS', payload: songs}), [dispatch]);

  return {
    ...state,
    ...rest,
    activeSong: state.queue[state.currentIndex]?.song,
    expandAndPlayRecommendations,
    playPause,
    playNext,
    playPrev,
    toggleShuffle,
    toggleFullScreen,
    loadSongs,
  };
};

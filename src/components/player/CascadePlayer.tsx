'use client';

import { useEffect } from 'react';
import { usePlayer } from '@/providers/PlayerProvider';
import type { Song } from '@/types';
import { Player } from './Player';

interface CascadePlayerProps {
  songs: Song[];
}

export function CascadePlayer({ songs }: CascadePlayerProps) {
  const { loadSongs, songs: playerSongs } = usePlayer();

  useEffect(() => {
    // We only load the songs if the player doesn't have any yet.
    // This prevents re-loading if the component re-renders.
    if (playerSongs.length === 0) {
      loadSongs(songs);
    }
  }, [loadSongs, songs, playerSongs.length]);

  return (
    <div className="fixed bottom-0 bg-black w-full py-2 h-[80px] px-4">
        <Player />
    </div>
  );
}

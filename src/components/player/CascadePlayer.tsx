'use client';

import { useEffect } from 'react';
import { usePlayer } from '@/providers/PlayerProvider';
import songs from '@/data/songs';
import { Player } from './Player';

export function CascadePlayer() {
  const { loadSongs, songs: playerSongs } = usePlayer();

  useEffect(() => {
    if (playerSongs.length === 0) {
      loadSongs(songs);
    }
  }, [loadSongs, playerSongs.length]);

  return (
    <div className="fixed bottom-0 bg-black w-full py-2 h-[80px] px-4">
        <Player />
    </div>
  );
}

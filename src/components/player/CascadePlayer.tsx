'use client';

import { useEffect } from 'react';
import { usePlayer } from '@/providers/PlayerProvider';
import songs from '@/data/songs';
import { SongList } from './SongList';
import { Player } from './Player';

export function CascadePlayer() {
  const { loadSongs, songs: playerSongs } = usePlayer();

  useEffect(() => {
    if (playerSongs.length === 0) {
      loadSongs(songs);
    }
  }, [loadSongs, playerSongs.length]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)]">
        <div className="container mx-auto px-4 py-8 h-full overflow-y-auto pb-32">
            <h1 className="text-4xl font-headline font-bold mb-8 tracking-tight">Listen Now</h1>
            <SongList />
        </div>
        <Player />
    </div>
  );
}

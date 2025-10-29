'use client';

import type { Song } from '@/types';
import { SongCard } from './SongCard';

interface SongListProps {
  songs: Song[];
}

export function SongList({ songs }: SongListProps) {
  if (songs.length === 0) {
    return <div className="mt-4 text-neutral-400">No songs available.</div>;
  }

  return (
    <div className="flex flex-col gap-y-2 w-full">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}

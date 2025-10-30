
'use client';

import Image from 'next/image';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/providers/PlayerProvider';
import { Pause, Play } from 'lucide-react';
import { SongCoverPlaceholder } from './SongCoverPlaceholder';

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { activeSong, isPlaying, expandAndPlayRecommendations } = usePlayer();
  const isThisSongActive = activeSong?.id === song.id;

  const handlePlay = () => {
    expandAndPlayRecommendations(song);
  };

  return (
    <div
      onClick={handlePlay}
      className={cn(
        'flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md transition',
        isThisSongActive && 'bg-neutral-800'
      )}
    >
      <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
        {song.coverUrl ? (
            <Image fill src={song.coverUrl} alt={song.title} className="object-cover" data-ai-hint="album art" />
        ) : (
            <SongCoverPlaceholder song={song} />
        )}
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className={cn('truncate', isThisSongActive ? 'text-primary' : 'text-white')}>
          {song.title}
        </p>
        {song.artists.length > 0 && (
          <p className="text-neutral-400 text-sm truncate">{song.artists.join(', ')}</p>
        )}
      </div>
      {isThisSongActive && (
        <div className="ml-auto pr-4">
          {isPlaying ? <Pause className="h-5 w-5 text-primary" /> : <Play className="h-5 w-5 text-primary" />}
        </div>
      )}
    </div>
  );
}
